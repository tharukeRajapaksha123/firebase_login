const express = require("express");
const admin = require("firebase-admin")
var FCM = require('fcm-node');
const credentials = require("../serviceAccountKeys.json");

const router = express.Router();

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

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    await auth.signInWithEmailAndPassword(auth.getAuth(), email, password)
        .then(value => {
            return res.status(201).json({ "message": "signin succesfully" });
        }).catch(err => {
            return res.status(500).json({ "error": err })
        });
});

router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    console.log(`called ${email} ${password}`);
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


router.post('/create-user', async (req, res) => {
    const { firstName, lastName, role, phone, userCode, birthDay, department, gender, education, email, uid } = req.body;
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
        "user_role": role,
    }

    return await db.collection("users").doc(uid).set(data)
        .then((val) => {
            return res.status(201).json({ "message": "user created succesfully" });
        }).catch(err => {
            console.log(`set firestore data failed ${err}`);
            return res.status(500).json({ "message": `data insertion failed ${err}` });
        });


})


// get user details
router.get("/get-user/:username", async (req, res) => {
    const userName = req.params.username;
    return await admin.firestore()
        .collection("users")
        .where("email", "==", userName)
        .get()
        .then((snapshot) => {
            let result = [];
            for (var re of snapshot.docs) {
                result.push(re.data())
            }
            return res.status(200).json({ "users": result });
        })
        .catch(error => {
            return res.status(500).json({ "message": `get user information failed ${error}` })
        })
})


router.put('/edit-user/:uid', async (req, res) => {
    const uid = req.params.uid;
    const data = req.body.data;
    return await db.collection("users").doc(uid).update(data)
        .then(() => {
            return res.status(201).json({ "message": "user updated succesfully" });
        }).catch(err => {
            console.log(`update firestore data failed ${err}`);
            return res.status(500).json({ "message": `data update failed ${err}` });
        });
});

router.delete('/delete-user/:uid', async (req, res) => {
    const uid = req.params.uid;
    return await db.collection('users').doc(uid).delete()
        .then(async () => {
            await admin.auth().deleteUser(uid);
            return res.status(201).json({ "message": "user deleted succesfully" });
        }).catch(err => {
            console.log(`deleting firestore data failed ${err}`);
            return res.status(501).json({ "message": `data deletion failed ${err}` });
        });
});

router.put("/block-user/:uid", async (req, res) => {
    const uid = req.params.uid;
    return await db.collection("users").doc(uid).update({ "disabled": true }).then((va) => {
        return res.status(201).json({ "message": "user blocked succesfully" })
    }).catch(error => {
        return res.status(500).json({ "message": `user blocked failed ${error}` })
    })
})
router.put("/unblock-user/:uid", async (req, res) => {
    const uid = req.params.uid;
    return await db.collection("users").doc(uid).update({ "disabled": false }).then((va) => {
        return res.status(201).json({ "message": "user unblocked succesfully" })
    }).catch(error => {
        return res.status(500).json({ "message": `user un   blocked failed ${error}` })
    })
})





module.exports = router