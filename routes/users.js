const express = require('express')
const router = express.Router();
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const passport = require('passport')


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
    errors.push({msg : "Please push in all fields"})
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
  passport.authenticate('local', {
    successRedirect : '/dashboard',
    failureRedirect : '/users/login',
    failureFlash : true
  })(req, res, next)
})


router.get("/logout", (req, res)=>{
  req.logout()
  req.flash('success_msg', "You are logged out")
  res.redirect('/users/login')
})


module.exports = router;
