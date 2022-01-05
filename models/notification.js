const mongoose = require("mongoose");

/*
  notification model which crate document called notifications 
  this model contain the user name we need to confirm or notify him that he has new messages
 */
const notification = mongoose.Schema(
  {
      userName: {
          type: String,
      },
  },
  {
    // to json is used to return what we need to show when retreive this model
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
      },
    },
  }
);

const Notification = mongoose.model("Notification", notification);

module.exports = Notification;