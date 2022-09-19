const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const router = express.Router();
const bodyParser= require('body-parser')
const { OAuth2Client } =require ("google-auth-library");
const app = express();
const port = 4444
const OAuth2 = OAuth2Client
const {google} = require('googleapis');

require('dotenv').config()

// oauth2Client.setCredentials({refresh_token:process.env.REFRESH_TOKEN})
// const accessToken = oauth2Client.getAccessToken()

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use("/", router);
app.use(cors());

app.listen(process.env.PORT || port, () => {
  console.log("We are live on port 4444");
});

app.get("/", (req, res) => {
  res.send("Welcome to my mail api");
});

exports.getGoogleAccountFromCode = (req, res, next) => {
  const code = req.body.data;
  const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'postmessage');
  google.options({ auth: oauth2Client });


  oauth2Client.getToken(code).then(res => {
      const tokens = res.tokens;
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2' });
      return oauth2.userinfo.get();
  })
      .then(userData => {
          console.log(userData);
      })
      .catch(err => {
          console.log(err);
      });
};


app.post("/contact", (req, res) => {
   let data = req.body;

  const smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
      auth: {
        type:"OAuth2",
        user: process.env.GMAIL_USER,
        clientId:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        refreshToken:process.env.REFRESH_TOKEN,
        // accessToken:accessToken
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  const mailOptions = {
    from: data.email,
    to: "sarasvaty.yogadanse@gmail.com",
    subject: `${data.subject}`,
    html: `<p>${data.name}</p>
          <p>${data.email}</p>
          <p>${data.telephone}</p>
          <p>${data.message}</p>`,
  };
  smtpTransport.sendMail(mailOptions, (error, response) => {
    if(error){
      console.log(error);
      }
      else{
       console.log("Message sent");
       }
  });
})




