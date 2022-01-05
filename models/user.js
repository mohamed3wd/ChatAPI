const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
/////////////////////////////////////////////////// gded
const jwt = require('jsonwebtoken');
const config = require('config');
///////////////////////////////////////////////////
/**
 * this model create document called users which contains all users 
 * userName => the user name and it required and unique and also not less than 6 char or more than 50
 * password => the user password and it required and unique and also not less than 8 char or more than 50
 * online => detect the user status is online or offline
 */

const user = mongoose.Schema(
  {
    userName: {
        type: String, 
        required: true,
        unique: true,
        minlength: 6,
        maxlength: 50,
    },
    password: {
        type: String,
        required: true,
        unique: true,
        minlength: 8,
        maxlength: 50,
    }, online : {
type : Boolean,
default : false
},
    time : {
     type:Date,
     default : Date.now()}


  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.password;
      },
    },
  }
);

///////////////////////////////////////////////////////////// gded
user.methods.generateAuthToken = function() { 
  const token = jwt.sign({ userName: this.userName }, config.get('jwtPrivateKey'));
  return token;
}
//////////////////////////////////////////////////////////////

/// this static function si used before save and it used for 
/// encrypt user password using bcrypt library with the recommended number of hash count 8
user.pre("save", async function (next) {
    currentUser = this;
    if (currentUser.isModified("password")) {
        currentUser.password = await bcrypt.hash(currentUser.password, 8);
    }
    next();
  });

const User = mongoose.model("User", user);

module.exports = User;
