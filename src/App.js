const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(require("./auth.controller"));
//TODO Static Files
app.use(express.static(path.join(__dirname, "public")));

// 404 handler
app.use((req, res, next) => {
  res.status(404).send("404 Not Found");
});

module.exports = app;
