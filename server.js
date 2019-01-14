// Require dependencies
var express = require("express");
var mongoose = require("mongoose");
var expressHandlebars = require("express-handlebars");
var bodyParser = require("body-parser");

// Set up port
var PORT = process.env.PORT || 3000;

// Initiate express app
var app = express();

// Set up express router
var router = express.Router();

// Require our routes file to pass route object
require("./config/routes")(router);

// Designate Public folder as static directory
app.use(express.static(__dirname + "/public"));

// Connect Handlebars to express app
app.engine("handlebars", expressHandlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Use bodyParser in app
app.use(bodyParser.urlencoded({
    extended: false
}));

// Have request go through router middleware
app.use(router);

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Connect mongoose to our database
mongoose.connect(db, function(error){
    // Log any errors connecting with mongoose
    if (error) {
        console.log(error);
    } else {
        console.log("mongoose connection is successful");
    }
})

// Listen on the port
app.listen(PORT, function() {
    console.log("Listening on port:" + PORT);
});
