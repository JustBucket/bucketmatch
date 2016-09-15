"use strict";
const database = require('../models/database');
const request = require('request');
const Config = require('./config.json');
const sequelize = database.sequelize;
const FBUser = database.FBUser;

function index(req, res) {
  User.findAll({}).then((users) => {
    res.json(users);
  });
}

function getAllUsers(req, res, next) {
  FBUser.findAll({}).then((users) => {
    req.allUsers = users;
    next();
  });
}

function add(req, res, next) { // create a new user record
  console.log(req.body);
  User.create(req.body, err => {
    if (err) console.error(err);
  });
  next();
}

function getUser(req, res, next) { // to get the logged in user's profile'
  const id =  req.cookies.userID;
  const token = req.cookies.token;
  const url = "https://graph.facebook.com/v2.7/me?fields=id%2Cpicture%2Cfirst_name%2Clast_name%2Cbio&access_token="+token;

  FBUser.findOne({ where: { fb_id: id}}, err => {
    if(err) console.log(err);
  })
  .then((user) => {
    if (user) {
      console.log('FBUser find OK', user);
      req.user = user;
      next();
    } else {
      request(url, function(err, res, body) {
        var data = JSON.parse(body);
        
        console.log('Call from FB', body, data);

        FBUser.create({fb_id: data.id, first_name: data.first_name, last_name: data.last_name, profilepic:data.picture.data.url, bio: data.bio}, err => {
          if(err) console.log(err);
        })
        .then((newUser) => {
          req.user = user;
          next();
        });
    });
  }
});

  // User.findOne({ where: { username: req.params.username, password: req.params.password } }, err => {
  //   if (err) console.error(err);
  // })
  // .then((user) => {
  //   if (user === null) {
  //     res.status(500).send(null);
  //   } else {
  //     req.user = user;
  //   }
  //   next();
  // });
}

function conn(req, res) {
  
  console.log('req.user', req.user);

  FBUser.sequelize.query('SELECT "actname" from "activities" join "useractivities" on ' +
    '("useractivities"."activityId" = "activities"."_id") join "users" on ' +
    '("users"."_id" = "useractivities"."userId") where "users"."_id" =\'' + req.user._id + '\'')
    .then((data) => {
      const output = { activities: data[0], user: req.user };
      console.log('output', output);
      res.json(output);
    });
  
}

function profile(req, res, next) {
  User.findOne({ where: { username: req.params.username } }, err => {
    if (err) console.error(err);
  })
  .then((user) => {
    const userprofile = { "username": user.username, "profilepic": user.profilepic, "bio": user.bio };
    if (user === null) {
      res.status(500).send(null);
    } else {
      res.json(userprofile);
    }
    next();
  });
}

function getToken(req, res, next) {
  const redirect = 'http://localhost:3000/fblogin'
  const code = req.query.code;
  const url = 'https://graph.facebook.com/v2.3/oauth/access_token?client_id='+Config.appID+'&redirect_uri='+redirect+'&client_secret='+Config.secret+'&code='+code

  request(url, function(err, res, body) {
    var fbObj = JSON.parse(body);
    req.body.access_token = fbObj.access_token;
    next();
  })

}

function getClientId(req, res, next) {
  const token = req.body.access_token;
  const url = 'https://graph.facebook.com/debug_token?input_token='+token+'&access_token='+Config.appID+'|'+Config.secret;

  request(url, function(err, res, body) {
    var data = JSON.parse(body)
    req.body.user_id = data.data.user_id;
    next();
  });
}

// function getUserFB(res, res, next) {

// }

module.exports = { index, add, getUser, conn, profile, getToken, getClientId, getAllUsers };












