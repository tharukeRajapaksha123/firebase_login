
const express = require("express");
const admin = require("firebase-admin")
const credentials = require("../serviceAccountKeys.json");

const router = express.Router();

const fb = require("firebase/app");
const auth = require("firebase/auth")
const db = admin.firestore()


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