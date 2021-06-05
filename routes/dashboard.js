const express = require('express')
const router = express.Router()
const Member = require("../models/Member")
const {ensureAdminAuthenticated}= require('../config/admin_auth')
const {ensureAuthenticated}= require('../config/auth')
const multer = require('multer')
const mongoose = require('mongoose')
const sharp = require('sharp')
const fs = require('fs')


const storage = multer.diskStorage({

  // Directly save the file instead of using sharp
  // destination: function(req, file, cb){
  //   cb(null, './uploads/')
  // },
  filename: function(req, file, cb){
    cb(null, new Date().toISOString() + file.originalname)
  }
})

const fileFilter = (req, file, cb)=> {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    cb(null, true)
  else
    cb(null, false)
}

const upload = multer({ storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
},
  fileFilter: fileFilter
})


router.get('/add',ensureAdminAuthenticated, (req, res)=>{
  res.render('members/add')
})


router.get('/all',ensureAdminAuthenticated, (req, res)=>{
  Member.find({})
  .then(member=> {
    res.render('members/all', {members:member})
  })
  .catch(err=> console.log(err))


})

router.post('/add', upload.single('userImage'),  async (req, res)=>{
  const { name, email, memberno} = req.body
  // const userImage = req.file.path
  const userImage = "uploads/"+req.file.filename
  await sharp(req.file.path).resize({width:300, height:300})
  .toFile(__dirname+"/../uploads/"+req.file.filename)
  .then(data=>console.log(data))
  .catch(err=>console.log(err))

  let errors = []

  if(!name || !email || !memberno){
    errors.push({msg:"Please fill in all the fields"})
  }

  if(errors.length > 0){
    res.render('./members/add',{
      errors,
      name,
      email,
      memberno
    })
  }
  else{
    Member.findOne({memberno:memberno })
    .then(member=>{

        // If member already exists
          if(member){
          errors.push({msg: "Member already exists"})
          res.render('add',{
            errors,
            name,
            email
          })
        }

        let newName = capitalizeTheFirstLetterOfEachWord(name)
        let newEmail = email.toLowerCase()
        let newMemberno = memberno.toUpperCase().split(" ").join("")

        // if member doesn't exist
        const newMember = new Member({
          name:newName,
          email:newEmail,
          memberno:newMemberno,
          userImage: userImage
        })

        newMember.save().then(
          member => {
            req.flash('success_msg', 'Member added to database with id: '+newMemberno)
            res.redirect('/dashboard/add')
          }
        ).catch(err => console.log(err))


      }
    )
    .catch(err => console.log(err))
  }


})


router.get('/search',ensureAuthenticated, (req, res)=>{
  res.render('members/search')
})

router.post('/search', (req, res)=>{
  const {memberno} = req.body
  let errors = []

  if( !memberno){
    errors.push({msg:"Please enter a membership number"})
  }

  if(errors.length > 0){
    res.render('./members/search',{
      errors,
      memberno
    })
  }else{
    Member.findOne({memberno:memberno })
    .then(member =>{
      console.log(member)
      if(member){
        res.render('./members/search',{
          errors,
          memberno,
          member: member
        })
      }else{
        errors.push({msg:"No member found with that ID"})
        res.render('./members/search',{
          errors,
          memberno
        })
      }
    })
    .catch(err => console.log(err))
  }

})

router.post('/delete/:id',ensureAdminAuthenticated, (req, res)=>{
  const id = req.params.id
  console.log(mongoose.Types.ObjectId.isValid(id));
  Member.findByIdAndDelete(id)
  .then(data=>{
    try {
      fs.unlinkSync(data.userImage)
    } catch (e) {
      console.log(e)
    }

    res.redirect('/dashboard/all')
  })
  .catch(err=> console.log(err))

})


function capitalizeTheFirstLetterOfEachWord(words) {
   var separateWord = words.toLowerCase().split(' ');
   for (var i = 0; i < separateWord.length; i++) {
      separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
      separateWord[i].substring(1);
   }
   return separateWord.join(' ');
}

module.exports = router
