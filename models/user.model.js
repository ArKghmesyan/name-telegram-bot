const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  telegramId: {
    type: Number,
    required: true,
  },
  jwtToken: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model('User', userSchema);
