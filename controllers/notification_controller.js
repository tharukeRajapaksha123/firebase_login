const express = require("express");
const FCM = require("fcm-node")
const SERVER_KEY = "AAAApawBGyc:APA91bGChXg07JNhs7r0wbct5rQItV0fxEdT08tAWfZ8S_s5Z2Y9-veurmPusH5qh4AI45SNRaan_zL3c0FhJ1UFgVgeotANNtXyxHennGL7ip84hyKvbcNHjGW6sUe_JApdKPWpCe2c";
const router = express.Router();

router.post("/fcm", async (req, res, next) => {
    try {
        let fcm = new FCM(SERVER_KEY);
        let message = {
            to: '/topics/' + req.body.topic,
            notification: {
                title: req.body.title,
                body: req.body.body,
                sound: 'default',
                "click_action": "FCM_PLUGIN_ACTIVITY",
                "icon": "fcm_push_icon",
            }
        }

        fcm.send(message, (error, response) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                return res.json(response);
            }
        })
    } catch (error) {
        return res.status(500).json(error);

    }
})


module.exports = router