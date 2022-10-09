const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
  },
  icon: {
    type: String,
  },
  /* image: {
    type: String,
    required: true,
  }, */
});

exports.Category = mongoose.model('Category', categorySchema);
