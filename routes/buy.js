const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const paypal = require('@paypal/checkout-server-sdk');
const payPalClient = require('./paypalClient');

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
  res.status(200).json({
    orderData: capture.result
  });
})



module.exports = router
