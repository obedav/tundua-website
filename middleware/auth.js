// Middleware to protect admin routes
module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.session && req.session.isAdmin) {
        return next();
      }
      res.redirect('/admin/login');
    }
  };