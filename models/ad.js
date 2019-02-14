var mongoose = require('mongoose');

var adsSchema = new mongoose.Schema({
  title: String,
  image: String,
  mainCategory: String,
  category: String,
  price: String,
  city: String,
  phone: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});


module.exports = mongoose.model('Ads', adsSchema);