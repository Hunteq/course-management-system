const User = require('../models/User');
const Batch = require('../models/Batch');
const Test = require('../models/Test');

// Admin Dashboard
exports.dashboard = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const batches = await Batch.countDocuments();
    const staff = await User.countDocuments({ role: 'staff' });
    const students = await User.countDocuments({ role: 'student' });

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      users,
      batches,
      staff,
      students
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// Manage Users
exports.manageUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const batches = await Batch.find();

    res.render('admin/manageUsers', {
      title: 'Manage Users',
      users,
      batches
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/dashboard');
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
      console.log('Attempting to delete user:', req.params.id);
      const user = await User.findById(req.params.id);
      
      if (!user) {
        console.log('User not found');
        req.flash('error_msg', 'User not found');
        return res.redirect('/admin/manage-users');
      }
  
      console.log('Found user:', user.email);
      
      if (user.role === 'student' && user.batch) {
        console.log('Removing student from batch:', user.batch);
        await Batch.findByIdAndUpdate(user.batch, { $pull: { students: user._id } });
      }
  
      console.log('Deleting user...');
      await user.deleteOne();
      
      req.flash('success_msg', 'User deleted successfully');
      res.redirect('/admin/manage-users');
    } catch (err) {
      console.error('Error deleting user:', err);
      req.flash('error_msg', 'Server Error: ' + err.message);
      res.redirect('/admin/manage-users');
    }
  };

// Manage Batches
exports.manageBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate('students').sort({ createdAt: -1 });

    res.render('admin/batches', {
      title: 'Manage Batches',
      batches
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/dashboard');
  }
};

// Create Batch
exports.createBatch = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      req.flash('error_msg', 'Batch name is required');
      return res.redirect('/admin/batches');
    }

    const batch = new Batch({
      name,
      description,
      createdBy: req.user.id
    });

    await batch.save();
    req.flash('success_msg', 'Batch created successfully');
    res.redirect('/admin/batches');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/batches');
  }
};

// View Batch
exports.viewBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('students')
      .populate('createdBy');

    if (!batch) {
      req.flash('error_msg', 'Batch not found');
      return res.redirect('/admin/batches');
    }

    const studentsNotInBatch = await User.find({
      role: 'student',
      _id: { $nin: batch.students }
    });

    res.render('admin/viewBatch', {
      title: batch.name,
      batch,
      studentsNotInBatch
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/batches');
  }
};

// Add Student to Batch
exports.addStudentToBatch = async (req, res) => {
    try {
      const batchId = req.params.id; 
      const { studentId } = req.body;
  
      const batch = await Batch.findById(batchId);
      if (!batch) {
        req.flash('error_msg', 'Batch not found');
        return res.redirect('/admin/batches');
      }
  
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        req.flash('error_msg', 'Student not found');
        return res.redirect(`/admin/batches/${batchId}`);
      }
  
      if (batch.students.includes(studentId)) {
        req.flash('error_msg', 'Student already in this batch');
        return res.redirect(`/admin/batches/${batchId}`);
      }
  
      student.batch = batchId;
      await student.save();
  
      batch.students.push(studentId);
      await batch.save();
  
      req.flash('success_msg', 'Student added to batch successfully');
      res.redirect(`/admin/batches/${batchId}`);
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect(`/admin/batches/${req.params.id}`);
    }
  };

// Remove Student from Batch
exports.removeStudentFromBatch = async (req, res) => {
    try {
      const { batchId, studentId } = req.params;
  
      const batch = await Batch.findById(batchId);
      if (!batch) {
        req.flash('error_msg', 'Batch not found');
        return res.redirect('/admin/batches');
      }
  
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        req.flash('error_msg', 'Student not found');
        return res.redirect(`/admin/batches/${batchId}`);
      }
  
      batch.students.pull(studentId);
      await batch.save();
  
      student.batch = undefined;
      await student.save();
  
      req.flash('success_msg', 'Student removed from batch successfully');
      res.redirect(`/admin/batches/${batchId}`);
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect(`/admin/batches/${batchId}`);
    }
  };

// Delete Batch
exports.deleteBatch = async (req, res) => {
    try {
      const batch = await Batch.findById(req.params.id);
      if (!batch) {
        req.flash('error_msg', 'Batch not found');
        return res.redirect('/admin/batches');
      }
  
      await User.updateMany(
        { batch: batch._id },
        { $unset: { batch: "" } }
      );
  
      await Test.deleteMany({ batches: batch._id });
  
      await Batch.findByIdAndDelete(req.params.id);
  
      req.flash('success_msg', 'Batch deleted successfully');
      res.redirect('/admin/batches');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error: ' + err.message);
      res.redirect('/admin/batches');
    }
  };


// Show edit user form
exports.showEditUserForm = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      const batches = await Batch.find();
  
      if (!user) {
        req.flash('error_msg', 'User not found');
        return res.redirect('/admin/manage-users');
      }
  
      res.render('admin/editUser', {
        title: 'Edit User',
        user,
        batches
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/admin/manage-users');
    }
  };
  
  // Update user
  exports.updateUser = async (req, res) => {
    try {
      const { name, email, role, batch } = req.body;
      const user = await User.findById(req.params.id);
  
      if (!user) {
        req.flash('error_msg', 'User not found');
        return res.redirect('/admin/manage-users');
      }
  
      if (!name || !email || !role) {
        req.flash('error_msg', 'Please fill in all required fields');
        return res.redirect(`/admin/users/${user._id}/edit`);
      }
  
      if (email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          req.flash('error_msg', 'Email already in use by another user');
          return res.redirect(`/admin/users/${user._id}/edit`);
        }
      }
  
      user.name = name;
      user.email = email;
      user.role = role;
  
      if (role === 'student') {
        if (batch && batch !== user.batch?.toString()) {
          if (user.batch) {
            await Batch.findByIdAndUpdate(user.batch, { $pull: { students: user._id } });
          }
          user.batch = batch;
          await Batch.findByIdAndUpdate(batch, { $push: { students: user._id } });
        }
      } else {
        if (user.role === 'student' && user.batch) {
          await Batch.findByIdAndUpdate(user.batch, { $pull: { students: user._id } });
          user.batch = undefined;
        }
      }
  
      await user.save();
      req.flash('success_msg', 'User updated successfully');
      res.redirect('/admin/manage-users');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect(`/admin/users/${req.params.id}/edit`);
    }
  };