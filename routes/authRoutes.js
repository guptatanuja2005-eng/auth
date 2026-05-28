
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const createToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};



router.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User Registered Successfully",
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials"
      });
    }

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false
    });

    res.json({
      message: "Login Successful"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// GOOGLE OAUTH
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure"
  }),
  (req, res) => {
    const token = createToken(req.user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false
    });

    res.json({
      message: "Google Login Successful",
      user: req.user,
      token
    });
  }
);

router.get("/google/failure", (req, res) => {
  res.status(401).json({
    message: "Google Login Failed"
  });
});


// PROFILE
router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {

    const user = await User.findById(
      req.user.userId
    ).select("-password");

    res.json(user);

  }
);



router.post("/logout", (req, res) => {

  res.clearCookie("token");

  res.json({
    message: "Logout Successful"
  });

});

module.exports = router;
