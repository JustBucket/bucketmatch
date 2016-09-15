"use strict";
const database = require('../models/database');

const sequelize = database.sequelize;
const UserActivity = database.UserActivity;
const Activity = database.Activity;
const FBUser = database.FBUser;

function index(req, res) { // displays all activities associated with users? for devs not production
  UserActivity.findAll({}).then((uas) => {
    res.json(uas);
  });
}

function addNew(req, res, next) { // associates a user and a activity
  /*if (req.actKey) {
    // pull database _id from cookies
    console.log(req.cookies._id);
    const updateObj = { "activityid": req.actKey, "userid": req.cookies._id};
    UserActivity.create(req.body.data[0], err => {
      if (err) console.error(err);
    });
  }
  UserActivity.create(req.body.data[0], err => {
    if (err) console.error(err);
  });
  */
  next();
}

function add(req, res, next) { // associates a user and a activity
  // console.log req.body
  if (req.actKey) { // true if just added custom activity
    var fb_iden = req.cookies.userID;
    FBUser.findOne({ where: {fb_id: fb_iden} }, err => {
      if(err) {
        console.log(err);
        res.status(500).end();
      }
    }).then((person) => {
    const updateObj = { "activityId": req.actKey, "userId": person._id };
    console.log('BEFORE I GO INTO CREATEEEEEE FOR USERACT')

    UserActivity.create(updateObj).then(function(result) {
        console.log('after UserActivity create');
        next();
      });
    })
  } else {

  // extract cookies.userID which is really fb_id, find corresponding _id, then create new UserActivity record
  var fb_id = req.cookies.userID;
  if(fb_id) {
    FBUser.findOne({ where: { fb_id: fb_id} }, err => {
      if(err) {
        console.log(err);
        res.status(500).end();
      }
    }).then((user) => {
      // set the correct userId
      req.body.data[0].userId = user._id;
      // set default for status
       req.body.data[0].status = true;
      console.log('before ua create', req.body.data[0]);
      
      UserActivity.create(req.body.data[0], err => {
        if(err) {
          console.log(err);
          res.status(500).end();
        }
        next();
      }); 
    });
  }
  
}
}

function findbyact(req, res, next) { // finds all users by activity
  Activity.sequelize.query('SELECT "username" from "users" join "useractivities" on ' +
  '("useractivities"."userId" = "users"."_id") join "activities" on ("activities"."_id" = ' +
  '"useractivities"."activityId") where "actname" =\'' + req.params.actname + '\'')
  .then((data) => {
    const output = { users: data[0] };
    res.json(output);
    next();
  });
}

module.exports = { index, add, findbyact };
