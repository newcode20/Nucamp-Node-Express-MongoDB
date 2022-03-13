var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session'); // installing to track authenticated user sessions
const FileStore = require('session-file-store')(session); //we have 2 sets of parameters so we invoke the require function with the argument "session file store", the require function is returning another function as a return value, then we are calling the return function with this second parameter list of session

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const partnerRouter = require('./routes/partnerRouter');
const promotionRouter = require('./routes/promotionRouter')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));

app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false, //when a new sessions are created but then no updates are made to it then at the end of the request it won't get saved as an empty session, no cookie sent
    resave: false, //once session is created and saves it will continue to be resaved whenever a request is made. Helps with keeping the session marked as active so it doesn't get deleted
    store: new FileStore()
}));

//signed cookies property of the request object is provided by cookie parser, it will automatically parse a signed cookie from the request if the cookie is not properly signed then it would return a value of false. the additional property called user will be a property that we will, ourselves, add to the signed cookie
function auth(req, res, next) {
    console.log(req.session);
    if (!req.session.user) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            const err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }

//this is if the authorization comes back without error
//we want to parse username and password out form the auth header string and put them in an array where the username is at index 0 and password is at index 1. Buffer is a global class in node. 
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];
//here is where the user that isn't authenticated is challenged for a username and password and has sent that information back to the server and it is correct so we set up a cookie
    if (user === 'admin' && pass === 'password') {

//res.session handles creating the cookie and setting it up in the servers response to the client so this is all we need to do
       req.session.user = 'admin';
        return next(); // authorized
        } else {
            const err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }
//the below else deals with if there is a session cookie.user value in the incoming request we check to see if that value equals admin, if so we grant access by passing the client on to the next middleware function use the next 
    } else {
        if (req.session.user === 'admin') {
            return next();
        } else {
            const err = new Error('You are not authenticated!');
            err.status = 401;
            return next(err);
        }
    }
}

app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));

//These are for the routes to direct these calls to the different routers associated
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
