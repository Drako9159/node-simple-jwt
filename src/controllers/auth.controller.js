const path = require("path");
const { serialize } = require("cookie");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");

function renderSignup(req, res) {
  res.sendFile(path.join(__dirname, "../views", "signup.html"));
}
function renderSignin(req, res) {
  res.sendFile(path.join(__dirname, "../views", "signin.html"));
}
async function signUp(req, res) {
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
  //res.json({ auth: true, token: token });
  const serialized = serialize("myTokenName", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  res.setHeader("Set-Cookie", serialized);
  res.redirect("/me");
}
async function signIn(req, res) {
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
  });
  res.setHeader("Set-Cookie", serialized);
  res.redirect("/me");
  //res.body("token", token);
  //res.json({ auth: true, token: token });
}
async function signOut(req, res) {
  if (!req.headers.cookie) {
    return res.status(403).send({ auth: false, message: "No token provided." });
  }
  const token = req.headers.cookie.split("myTokenName=")[1];
  if (!token) {
    return res.status(401).json({ auth: false, message: "No token provided." });
  }
  const decoded = jwt.verify(token, config.secret);
  const serialized = serialize("myTokenName", null, {
    //TODO para serializar la cookie
    httpOnly: true,
    //TODO para que solo se pueda acceder a la cookie desde el servidor
    secure: process.env.NODE_ENV === "production",
    //TODO en production necesitamos SSL para que funcione
    sameSite: "strict",
    //TODO para backEnd externo poner en "none"
    //TODO para que la cookie solo se pueda enviar en peticiones de la misma pagina
    maxAge: 0,
    //TODO para que la cookie expire en 30 dias
    path: "/",
    //TODOO para que la cookie este disponible en toda la pagina
  });
  res.setHeader("Set-Cookie", serialized);
  res.status(200).json("logout Sucessfully");
}
module.exports = {
  renderSignup,
  renderSignin,
  signUp,
  signIn,
  signOut,
};
