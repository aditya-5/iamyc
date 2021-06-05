const express = require('express')
const router = express.Router();
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const passport = require('passport')
const request = require('request');
const bodyParser = require('body-parser')

// Middleware
router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())


router.get("/login", (req, res)=>{
  res.render("login")
})


router.get("/register", (req, res)=>{






  res.render("register")
})

router.post("/register", (req, res)=>{

  const { name, email, password, password2} = req.body
  let errors = []

  if(!email || !name || !password || !password2){
    errors.push({msg : "Please fill in all fields"})
  }

  if(password != password2){
    errors.push({msg : "Passwords do not match"})
  }

  if(password.length < 6){
    errors.push({msg : "Psassword should be atleast 6 characters"})
  }

  if(errors.length > 0){
    res.render('register',{
      errors,
      name,
      email,
      password,
      password2
    })
  }
  else{
    // Validation passed
    User.findOne({email : email})
    .then(user => {

      // User already exists
      if(user){
        errors.push({msg: "User already exists"})
        res.render('register',{
          errors,
          name,
          email,
          password,
          password2
        })
      }else{

        // Create new user instance
        const newUser = new User({
          name,
          email,
          password
        })

        // Hash password
        bcrypt.genSalt(10, (err, salt)=>{
          bcrypt.hash(newUser.password, salt, (err, hash)=>{
            if(err) throw err;

            // Set the new password to the hashed password
            newUser.password = hash
            newUser.save().then(
              user => {
                req.flash('success_msg', 'You are now registered and can login')
                res.redirect('/users/login')
              }
            ).catch(err => console.log(err))
          })
        })
      }
    })
  }

})

// User login POST
router.post("/login", (req, res, next)=>{

  // Without captcha Login
  // passport.authenticate('local', {
  //   successRedirect : '/dashboard',
  //   failureRedirect : '/users/login',
  //   failureFlash : true
  // })(req, res, next)



  if(
    req.body.captcha === undefined ||
    req.body.captcha === '' ||
    req.body.captcha === null
  ){
    return res.json({"success": false, "msg":"wrong captcha"})
  }

  const secretKey = process.env.captchaSECRET || require("../config/keys").captchaSECRET;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=
  ${secretKey}&response=${req.body.captcha}
    &remoteip=${req.connection.remoteAddress}`

  request(verifyUrl, (err, response, body)=>{
    body = JSON.parse(body);

    if(body.success !== undefined && !body.success){
      return res.json({"success": false, "msg":"Failed captcha"})
    }

    passport.authenticate('local', {
      successRedirect : '/dashboard',
      failureRedirect : '/users/login',
      failureFlash : true
    })(req, res, next)


  })

})


router.get("/logout", (req, res)=>{
  req.logout()
  req.flash('success_msg', "You are logged out")
  res.redirect('/users/login')
})


module.exports = router;
