const express = require("express");
const admin = require("firebase-admin")
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

// Edit User
router.put('/edit-user', async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    await db.collection("users").doc(uid).update(data)
      .then(() => {
          return res.status(201).json({ "message": "user updated succesfully" });
      }).catch(err => {
          console.log(`update firestore data failed ${err}`);
          return res.status(500).json({ "message": `data update failed ${err}` });
      });
  });

// Delete User
  router.delete('/delete-user', async (req, res) => {
    const uid = req.body.uid;
    await db.collection('users').doc(uid).delete()
      .then(() => {
          return res.status(201).json({ "message": "user deleted succesfully" });
      }).catch(err => {
          console.log(`deleting firestore data failed ${err}`);
          return res.status(501).json({ "message": `data deletion failed ${err}` });
      });
  });

// Create a new group
router.post('/create-group', (req, res) => {
  const groupName = req.body.groupName;
  admin.auth().createGroup(groupName)
    .then((group) => {
      res.status(201).json({ group });
    })
    .catch((error) => {
      res.status(501).json({ error });
    });
});

// Add users to a group
router.post('/group/:id/members', async (req, res) => {
    const groupId = req.params.id;
    const instructors = req.body.instructors; 
    const participants = req.body.participants; 
    
    try {
        await Group.addInstructors(groupId, instructors);
        await Group.addParticipants(groupId, participants);
        res.status(201).json({ message: 'Members added to group successfully' });
    } catch (error) {
        res.status(501).json({ message: 'Error adding members to group', error });
    }
});

// Get all members of a group
router.get('/group-members', (req, res) => {
  const groupId = req.query.groupId;
  admin.auth().listUsers(1000, 'customClaims.groupId==' + groupId)
    .then((listUsersResult) => {
      res.status(201).json({ users: listUsersResult.users });
    })
    .catch((error) => {
      res.status(501).json({ error });
    });
});

module.exports = router