// **********************************
// ********** DEPENDENCIES **********
// **********************************
require("dotenv").load();
var bodyParser = require("body-parser");
// var cors = require("cors");
var exphbs = require("express-handlebars");
var express = require("express");
var passport = require("passport");
var session = require("express-session");

// For Express
var app = express();
var PORT = process.env.PORT || 3000;
app.use(express.static(__dirname + "/public"));

// For BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// For Passport
app.use(
  session({
    secret: process.env.SECRET, // session secret
    resave: process.env.RESAVE,
    saveUninitialized: process.env.SAVEUNINITIALIZED
  })
);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// For Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "testmain"
  })
);
app.set("view engine", "handlebars");

// For MySQL
var syncOptions = { force: false };
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// For CORS
// var corsOptions = {
//   origin: process.env.ORIGIN,
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
// app.use(cors());

// ****************************
// ********** MODELS **********
// ****************************
var models = require("./models");

// ***************************
// ********** ROUTES *********
// ***************************
require("./routes/authRoutes.js")(app, passport);
require("./routes/htmlRoutes.js")(app, passport);

// ********************************
// ********** STRATEGIES **********
// ********************************
require("./config/passport/passport.js")(passport, models.user);

////////////////////////////////////
////////// Sync and Start //////////
////////////////////////////////////
models.sequelize
  .sync(syncOptions)
  .then(function() {
    console.log("Nice! Database looks fine");
    // Start Server
    app.listen(PORT, function(err) {
      if (!err) {
        console.log(
          "CORS ENABLED ==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
          PORT,
          PORT
        );
      }
      console.log(err);
    });
  })
  .catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!");
  });
