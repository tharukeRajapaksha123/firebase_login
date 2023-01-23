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

//Create group
router.post('/create-group', async (req, res) => {
  const { title, trainerId, users } = req.body;

  try {
      const groupRef = await db.collection('userGroups').add({
          'title': title,
          'created_at': admin.firestore.FieldValue.serverTimestamp(),
          'trainer_id': '',
          'trainers': trainerId,
          'course_ids': [],
          'playbook_ids': [],
          'diary_ids': [],
          'survey_ids': [],
          'exam_avarage': null,
          'assessment_avarage': null,
          'on_break': false,
      });

      // Update the 'groups' field of the trainers in the 'instructors' collection
      for (const trainer of trainerId) {
          const trainerRef = db.collection('instructors').doc(trainer);
          await trainerRef.update({
              'groups': admin.firestore.FieldValue.arrayUnion([groupRef.id]),
          });
      }

      // Update the 'user_group_id' field of the users in the 'users' collection
      for (const user of users) {
          const userRef = _firestore.collection('users').doc(user.id);
          await userRef.update({
              'user_group_id': groupRef.id,
          });
      }

      // Return the group data
      const groupSnapshot = await groupRef.get();
      const groupData = groupSnapshot.data();
      groupData.id = groupRef.id;
      return res.status(201).json(groupData);
  } catch (err) {
      console.log(`Error creating group: ${err}`);
      return res.status(500).json({ "message": `Error creating group: ${err}` });
  }
});

// Remove a user from the group
router.delete('/remove-user-from-group/:groupId/:userId', async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    const groupRef = db.collection("userGroups").doc(groupId);

    // Get the current array of participants
    const groupSnapshot = await groupRef.get();
    const participants = groupSnapshot.data().participants;

    // Remove the user from the array
    const updatedParticipants = participants.filter(id => id !== userId);

    // Update the participants array in the userGroup document
    return groupRef.update({
        participants: updatedParticipants
    })
    .then(() => {
        return res.status(200).json({ "message": "user removed from group successfully" });
    })
    .catch(err => {
        console.log(`Error removing user from group: ${err}`);
        return res.status(500).json({ "message": `Error removing user from group: ${err}` });
    });
});



// Assign courses to group
router.put('/assign-courses-to-group/:groupId', async (req, res) => {
    const groupId = req.params.groupId;
    const { courseIds } = req.body;
    const groupRef = db.collection("userGroups").doc(groupId);

    const groupSnapshot = await groupRef.get();
    let courses = groupSnapshot.data().courses;

    if(!courses) courses = []

    // Add the new courses to the array
    courses.push(...courseIds);

    // Update the courses array in the userGroup document
    return groupRef.update({
        courses: courses
    })
    .then(() => {
        return res.status(200).json({ "message": "Courses assigned to group successfully" });
    })
    .catch(err => {
        console.log(`Error assigning courses to group: ${err}`);
        return res.status(500).json({ "message": `Error assigning courses to group: ${err}` });
    });
});

// Unaasign courses from group
router.put('/unassign-courses-from-group/:groupId', async (req, res) => {
    const groupId = req.params.groupId;
    const { courseIds } = req.body;

    const groupRef = db.collection("userGroups").doc(groupId);

    const groupSnapshot = await groupRef.get();
    let courses = groupSnapshot.data().courses;

    // Remove the courses from the array
    const updatedCourses = courses.filter(id => !courseIds.includes(id));

    // Update the courses array in the userGroup document
    return groupRef.update({
        courses: updatedCourses
    })
    .then(() => {
        return res.status(200).json({ "message": "Courses unassigned from group successfully" });
    })
    .catch(err => {
        console.log(`Error unassigning courses from group: ${err}`);
        return res.status(500).json({ "message": `Error unassigning courses from group: ${err}` });
    });
});

//Add Assessment to a module
router.post('/add-module-assessment', async (req, res) => {
    try {
        const module = req.body;
        const db = admin.firestore();
        await db.collection('modules').doc(module.id).set({
            'assessment_id': module.assessmentId 
        });
        res.status(200).send({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error });
    }
});

//Add Exam to a module
router.post('/add-module-exam', async (req, res) => {
    try {
        const module = req.body;
        const db = admin.firestore();
        await db.collection('modules').doc(module.id).set({
            'exam_id': module.examId 
        });
        res.status(200).send({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error });
    }
});

module.exports = router