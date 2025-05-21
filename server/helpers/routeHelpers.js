module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/auth/login');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/dashboard');      
    },
    ensureStaff: function(req, res, next) {
      if (req.isAuthenticated() && (req.user.role === 'staff' || req.user.role === 'admin')) {
        return next();
      }
      req.flash('error_msg', 'You are not authorized to view that resource');
      res.redirect('/dashboard');
    },
    ensureAdmin: function(req, res, next) {
      if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
      }
      req.flash('error_msg', 'You are not authorized to view that resource');
      res.redirect('/dashboard');
    }
  };