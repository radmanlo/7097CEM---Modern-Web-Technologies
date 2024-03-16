const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        validate: { 
          validator: function(value) {
            return /^[A-Za-z\s]+$/.test(value);
          },
          message: '{VALUE} is not a valid name'
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email address'
    }
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: null,
        enum: ['ADMIN', 'KITCHEN', 'SERVER', 'WELCOME']
    }
});

// Hash the email and password before saving the user data
userSchema.pre('save', async function (next) {
  const user = this;

  // Only hash the password if they have been modified (or are new)
  if (!user.isModified('password') && !user.isModified('email')) return next();

  try {
    // Generate a salt to add randomness to the hash
    const salt = await bcrypt.genSalt(10);

    // Hash the password and email with the salt
    if (user.isModified('password')) {
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;
    }

    next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model('userSchema', userSchema);