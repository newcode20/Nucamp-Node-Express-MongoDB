const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate())); //howe we add the specific strategy plugin that we want to use, here we want to use local strategy 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());