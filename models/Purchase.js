const mongoose = require('mongoose')

const PurchaseSchema = new mongoose.Schema({
  paymentObject:{
    type: String,
    required: true
  }
})

const Purchase = mongoose.model("Purchase", PurchaseSchema)

module.exports = Purchase
