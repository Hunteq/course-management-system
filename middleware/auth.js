// Ensure user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
  };
  
  // Ensure user is not authenticated (for login/register pages)
  exports.forwardAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');
  };
  
  // Ensure user is admin
  exports.ensureAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }
    req.flash('error_msg', 'Unauthorized access');
    res.redirect('/dashboard');
  };
  
  // Ensure user is staff
  exports.ensureStaff = (req, res, next) => {
    if (req.user.role === 'staff') {
      return next();
    }
    req.flash('error_msg', 'Unauthorized access');
    res.redirect('/dashboard');
  };
  
  // Ensure user is student
  exports.ensureStudent = (req, res, next) => {
    if (req.user.role === 'student') {
      return next();
    }
    req.flash('error_msg', 'Unauthorized access');
    res.redirect('/dashboard');
  };


  