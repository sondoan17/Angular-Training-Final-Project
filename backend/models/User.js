const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
  },
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  birthDate: {
    type: Date,
    required: false,
  },
  socialMedia: {
    twitter: String,
    instagram: String,
    linkedin: String,
    github: String,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: Date,
  updatedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  googleId: { type: String, sparse: true },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
