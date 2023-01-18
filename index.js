const http = require("http")
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')

const admin = require("firebase-admin")
const credentials = require("./serviceAccountKeys.json");
const e = require("express");
admin.initializeApp({
   credential: admin.credential.cert(credentials)
});

const fb = require("firebase/app");
const auth = require("firebase/auth")
const db = admin.firestore()

const config = {
   apiKey: "AIzaSyBk7vup9NfSyXm_HsBB4xl5GTGEJSmj9g0",
   authDomain: "genotechies-app-cf9f0.firebaseapp.com",
   projectId: "genotechies-app-cf9f0",
   storageBucket: "genotechies-app-cf9f0.appspot.com",
   messagingSenderId: "852226509147",
   appId: "1:852226509147:web:9cd9a6a0daf56b5438327e"
};
fb.initializeApp(config)

var app = express();
const port = 8080

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let authorized = true

function checkAuth(req, res, next) {
   if (authorized) {
      next()
   } else {
      res.status(403).send('Unauthorized!')
      return
   }
}

app.use('/', checkAuth)

app.get('/', (req, res) => {
   res.json({
      message: 'Hello World!'
   })
})

app.post("/login", async (req, res) => {
   const { email, password } = req.body;
   await auth.signInWithEmailAndPassword(auth.getAuth(), email, password)
      .then(value => {
         return res.status(201).json({ "message": "signin succesfully" });
      }).catch(err => {
         return res.status(500).json({ "error": err })
      });
});

app.post("/signup", async (req, res) => {
   const { email, password } = req.body;
   await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false
   }).then(value => {
      return res.status(201).json({ "message": "signin succesfully" });
   }).catch(err => {
      return res.status(500).json({ "error": err })
   });
})


app.post('/create-user', async (req, res) => {
   const { firstName, lastName, phone, userCode, birthDay, department, gender, education, email, uid } = req.body;
   const data = {
      "first_name": firstName,
      "last_name": lastName,
      "phone": phone,
      "user_code": userCode,
      "date_of_birth": Date(birthDay),
      "department": department,
      "gender": gender,
      "education": education,
      "email": email,
   }

   return await db.collection("users").doc(uid).set(data)
      .then((val) => {
         return res.status(201).json({ "message": "user created succesfully" });
      }).catch(err => {
         console.log(`set firestore data failed ${err}`);
         return res.status(500).json({ "message": `data insertion failed ${err}` });
      });


})


http.createServer(app).listen(port, () => console.log(`Server is running on port ${port}`));