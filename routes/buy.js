const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const paypal = require('@paypal/checkout-server-sdk');
const payPalClient = require('./paypalClient');
const nodemailer = require("nodemailer");

// *************************
// Paypal V2 Checkout System
// *************************
router.get('/', (req, res)=>{
  res.render('payment/buy')
})

router.post('/payment', async function handleRequest(req, res) {

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'GBP',
            value: '5.50'
          }
        }]
      });

      let order;
      try {
        order = await payPalClient.client().execute(request);
      } catch (err) {
        console.error(err);
        return res.send(500);
      }

      res.status(200).json({
        orderID: order.result.id
      });
      }
)


router.post('/:id/capture/', async function handleRequest(req, res) {

  const orderID = req.params.id;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  let capture;
    try {
    capture = await payPalClient.client().execute(request);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }

  const output= `
  <p> Thank you for buying the IAM Youth Committee membership. We are delighted to have you on board. </p>
  <p> Your order details are as follows - </p>
  <table border=1>
  <tr> <td> Order ID</td><td> ${capture.result.id} </td></tr>
  <tr> <td> Membership Email</td><td> ${capture.result.payer.email_address} </td></tr>
  <tr> <td> Name</td><td> ${capture.result.payer.name.given_name} ${capture.result.payer.name.surname} </td></tr>
  <tr> <td> Amount Paid</td><td> ${capture.result.purchase_units[0].payments.captures[0].amount.currency_code} ${capture.result.purchase_units[0].payments.captures[0].amount.value} </td></tr>

  <tr> <td> Items Purchased</td><td> IAMYC Membership </td></tr>
  </table>
  <p>We will be in touch with you with your membership details within 24-48 hours.
  Looking forward to serving you with the best deals in town.  </p>
  <font color="red"> <p>Important : Please reply to this email and send us a picture of yourself in which your face is distinctly visible.
  This is intended for verification purposes for whenever you visit one of our partner restaurants.</p></font>
  <br>
  Regards
  <br>
  Team IAMYC
  <img  src="cid:iam">
  `

  let transporter = nodemailer.createTransport({
  host: "smtp.porkbun.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "contact@adityagarwal.co", // generated ethereal user
    pass: process.env.emailPASS || require("../config/keys").emailPASS, // generated ethereal password
  },
});





// send mail with defined transport object
let info = transporter.sendMail({
  from: '"IAM Youth Committee" <contact@adityagarwal.co>', // sender address
  to: `thats.adi.007@Gmail.com, ${capture.result.payer.email_address}`, // list of receivers
  subject: "Order Confirmation: IAMYC Membership", // Subject line
  text: "", // plain text body
  html: output, // html body
  attachments: [{
          filename: 'iam.png',
          path: __dirname +'/../public/iam.png',
          cid: 'iam'
      }],
});





  res.status(200).json({
    orderData: capture.result
  });
})



module.exports = router
