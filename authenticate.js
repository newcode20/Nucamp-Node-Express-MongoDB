const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config.js');


exports.local = passport.use(new LocalStrategy(User.authenticate())); //howe we add the specific strategy plugin that we want to use, here we want to use local strategy 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//user object will contain a user id for a user document
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});//returning a function created by jwt.sign method. The sign method will take the user object that was passed in as the object and second argument is the secret key created by config. and the third is to configure token to expire in 3600 second
};

const opts = {}; // will contain options for the jwt strategy abd we initialize as an empty object 
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // this object specifics how the json web token should be extracted from the incoming request message
opts.secretOrKey = config.secretKey; // lets us apply the jwt strategy with the key with which we'll assign this token and reset that to the config secret key property we set up earlier in conflict.js

//now we are exporting the jwt strategy
exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', {session: false})