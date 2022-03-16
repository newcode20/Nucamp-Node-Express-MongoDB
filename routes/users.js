const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();
//Client will go to the path /user lineup then post a request with a username and password that would be handled by this endpoint that we've set up 
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
//endpoint will allow a new user to register, we also pass a middleware function as a parameter 
router.post('/signup', (req, res) => {
    User.register(
        new User({username: req.body.username}),
        req.body.password,
        (err, user) => {
            if (err) {
                res.statusCode = 500; //tells user it's not an issue on their end up an issue with the server
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            } else {
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                user.save(err => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err: err});
                        return;
                    }            
                passport.authenticate('local')(req, res, () => { // this will ensure that the registration was successful
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, status: 'Registration Successful!'});
                    });
                });
            }
        }
    );
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({_id: req.user._id}); //once user is authenticated then we'll issue a token to the user. We are using teh get.token method and passing it the object that contains a payload, we are using the userid from the request object
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
});


//we use a get because the client won't be submitting anything but will be logged out
router.get('/logout', (req, res, next) => {
    if (req.session) { //if session exists we are destroying it on client side 
        req.session.destroy();
        res.clearCookie('session-id'); //clear cookie saved for client
        res.redirect('/'); 
    } else { //if client is asking to log out without being logged in
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
});
  
module.exports = router;