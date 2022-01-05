const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment'); //mongoose - auto - increment

const attachment = mongoose.Schema(
    {
        attachmentId: {
            type: Number,
            required: true,
            unique: true,
        },
        attachmentfile: {
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

attachment.plugin(autoIncrement.plugin,{
    model: "post", // collection or table name in which you want to apply auto increment
    field: "attachmentId", // field of model which you want to auto increment
    startAt: 1, // start your auto increment value from 1
    incrementBy: 1, // incremented by 1
}, 'Attachment'); // 4. use autoIncrement
attachment.plugin(autoIncrement.plugin, {
    model: "post", // collection or table name in which you want to apply auto increment
    field: "_id", // field of model which you want to auto increment
    startAt: 1, // start your auto increment value from 1
    incrementBy: 1, // incremented by 1
}, 'Attachment'); // 4. use autoIncrement
mongoose.model('Attachment', attachment);

const Attachment = mongoose.model("Attachment", attachment);

module.exports = Attachment;
