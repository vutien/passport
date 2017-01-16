var express = require('express');
var router = express.Router();

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: "1760188647535176",
    clientSecret: "89e1b5ac2fb488cc0ce99431fa4ee804",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    db.user.find({where:{
      username: profile.id
    }}).then(function(result){
      if (result){
        return done(null, result);
      }
      var newUser = {
        username: profile.id,
        name: profile.displayName,
        email: 'hihi@yahoo.com',
        profileImage: 'noimage.png'
      }
      db.user.create(newUser).then(function(user){
        done(null, user);
      })
    }).catch(function(err){
      done(err);
    })
  }
));

/* GET home page. */
router.get('/', checkAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Members' });
});

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: 'users/login' }));

function checkAuthenticated(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/users/login');
  }
}
module.exports = router;
