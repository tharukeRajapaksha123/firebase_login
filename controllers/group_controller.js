const express = require("express");
const admin = require("firebase-admin")
const credentials = require("../serviceAccountKeys.json");

const router = express.Router();

const fb = require("firebase/app");
const auth = require("firebase/auth")
const db = admin.firestore()


// Create a new group
router.post('/create-group', async (req, res) => {
    const groupName = req.body.groupName;
    const data = {
        "assessment_avarage": req.body.assessment_avarage ?? null,
        "course_ids": req.body.re ?? null,
        "created_at": Date(),
        "diary_ids": req.body.diary_ids ?? null,
        "exam_averages": req.body.exam_averages ?? null,
        "on_break": req.body.on_break ?? null,
        "playbook_ids": req.body.playbook_ids ?? null,
        "survey_ids": req.body.survey_ids ?? null,
        "title": req.body.title ?? null,
        "trainer_id": req.body.trainer_id ?? null,
        "trainers": req.body.trainers ?? null,
    }
    return await db.collection("userGroups").add(data)
        .then((group) => {
            return res.status(201).json({ group });
        })
        .catch((error) => {
            return res.status(501).json({ error });
        });
});

// Add triuner to a group
router.post('/add-trainer/:id', async (req, res) => {
    const groupId = req.params.id;
    const { trainerIds } = req.body;
    return await admin.firestore()
        .collection("userGroups").doc(groupId)
        .get()
        .then((async (snpshot) => {
            if (snpshot.exists) {
                let ids = []
                const trainers = snpshot.data()["trainers"];
                for(var id of trainers){
                    ids.push(id)
                }
                for(var id of trainerIds){
                    ids.push(id)
                }
                return await admin.firestore().collection("userGroups").doc(groupId).update({
                    "trainers" : ids,
                }).then(val=>res.status(201).json({"message" : "Added succesfully"}))

            } else {
                return res.status(404).json({ "message": "group not found" });
            }

        }))
        .catch(error => res.status(500).json({ "message": "Add Instructor failed " + error }))
});

// Add playbook to a group
router.post('/add-playbook/:id', async (req, res) => {
    const groupId = req.params.id;
    const { playbook_ids } = req.body;
    return await admin.firestore()
        .collection("userGroups").doc(groupId)
        .get()
        .then((async (snpshot) => {
            if (snpshot.exists) {
                let ids = []
                const trainers = snpshot.data()["playbook_ids"] ?? [];
                for(var id of trainers){
                    ids.push(id)
                }
                for(var id of playbook_ids){
                    ids.push(id)
                }
                return await admin.firestore().collection("userGroups").doc(groupId).update({
                    "playbook_ids" : ids,
                }).then(val=>res.status(201).json({"message" : "Added succesfully"}))

            } else {
                return res.status(404).json({ "message": "group not found" });
            }

        }))
        .catch(error => res.status(500).json({ "message": "Add Playbook failed " + error }))
});
// Add course to a group
router.post('/add-course/:id', async (req, res) => {
    const groupId = req.params.id;
    const { course_ids } = req.body;
    return await admin.firestore()
        .collection("userGroups").doc(groupId)
        .get()
        .then((async (snpshot) => {
            if (snpshot.exists) {
                let ids = []
                const trainers = snpshot.data()["course_ids"] ?? [];
                for(var id of trainers){
                    ids.push(id)
                }
                for(var id of course_ids){
                    ids.push(id)
                }
                return await admin.firestore().collection("userGroups").doc(groupId).update({
                    "course_ids" : ids,
                }).then(val=>res.status(201).json({"message" : "Added succesfully"}))

            } else {
                return res.status(404).json({ "message": "group not found" });
            }

        })).catch(error => res.status(500).json({ "message": "Add Course failed " + error }))
});
// Add course to a group
router.put('/remove-course/:id', async (req, res) => {
    const groupId = req.params.id;
    const { course_ids } = req.body;
    return await admin.firestore()
        .collection("userGroups").doc(groupId)
        .get()
        .then((async (snpshot) => {
            if (snpshot.exists) {
           
                const trainers = snpshot.data()["course_ids"] ?? [];
               
                for(var id of trainers){
                    for(var courseId of course_ids){
                        if(courseId === id){
                           
                            const index = trainers.indexOf(courseId)
                            trainers.splice(index,1)
                        }
                    }
                }
      
                return await admin.firestore().collection("userGroups").doc(groupId).update({
                    "course_ids" : trainers,
                }).then(val=>res.status(201).json({"message" : "Updated succesfully"}))

            } else {
                return res.status(404).json({ "message": "group not found" });
            }

        }))
        .catch(error => res.status(500).json({ "message": "Add Course failed " + error }))
});

// Get all members of a group
router.get('/group-members/:groupId', (req, res) => {
    const groupId = req.params.groupId;
    admin.auth().listUsers(1000, 'customClaims.groupId==' + groupId)
        .then((listUsersResult) => {
            res.status(201).json({ users: listUsersResult.users });
        })
        .catch((error) => {
            res.status(501).json({ error });
        });
});

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

module.exports = router