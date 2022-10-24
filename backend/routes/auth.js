const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs"); // to create salt and pepper and also hashing
const jwt = require("jsonwebtoken"); // to create a jwt token
const fetchUser = require("../middleware/fetchUser");

const JWT_SECRET = "MayankistheOverlord$$";

//Route 1 :create a User using: Post "/api/auth/createuser"  Doesn't require auth
router.post(
  "/createuser",
  [
    body("email", "Enter a Valid email").isEmail(),
    body("name", "Enter a Valid name").isLength({ min: 3 }),
    body("password", "password should be atleast 7 character").isLength({
      min: 7,
    }),
  ],
  async (req, res) => {
    // if there are errors, it returns the bad request and the error message given
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // check weather the user with the same email exist already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "email already exist please enter another email" });
      }
      //to create salt and hash using bcrypt
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPassword,
      });
      // .then(user => res.json(user))
      // .catch(err=>{console.log(err)
      // res.json({error:'Username is already been taken',message:err.message})})

      //for jwt
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      // res.json({user})
      res.json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Route 2 :Authenticate user using: Post "/api/auth/Login"
router.post(
  "/login",
  [
    body("email", "Enter a Valid email").isEmail(),
    body("password", "Enter your password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // hecking weather user exist or not
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: "Login using correct credentials"});
      }
      const passwordCompare = await bcrypt.compare(password,user.password);
      if (!passwordCompare) {
        return res.status(400).json({ errors: "Login using correct credentials"});
      }
    //   sending the response
      const payload = {
        user:{
            id: user.id
        }
      }
      const authToken = jwt.sign(payload, JWT_SECRET);
      res.json({ authToken });
    } catch (error) {
        console.log(error.message);
      res.status(500).send("Internal Server error");
    }
  }
);


//Route 3 :Get logedin User Details: Post "/api/auth/getuser" Login Required
router.post(
    "/getuser", fetchUser,
    async (req, res) => {
try {
    userId = req.user.id
    const user = await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server error");
    
}
    })
module.exports = router;
