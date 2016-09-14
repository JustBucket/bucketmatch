"use strict";
const database = require('../models/database');
const request = require('request')
const FB = require('fb')

const sequelize = database.sequelize;
const User = database.User;

function index(req, res) {
  User.findAll({}).then((users) => {
    res.json(users);
  });
}

function add(req, res, next) { // create a new user record
  console.log(req.body);
  User.create(req.body, err => {
    if (err) console.error(err);
  });
  next();
}

function show(req, res, next) { // to get the logged in user's profile'
  User.findOne({ where: { username: req.params.username, password: req.params.password } }, err => {
    if (err) console.error(err);
  })
  .then((user) => {
    if (user === null) {
      res.status(500).send(null);
    } else {
      req.user = user;
    }
    next();
  });
}

function conn(req, res) {
  User.sequelize.query('SELECT "actname" from "activities" join "useractivities" on ' +
    '("useractivities"."activityId" = "activities"."_id") join "users" on ' +
    '("users"."_id" = "useractivities"."userId") where "username" =\'' + req.params.username + '\'')
    .then((data) => {
      const output = { activities: data[0], user: req.user };
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
  const id = '178491662559104';
  const secret = '1e04d3906720e245675c7cdbe7f5186e';
  const redirect = 'http://localhost:3000/fblogin'
  const code = req.query.code;
  const url = 'https://graph.facebook.com/v2.3/oauth/access_token?client_id='+id+'&redirect_uri='+redirect+'&client_secret='+secret+'&code='+code

  request(url, function(err, res, body) {
    var fbObj = JSON.parse(body);
    req.body.access_token = fbObj.access_token;
    next();
  })

}

function getClientId(req, res, next) {
  const token = req.body.access_token;
  const id = '178491662559104';
  const secret = '1e04d3906720e245675c7cdbe7f5186e';
  const url = 'https://graph.facebook.com/debug_token?input_token='+token+'&access_token=178491662559104|1e04d3906720e245675c7cdbe7f5186e';
  
  request(url, function(err, res, body) {
    var data = JSON.parse(body)
    req.body.user_id = data.data.user_id;
    next();
  });

}

module.exports = { index, add, show, conn, profile, getToken, getClientId };












