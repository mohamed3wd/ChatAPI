const userRouter = require("express").Router();
const User = require('../models/user')
const bcrypt = require('bcrypt');
const Room = require("../models/room");
const Notification = require("../models/notification");
const moment = require('moment')

/////////////////////////////////////////////////////////////////gdeeeeeeeeeeeeed jwt

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const encryptData = require('../middleware/encryptText');

const { text } = require("express");

/////////////////////////////////////////////////////////////////gdeeeeeeeeeeeeed jwt


// login route of user 
userRouter.post('/login',async (req, res)=>{
    try {

        // check if there is a user with the same user name 
        let user = await User.findOne({userName: req.body.userName})

        // if there is no user we return an error
        if(!user){
            return res.status(400).json({message: "User Name Or Password Is Not Correct"})
        }

        // if there is a user we compare the send password with our saved password
        // but with bcrypt library which the password is hashed
        const isMatch = await bcrypt.compare(req.body.password, user.password);

        // if two password are not matched we return an error
        if (!isMatch) {
            return res.status(400).json({message: "User Name Or Password Is Not Correct"})
        }

        // if they are matched we return 200OK and message is successfully
       // return res.json({user: user, message: "Successfully Login"})
        /////////////////////////////////////////////////////////////////gdeeeeeeeeeeeeed jwt
        return res.json({user: user, message: "Successfully Login", token : user.generateAuthToken()})
        /////////////////////////////////////////////////////////////////gdeeeeeeeeeeeeed jwt    

    } catch (error) {

        // if there is an error return error and print it in server
        console.log(error);
        res.status(500).json({error, message: "There Is An Error"})
    }
})

// signup route to signup new user 
userRouter.post('/signup',async (req, res)=>{
    try {

        // check if there is an user with the same name we return error
        let currentUser = await User.findOne({userName: req.body.userName})
        if(currentUser){
            return res.status(400).json({message: "User Name Is Taken"})
        }

        // if there is no user with the same name we create new user and save it and return successfully message
        var user = User(req.body)
        const newOne = await user.save()
        res.json({user: newOne, message: 'User Created Successfully'})

    } catch (error) {
        console.log(error);
        res.status(400).json({error, message: "There Is An Error"})
    }
})


userRouter.get('/allUsers',auth, async (req, res)=>{
//userRouter.get('/allUsers', async (req, res)=>{
    try {
   
       
         const users = await User.find({});
       //    console.log(users)
         for (const user of users) {
           var lastOnline = user['time'];
           var timeNow = Date.now();
           var elapsedSecondsSinceOnline = Math.floor((timeNow - lastOnline) / 1000);
            if(elapsedSecondsSinceOnline <= 5) {

              
      
              await User.findOneAndUpdate({userName: user['userName']}, {online: true})

               
             }
            else {
            await User.findOneAndUpdate({userName: user['userName']}, {online: false})
             
           } 
           //console.log(); 
} 

        res.json(users)
    } catch (error) {
        console.log(error);
        res.status(400).json({error, message: "There Is An Error"})
    }
})


// create new room if there is no room already created for these users
userRouter.post('/createRoom', auth, async (req, res) => {
    try {

        // get all rooms from our database
        const rooms = await Room.find({})
        
        // check if there is a room already with the same users we return with message room is created
        for (const room of rooms) {
            if(room.users.includes(req.body.sender) && room.users.includes(req.body.reciever)){
                res.json({message: "Room Already Created"})
                return
            }
        }

        // if there is no room with these users sender and receiver we create new one
        var ourRoom = new Room()

        // set sender and reciever to our users array and sve room 
        ourRoom.users.push(req.body.sender)
        ourRoom.users.push(req.body.reciever)
        await ourRoom.save()

        // send back to user that room is created successfully
        res.json({message: "Room Created Successfully"})
    } catch (error) {
        console.log(error);
        res.status(400).json({error, message: "There Is An Error"})
    }
})

// send a new message
userRouter.post('/sendMessage', auth, async (req, res) => {
    try {

        // get all rooms
        const rooms = await Room.find({})

        // holder of our room
        var ourRoom;

        // holder of room index
        var roomIndex = 0;

        // loop through all rooms 
        for (let room of rooms) {

            // if we found the room set it in ourRoom variable and break the loop
            if (room.users.includes(req.body.sender) && room.users.includes(req.body.reciever)){
                ourRoom = room
                break
            }
            roomIndex ++
        }

        // if our room is set we push to it's messages array the new message
        if(ourRoom){
            ourRoom.messages.push({
                sender:  req.body.sender,
                reciever: req.body.reciever,
                message: encryptData.encrypt(req.body.message),
                type: req.body.type,
                location: req.body.location,
            })

            // update the room with the new data we have
            await Room.findByIdAndUpdate(ourRoom._id, { messages: ourRoom.messages, type: req.body.type, lastSender: req.body.sender, isUnreadMessage: true, lastMessage: encryptData.encrypt( req.body.message),},)
            
            // crate new notification with the reciever name and save it
            const notification = new Notification({ userName: req.body.reciever})
            await notification.save()

            // response to user that message is sent successfully
            res.json({message: "Message Sent Successfully"})
            return
        
        // if there is no room found we create new room and set it's data
        }else{

            // create new room and set it's data and save it as new room
            ourRoom = new Room()
            ourRoom.users.push(req.body.sender)
            ourRoom.users.push(req.body.reciever)
            ourRoom.lastSender =  req.body.sender
            ourRoom.lastMessage = encryptData.encrypt( req.body.message)
            ourRoom.isUnreadMessage = req.body.isUnreadMessage
            ourRoom.type = req.body.type
            ourRoom.messages.push({
                sender:req.body.sender,
                reciever: req.body.reciever,
                message: encryptData.encrypt( req.body.message),
                type: req.body.type,
                location:req.body.location,
            })

            await ourRoom.save()

            // create new notification to reciever
            const notification = new Notification({ userName:req.body.reciever})
            await notification.save()

            // send back to user that message is sent
            res.json({message: "Message Sent Successfully"})
        }

        

    } catch (error) {
        console.log(error);
        res.status(400).json({error, message: "There Is An Error"})
    }
})

