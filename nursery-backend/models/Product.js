const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, required: true },
  images: [{ type: String }],
  category: {
    type: String,
    enum: ['Indoor Plants', 'Outdoor Plants', 'Medicinal Plants', 'Flowering Plants', 'Succulents', 'Air Purifying Plants'],
    default: 'Indoor Plants'
  },
  stock: { type: Number, default: 10 },
  sold: { type: Number, default: 0 },
  // Plant care info
  sunlight: { type: String, default: 'Medium' },
  watering: { type: String, default: 'Twice per week' },
  soil: { type: String, default: 'Well drained' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  petFriendly: { type: Boolean, default: true },
  // Ratings
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  // Season tags
  season: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
