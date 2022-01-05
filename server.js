/////////////////////////////////////////////////////////////////gdeeeeeeeeeeeeed jwt
//process.env.TZ = 'Africa/Cairo' 
//const moment = require('moment-timezone');

//const timeoutScheduled = moment.tz(Date.now(), "Africa/Cairo");
//console.log(timeoutScheduled);

const auth = require('./middleware/auth');
const admin = require('./middleware/admin');
const encryptData = require('./middleware/encryptText');

/////////////////////////////////////////////////////////////////gdeeeeeeeeeeeeed jwt

///////////////////////////////////////////////////////////////////////////////////
//////                                                                       //////      
//////                      Web Sockets Section                              //////
//////                                                                       //////
///////////////////////////////////////////////////////////////////////////////////
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 50000 })


wss.on('connection', ws => {
  ws.on('join_chat', (arguments) => {
    console.log(`Received message => ${arguments}`)
  })
  ws.send('ho!')
})


//////////////////////////////////////////////////////////////////////
//////                                                          //////      
//////                   Regular Server Section                 //////
//////                                                          //////
//////////////////////////////////////////////////////////////////////

//var fs = require('fs');
//var http = require('http');

/////////////////////////////////////////////////////////////////gdeeeeeeeeeeeeed  https (create certificate)

//var https = require('https');
//var privateKey  = fs.readFileSync('/etc/letsencrypt/live/nodejschatting.tk/privkey.pem');
//var certificate = fs.readFileSync('/etc/letsencrypt/live/nodejschatting.tk/cert.pem');
//var ca = fs.readFileSync('/etc/letsencrypt/live/nodejschatting.tk/chain.pem');
//var credentials = {key: privateKey, cert: certificate, ca: ca};

/////////////////////////////////////////////////////////////////gdeeeeeeeeeeeeed https (create certificate)
const express = require('express');
const app = express();

// your express configuration here

//var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

//httpServer.listen(8080);




//const express = require('express')
//const app = express();
const userRouter = require('./routers/user_router')
const mongoose = require('mongoose')
var cors = require("cors");
const path = require('path')
const fs = require('fs');
const Attachment = require('./models/attachment');
const Sms = require('./models/sms');
const port = process.env.PORT || 2560
//const port = process.env.PORT || 4312
/////////////////////////////////////////////////////////////////gdeeeeeeeeeeeeed https (create certificate)

//httpsServer.listen(3345);

/////////////////////////////////////////////////////////////////gdeeeeeeeeeeeeed https (create certificate)


// connect to our database
// mongodb://localhost:27017/chatAppDB
mongoose.connect('mongodb://localhost:27017/chatAppDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
},(err) => {
    if (err) {
      console.log("There Is An Error");
      console.log(err);
    } else {
      console.log("Success To Connect");
    }
  });

// use some features like using public directory as static folder
// use cors to make requests using our flutter app
// using json data and make our body can carry over 50mb or may less or more as we like
// finally using user router 
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/api/v1/', userRouter)

// generate random string for using as image name
function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.post('/api/v1/attachment', auth, async (req, res) => {
    req.body.attachmentfile = encryptData.encrypt(req.body.attachmentfile)
    var attachment = Attachment(req.body)
    const newOne = await attachment.save()
    res.json({ attachment: newOne, message: 'attachment Created Successfully' })

})

app.post('/api/v1/sms', auth, async (req, res) => {
    var sms = Sms(req.body)
    const newOne = await sms.save()
    res.json({ sms: newOne, message: 'sms Created Successfully' })

})

app.post('/api/v1/getAttachment', auth, async (req, res) => {
   
    var attachment = await Attachment.findOne({ attachmentId: req.body.attachmentId });
    attachment.attachmentfile = encryptData.decrypt( attachment.attachmentfile)
    res.json({ attachment: attachment})

})

// get image from user as base64 encoded and save it into public/images directory
app.post('/api/v1/image',auth, (req, res)=>{
  const imageName = makeid(20)
  require("fs").writeFile("public/images/" + imageName+".jpg", req.body.image, 'base64', function(err) {
    if(err){
      console.log(err);
      res.json({error: err.toString()})
    }
  });

  // response to user with image name
  res.json(imageName+".jpg")
})

// this route for get pdf file from user as base64 and convert it 
// and after that save it as pdf file in public/pdf/*.pdf
app.post('/api/v1/pdf', auth, (req, res)=>{
  const pdfID = makeid(20)
  const fileContents = new Buffer.from(req.body.pdfString, 'base64')
  require("fs").writeFile("public/pdf/" + pdfID+".pdf", fileContents, function(err) {
    if(err){
      console.log(err);
      res.json({error: err.toString()})
    }
  });

  // let decodedBase64 = base64.base64Decode(req.body.pdfString, pdfID);

  // response to user with image name
  res.json(pdfID+".pdf")
})

// get pdf file from our files
app.get('/api/v1/pdf/:pdf', auth, (req, res)=>{
  res.sendFile(path.join(__dirname , 'public/pdf/'+ req.params.pdf))
})

// get image as base64 encoded
app.get('/api/v1/pdf/download/:pdf', auth, (req, res)=>{
  var bitmap = fs.readFileSync('./public/pdf/' + req.params.pdf);
  
  const stringBASE64 = Buffer.from(bitmap).toString('base64');

  res.json({pdf: stringBASE64})
})

// get image by it's name and send it to browser
app.get('/api/v1/image/:imageName',auth, (req, res)=>{
//gdeed
  res.sendFile(path.join(__dirname , 'public/images/'+ req.params.imageName.trim()))
///////////////////////////
//  res.sendFile(path.join(__dirname , 'public/images/'+ req.params.imageName))
})


// get image as base64 encoded
app.get('/api/v1/image/download/:imageName',auth, (req, res)=>{
  var bitmap = fs.readFileSync('./public/images/' + req.params.imageName);
  
  const stringBASE64 = Buffer.from(bitmap).toString('base64');

  res.json({image: stringBASE64})
})

// just test for our app every time we need to test it
app.get('/', (req, res)=> {
    res.send('hi')
})

app.listen(port, ()=>{
    console.log('app listen on port ', port);
})
