var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var passport = require('passport');
var expressValidator = require('express-validator');
var nunjucks = require('nunjucks');
var flash = require('connect-flash');
var Sequelize = require('sequelize');

global.db = new Sequelize('pro','postgres','123456',{host:'localhost', dialect: 'postgres', port: 5432});
db['user'] = db.import(__dirname + '/models/user.js');


var index = require('./routes/index');

var users = require('./routes/users');

var app = express();

// view engine setup
nunjucks.configure('views',{
  autoescape: true,
  express: app
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('techmaster'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: "secret",
  key: 'techmaster.vn',
  saveUninitialized: true,
  resave: true
}));
app.set('view engine', 'html');

//passport
app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;
    while (namespace.length){
      formParam += '['+ namespace.shift() +']';
    }

    return{
      param: formParam,
      msg: msg,
      value: value
    }
  }
}));

app.use(flash());
app.use(function (req,res,next) {
  res.locals.messages = req.session.flash;
  delete req.session.flash;
  next()
})

// tat ca cac reuqest deu phai di qua
app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
})

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
