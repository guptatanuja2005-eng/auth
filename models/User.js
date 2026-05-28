
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String
  },

  googleId: {
    type: String
  },

  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  }
},
{
  versionKey: false
}
);

module.exports = mongoose.model("User", userSchema);
