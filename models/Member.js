const mongoose = require('mongoose')

const MemberSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  memberno:{
    type: String,
    required: true
  },
  userImage:{
    type: String,
    required: true
  },
})

const Member = mongoose.model("Member", MemberSchema)

module.exports = Member
