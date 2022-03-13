const express = require('express');
const User = require('../models/user');

const router = express.Router();
//Client will go to the path /user lineup then post a request with a username and password that would be handled by this endpoint that we've set up 
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
//endpoint will allow a new user to register, we also pass a middleware function as a parameter 
router.post('/signup', (req, res, next) => {
    User.findOne({username: req.body.username}) //checking the new username they are signing up with isn't taken
    .then(user => {
        if (user) {
            const err = new Error(`User ${req.body.username} already exists!`);
            err.status = 403;
            return next(err);
        } else { //setting this up if user was falsey
            User.create({
                username: req.body.username,
                password: req.body.password}) //create method returns a promise so the then method handles resolved value
            .then(user => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: 'Registration Successful!', user: user});
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err)); // this deals with the find one method if it returns a rejected promise and we the error is passed on to the express error handler
});


router.post('/login', (req, res, next) => {
    if(!req.session.user) { //checking if logged in by checking session of user and if not 
        const authHeader = req.headers.authorization;
//checking for authorization header 
        if (!authHeader) {
            const err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }
      
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const username = auth[0];
        const password = auth[1];
//checking user document to see if it matches anything we have saved  
        User.findOne({username: username})
        .then(user => {
            if (!user) {
                const err = new Error(`User ${username} does not exist!`);
                err.status = 401;
                return next(err);
            } else if (user.password !== password) { //checking if they match, if they don't show an error
                const err = new Error('Your password is incorrect!');
                err.status = 401;
                return next(err);
            } else if (user.username === username && user.password === password) { //if username and password are correct we are saying they are authenticated and can 
                req.session.user = 'authenticated';
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You are authenticated!')
            }
        })
        .catch(err => next(err));
    } else { //deals with if there is a current session
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated!');
    }
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