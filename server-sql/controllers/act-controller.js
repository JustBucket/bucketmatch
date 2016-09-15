const database = require('../models/database');
const UserActivity = require('./ua-controller.js');
const Activity = database.Activity;

const sequelize = database.sequelize;
const FBUser = database.FBUser;

function index(req, res) { // retruns a list of all activities
  Activity.findAll({}).then((acts) => {
    res.json(acts);
  });
}

function add(req, res, next) { // adds a new activity to the database
  //console.log("in act-controller add(): req.body", req.body);
  var newActivityObj = {actname: req.body.actname, actdesc: req.body.actdesc};

  Activity.create(newActivityObj)
    .then((resp) => {
      console.log('we are inside creating', resp);
      
      FBUser.addActivity(resp.dataValues, {status: true}).then(function() {
        console.log('IM INSIDE ADDING ACTVITY')
        next();
      })
    })
    .catch((err) => {
      if (err) console.error(err);
    });
}

function show(req, res, next) { // finds a single activity
  Activity.find(req.body[0], err => {
    if (err) console.error(err);
  });
  next();
}

module.exports = { index, add, show };
