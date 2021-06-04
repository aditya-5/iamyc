const express = require('express')
const app = express()
const expressLayouts = require("express-ejs-layouts")
const PORT = process.env.PORT || 3000
var expressSanitizer = require('express-sanitizer')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

// Passport config
require("./config/passport")(passport)

// DB Config (Development)
// const db = require("./config/keys").MongoURI

// DB Config (Production)
const db = process.env.MongoURI


// Middleware
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.use(expressSanitizer());
app.use(express.static(__dirname+'/public'))
app.use('/uploads',express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(methodOverride('_method'))
app.use(session({
  secret: 'hold the door',
  resave: false,
  saveUninitialized: true,
}))

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.use(flash())

// Global variables
app.use((req, res, next)=>{
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next();
})

mongoose.connect(db, { useUnifiedTopology: true , useNewUrlParser: true })
.then(()=> {console.log("MongoDB Connected")})
.catch(err=>{
  console.log(err)
})


//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/dashboard', require('./routes/dashboard'))


app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
