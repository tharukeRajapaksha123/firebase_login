const admin = require("firebase-admin");
const firebaseConfig = {
   apiKey: "AIzaSyBk7vup9NfSyXm_HsBB4xl5GTGEJSmj9g0",
   authDomain: "genotechies-app-cf9f0.firebaseapp.com",
   projectId: "genotechies-app-cf9f0",
   storageBucket: "genotechies-app-cf9f0.appspot.com",
   messagingSenderId: "852226509147",
   appId: "1:852226509147:web:9cd9a6a0daf56b5438327e"
};

admin.initializeApp(firebaseConfig);
const db = admin.firestore();
const auth = admin.auth();
module.exports = { auth, db };