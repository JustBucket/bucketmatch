'use strict';

const Sequelize = require('sequelize');
const DB = require('./../controllers/config.json')

// if there is a password, make it the third parameter after the username,
// otherwise, make it null and include a comma after it
const sequelize = new Sequelize(DB.DBname, DB.DBname, DB.DBpass, {
  host: 'tantor.db.elephantsql.com',
  dialect: 'postgres',
});

const FBUser = sequelize.define('users', {
  _id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  fb_id: Sequelize.STRING,
  first_name: Sequelize.STRING,
  last_name: Sequelize.STRING,
  profilepic: Sequelize.STRING,
  bio: Sequelize.STRING,
});

const Activity = sequelize.define('activities', {
  _id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  actname: { type:Sequelize.STRING, unique: true},
  actdesc: Sequelize.STRING,
});

const UserActivity = sequelize.define('useractivities', {
  _id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  status: Sequelize.BOOLEAN, // if open, true, if completed false
});

Activity.belongsToMany(FBUser, { through: 'useractivities' });
FBUser.belongsToMany(Activity, { through: 'useractivities' });

// Sync all models that aren't already in the database
sequelize.sync()
// // Force sync all models
//sequelize.sync({force: true})
// // Drop all tables -- ran once 9/9 2:48pm
//sequelize.drop()
// emit handling:
.then(() => {
  // woot woot
}).catch((error) => {
  console.log(error);
});

module.exports = { sequelize, FBUser, Activity, UserActivity }


