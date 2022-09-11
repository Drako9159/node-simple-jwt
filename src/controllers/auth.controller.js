const { Router } = require("express");
const User = require("../models/User");
const router = Router();
const jwt = require("jsonwebtoken");
const config = require("../config");

router.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;

  const user = new User({
    username,
    email,
    password,
  });
  user.password = await user.encryptPassword(user.password);
  await user.save();
  const token = jwt.sign({ id: user._id }, config.secret, {
    expiresIn: 60 * 60 * 24,
  });
  res.json({ auth: true, token: token });
});

router.get("/me", (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(401).json({ auth: false, message: "No token provided." });
  }
  const decoded = jwt.verify(token, config.secret);
  console.log(decoded);

  res.json({ message: "Me" });
});

router.post("/signin", (req, res, next) => {
  res.json({ message: "Signin" });
});

module.exports = router;
