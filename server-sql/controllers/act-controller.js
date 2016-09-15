const database = require('../models/database');
const UserActivity = require('./ua-controller.js');

const sequelize = database.sequelize;
const Activity = database.Activity;

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
      console.log(resp);
      req.actKey = resp.dataValues._id;
    })
    .catch((err) => {
      if (err) console.error(err);
    });
  next();
}
/*
function add(req, res, next) { // adds a new activity to the database
  Activity.create(req.body.data.event)
    .then((resp) => {
      console.log(resp);
      req.actKey = resp.dataValues._id;
    })
    .catch((err) => {
      if (err) console.error(err);
    });
  next();
}
*/

function show(req, res, next) { // finds a single activity
  Activity.find(req.body[0], err => {
    if (err) console.error(err);
  });
  next();
}

module.exports = { index, add, show };
