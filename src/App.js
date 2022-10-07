const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//TODO Static Files
//app.set("views", path.join(__dirname + "/views"));

//app.set("views engine", "ejs");

app.use(express.static(path.join(__dirname, "views")));
//app.use(express.static(__dirname + "/public"));
// routes
app.use(require("./routes/auth.routes"));

// 404 handler
app.use((req, res, next) => {
  res.status(404).send("404 Not Found");
});

module.exports = app;