// get all single user chats
userRouter.get('/chats/:userName',auth, async (req, res)=>{
    try {

        // get all chats and don't get the messages and sort it with last updated chat
        const allRooms = await Room.find({}, {"messages": 0}).sort({updatedAt: -1})
        var userRooms = []

        // we filter all chats with only chats have messages
        allRooms.forEach(room => {
           
            if(room.users.includes(req.params.userName)){
                if (room.lastSender) {
                    room.lastMessage = encryptData.decrypt( room.lastMessage)
                    userRooms.push(room)
                }
                
            }
        });

        // send back to user the chats as array of objects
        res.json(userRooms)
    } catch (error) {
        console.log(error);
        res.status(400).json({error, message: "There Is An Error"})
    }
})

// change the readed or not in single chat or room
userRouter.patch('/changetoread/:roomId',async (req, res)=>{
    try {

        // find the specific room with it's id and update it as readed room 
        await Room.findByIdAndUpdate(req.params.roomId, {isUnreadMessage: false})

        // send back to user that it's updated successfully
        res.json({message: "Updated Successfully"})
    } catch (error) {
        console.log(error);
        res.status(400).json({error, message: "There Is An Error"})
    }
})


// get messages for a room
userRouter.get('/room/:sender/:reciever',auth, async (req, res)=>{
    try {
        // set array of users which contains sender and reciever 
        var users = [req.params.sender, req.params.reciever]
        // find room with the same array if we found it we reutrn it
        var room = await Room.findOne({ users })
        room.lastMessage = encryptData.decrypt(room.lastMessage)

        if (room) { 

            await Promise.all(room.messages.map(async (res) => {
                res.isDeleted = res.isDeleted
                res.message = encryptData.decrypt(res.message)
                let hours = moment().diff(moment(res.time), 'hours');
                if (hours >= 24 && res.isDeleted != true) {
                    res.isDeleted = true;
                    var msg = [{ res }];
                    await Room.update({ "messages._id": res._id }, { $set: { "messages.$.isDeleted": true } })
                }
            }))
            res.json(room)
            return
        }
        // if we don't found it we reverse the array and search for it
        // and now we defintly will find it if we found we return it to user
        users = [req.params.reciever, req.params.sender]
        room = await Room.findOne({users})
        res.json(room)
        
    } catch (error) {
        console.log(error);
        res.status(400).json({error, message: "There Is An Error"})
    }
})

// get user notification with his user name 
userRouter.get('/notification/:userName',auth, async (req, res)=>{
    try {

        // find all notifications that contain the user name we got from user
        const notifications = await Notification.find({userName: req.params.userName})

        // after we found it we delete them also all to don't notify him again till we insert new ones
        await Notification.deleteMany({userName: req.params.userName})

        // send back to user the count of notifications we have 
        // to avoid the body size back
        res.json({count : notifications.length})
    } catch (error) {
        console.log(error);
        res.status(400).json({error, message: "There Is An Error"})
    }
})

// change user to online by provide it's user name 
userRouter.get('/status/online/:userName',auth, async (req, res) => {
    try {

        // find the user and update his status to online
        await User.findOneAndUpdate({userName: req.params.userName}, {online: true,})
        res.json({message: 'User Is Online'})
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.toString(), message: "There Is An Error"})
    }
})

// change user to offline by provide it's user name 
userRouter.get('/status/offline/:userName',auth, async (req, res) => {
    try {

        // find the user and update his staus to offline
        await User.findOneAndUpdate({userName: req.params.userName}, {online: false,})
        res.json({message: 'User Is Offline'})
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.toString(), message: "There Is An Error"})
    }
})

// check user status
userRouter.get('/status/:userName',auth, async (req, res) => {
    try {

        // find the user and return it's status if online or offline
        const user = await User.findOne({userName: req.params.userName})
        res.json({status: user.online})
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.toString(), message: "There Is An Error"})
    }
})

userRouter.post('/MakeMeOnline/:userName',auth, async (req, res) => {
    try {
        await User.findOneAndUpdate({userName: req.params.userName}, {time: Date.now()})
        res.json({message: 'User Is Online'})
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.toString(), message: "There Is An Error"})
    }
})

module.exports = userRouter
