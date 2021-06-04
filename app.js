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
// require("./config/passport")(passport)

// DB Config (Development)
const db = require("./config/keys").MongoURI

// DB Config (Production)
// const db = process.env.MongoURI


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
app.use('/buy', require('./routes/buy'))


// ******************
// Paypal V1 integration
// ******************
// const paypal = require('paypal-rest-sdk')
// const Purchase = require("./models/Purchase")
//
//
// paypal.configure({
//   'mode': 'sandbox', //sandbox or live
//   'client_id': require("./config/keys").ClientID,
//   'client_secret': require("./config/keys").ClientSECRET
// });
//
//

// app.get('/buy', (req, res)=>{
//   res.render('payment/buy')
// })

//
// app.post('/pay',(req,res)=>{
//   const create_payment_json = {
//     "intent": "sale",
//     "payer": {
//         "payment_method": "paypal"
//     },
//     "redirect_urls": {
//         "return_url": "http://localhost:3000/success",
//         "cancel_url": "http://localhost:3000/cancel"
//     },
//     "transactions": [{
//         "item_list": {
//             "items": [{
//                 "name": "IAMYC Membership",
//                 "sku": "1",
//                 "price": "5.00",
//                 "currency": "GBP",
//                 "quantity": 1
//             }]
//         },
//         "amount": {
//             "currency": "GBP",
//             "total": "5.00"
//         },
//         "description": "IAMYC Membership : Get discounts at partner restaurants"
//     }]
// };
//
// paypal.payment.create(create_payment_json, function (error, payment) {
//     if (error) {
//         throw error;
//     } else {
//       console.log(payment)
//         for(let i=0;i< payment.links.length; i++){
//           if(payment.links[i].rel === "approval_url"){
//             res.redirect(payment.links[i].href)
//           }
//
//         }
//     }
// });
// })
//
// app.get('/success',(req, res)=>{
//   const payerId = req.query.PayerID
//   const paymentId = req.query.paymentId
//   const execute_payment_json = {
//     "payer_id": payerId,
//     "transactions": [{
//         "amount": {
//             "currency": "GBP",
//             "total": "5.00"
//         }
//     }]
//   };
//
//   paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
//     if (error) {
//         console.log(error.response);
//         throw error;
//     } else {
//         console.log(JSON.stringify(payment));
//         const purchaseTemp = new Purchase({
//           paymentObject: JSON.stringify(payment)
//         })
//
//         let dbUpdate = false;
//         purchaseTemp.save().then(
//           purchase => {
//             dbUpdate = true;
//           }
//         ).catch(err => console.log(err))
//
//
//         res.render("payment/success", {payment: payment, success:dbUpdate})
//     }
//   });
// })
//
// app.get('/cancel',(req, res)=>{
//   res.render("payment/cancel")
// })



app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
