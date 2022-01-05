const mongoose = require("mongoose");

/**
 * this model to create the chat room between the two users 
 * first field is array of users we need to make this chate between them
 * lastSender => the last sender of last message in this chat
 * lastMessage => the last message
 * isUnreadMessage => if there unread message or not
 * messages => array of messages which contain sender and reciever and message and message type
 * timestamps => default in mongoose to create createdAt And updatedAd fields
 */


const room = mongoose.Schema(
  {
    users : [
        {
            type: String
        }
    ],
    type: {
        type: String,
        required: true,
    },
    lastSender: {
        type: String,
    },
    lastMessage: {
        type: String,
    },
    isUnreadMessage: {
        type: Boolean,
        default: false,
    },
    messages: [
        {
        sender: {
            type: String,
            required: true,
        },

        reciever: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
            
        },

        // IMAGE, VOICE, TEXT
        type: {
            type: String,
            required: true,
        },
        
        time : {
            type : Date,
            default: () => Date.now() + 2*60*60*1000,

        },
        isDeleted: {
            type: Boolean,
            default: false
        },
     /////////////////////////////////////// this is to add location for each message
        location: {
            type: {
                 type: String, 
                 enum: ['Point'], 
                 required: true
        },
        coordinates: {
                 type: [Number],
                 required: true
            }

        },
     /////////////////////////////////////// this is to add location for each message
     ////////////////// this is to delete all documents after certain time in mongodb
        //expireAt: {
        //   type: Date,
        //   default: Date.now,
        //   index: { expires: '1m' },
       // },
     ////////////////// this is to delete all documents after certain time in mongodb
       
    }
],

  },

  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;

      },
    },

  }

);

const Room = mongoose.model("Room", room);

module.exports = Room;

