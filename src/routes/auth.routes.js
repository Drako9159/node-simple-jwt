const { Router } = require("express");
const router = Router();
const User = require("../models/User");
const verifyToken = require("../controllers/verifyToken");

const {
  renderSignup,
  renderSignin,
  signUp,
  signIn,
  signOut,
} = require("../controllers/auth.controller.js");
const { sign } = require("jsonwebtoken");

router.get("/signup", renderSignup);

router.get("/signin", renderSignin);

router.post("/signup", signUp);

router.post("/signin", signIn);

router.get("/signout", signOut);

router.get("/me", verifyToken, async (req, res, next) => {
  const user = await User.findById(req.userId, { password: 0 });
  if (!user) {
    return res.status(404).send("No user found.");
  }
  res.json(user);
});

module.exports = router;
