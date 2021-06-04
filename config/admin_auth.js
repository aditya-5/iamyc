module.exports = {
  ensureAdminAuthenticated: function(req, res, next){
    if(req.isAuthenticated()){
      if(req.user.email == "admin@admin.com")
        return next()
      else {
        req.flash('error_msg',"You don't have permission to view this resource. Instead, login as admin to view it.")
        res.redirect("/users/login")
      }
    }else{
      req.flash('error_msg',"You don't have permission to view this resource. Please login as admin to view this page.")
      res.redirect("/users/login")
    }
  }
}
