const http = require("http")
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')

const userController = require("./controllers/user_controller")
const groupController = require("./controllers/group_controller")
const notificationController = require("./controllers/notification_controller")
const moduleController = require("./controllers/module_controller")

var app = express();
const port = 8080

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use("/",userController)
app.use("/group-controller",groupController)
app.use("/notification-controller",notificationController)
app.use("/module-controller",moduleController);

http.createServer(app).listen(port, () => console.log(`Server is running on port ${port}`));