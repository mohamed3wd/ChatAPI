const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment'); //mongoose - auto - increment

const sms = mongoose.Schema(
    {
        attachmentId: {
            type: Number,
        },
        smsType: {
            type: String,
            required: true,
        },
        time: {
            type: Date,
            default: Date.now()
        }


    },
);

autoIncrement.initialize(mongoose.connection); // 3. initialize autoIncrement 

// 4. use autoIncrement
sms.plugin(autoIncrement.plugin, {
    model: "post", // collection or table name in which you want to apply auto increment
    field: "_id", // field of model which you want to auto increment
    startAt: 1, // start your auto increment value from 1
    incrementBy: 1, // incremented by 1
}, 'Sms'); // 4. use autoIncrement
mongoose.model('Sms', sms);

const Sms = mongoose.model("Sms", sms);

module.exports = Sms;
