const firebase = require('firebase');

const firebaseConfig = {
   apiKey: "AIzaSyDomu7XkX48lxMC5_RNZMCj-wfjAY1UtBo",
   authDomain: "dgmentor-93b90.firebaseapp.com",
   projectId: "dgmentor-93b90",
   storageBucket: "dgmentor-93b90.appspot.com",
   messagingSenderId: "711555357479",
   appId: "1:711555357479:web:7bd6c2a4d26c80c77ba702",
   measurementId: "G-35FV6G71KY"
};

//initialize firebase app 
firebase.initializeApp(firebaseConfig);
//initialize firebase app 
module.exports = { firebase }; //export the app