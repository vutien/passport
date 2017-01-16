var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var fileLoad = upload.single('profileImage');

var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
//var bcrypt = requrie('bcrypt');

passport.serializeUser(function(user, done){
	//req.session.passport.user
	done(null, user.id);
})
passport.deserializeUser(function(id, done){
	db.user.findById(id).then(function(user){
		done(null, user);
	}).catch(function(err){
		console.log(err);
	})
})
passport.use(new LocalStrategy(
	function(username, password, done){
		db.user.find({where:{
			username: username
		}}).then(function(user){
			if (password == user.password){
				return done(null, user);
			}
			//req.user
			return done(null, false, {message: 'Incorrect username and password'});
			// bcrypt.compare(passport, user.password, function(err, result){
			// 	if (err) {return done(err);}
			// 	if (!result){
			// 		return done(null, false, {message: 'Incorrect username and password'})
			// 	}
			// 	return done(null, user);
			// })
		}).catch(function(err){
			return done(err);
		})
	}
))

/* GET users listing. */
router.get('/', function (req, res, next) {
	res.send('respond with a resource');
});

router.route('/register')
	.get(function (req, res) {
		res.render('register', {
			'title': 'Register'
		});
	})
	.post(fileLoad, function (req, res) {
		var name = req.body.name;
		var email = req.body.email;
		var username = req.body.username;
		var password = req.body.password;
		var passwordConfirm = req.body.password2;
		if (req.file){
			var profileImage = req.file.filename;
		}else{
			var profileImage = 'noimage.png';
		}
		
		req.checkBody('name', 'Name field is required').notEmpty();
		req.checkBody('email', 'Email field is required').notEmpty();
		req.checkBody('email', 'Email do not match').isEmail();
		req.checkBody('username', 'Username field is required').notEmpty();
		req.checkBody('password', 'Password field is required').notEmpty();
		req.checkBody('password2', 'Password do not match').equals(req.body.password);
		
		var errors = req.validationErrors();
		
		if (errors){
			console.log(errors);
			return res.render('register', {
				errors: errors,
				name: name,
				email: email,
				username: username,
				password: password,
				password2: passwordConfirm
			})
		}else {
			console.log('ko loi');
			db.user.find({
				where:{
					username: username
				}
			}).then(function (result){
				
				if (result){
					console.log('da ton tai________________________');
					req.flash('danger', 'Username already exists');
					return res.render('register', {
							errors: errors,
							name: name,
							email: email,
							username: username,
							password: password,
							password2: passwordConfirm
						}
					)
				}else{
					console.log('create__________________________________');
					db.user.create({
						name: name,
						email: email,
						username: username,
						password: password,
						profileImage: profileImage
					}).then(function(){
						console.log('tao ok________________________');
						req.flash('success','Register successfully');
						res.redirect('/');
					}).catch(function(err){
						if (err) throw err;
					});
				}
			});
			
		}
	});

router.route('/login')
	.get(function (req, res) {
		var count = req.signedCookies.count || 0;
		count++;
		res.cookie('count', count, {signed: true});

		res.render('login', {
			'title': 'Login'
		});
	})
	.post(passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid username and password'}), function(req,res){
		console.log('authenticate successfully');
		req.flash('success', 'You are logged in');
		res.redirect('/');
	});
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You logged out');
	res.redirect('/users/login');
});
module.exports = router;
