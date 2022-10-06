const { Router } = require("express");
const User = require("./models/User");
const router = Router();
const jwt = require("jsonwebtoken");
const config = require("./config");
const verifyToken = require("./controllers/verifyToken");
const { serialize } = require("cookie");

router.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});
router.get("/signin", (req, res) => {
  res.sendFile(__dirname + "/public/signin.html");
});

router.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;
  const user = new User({
    username,
    email,
    password,
  });
  console.log(user);
  user.password = await user.encryptPassword(user.password);
  console.log(user.password);
  await user.save();
  const token = jwt.sign({ id: user._id }, config.secret, {
    expiresIn: 60 * 60 * 24,
  });
  res.json({ auth: true, token: token });
});

router.get("/me", verifyToken, async (req, res, next) => {
  const user = await User.findById(req.userId, { password: 0 });
  if (!user) {
    return res.status(404).send("No user found.");
  }
  res.json(user);
});

router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).send("The email doesn't exists");
  }
  const passIsValidate = await user.validatePassword(password);
  if (!passIsValidate) {
    return res.status(401).json({ auth: false, token: null });
  }
  const token = jwt.sign({ id: user._id }, config.secret, {
    expiresIn: 60 * 60 * 24,
  });
  //res.json({ auth: true, token: token });

  //res.set("x-access-token", token);
  const serialized = serialize("myTokenName", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  }); /*
  res.cookie("x-access-token", token);
  res.redirect("/me");*/

  //res.body("token", token);

  //res.json({ auth: true, token: token });
});

module.exports = router;
