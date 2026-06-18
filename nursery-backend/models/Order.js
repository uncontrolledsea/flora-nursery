const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
  }],
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
  },
  paymentMethod: {
    type: String,
    enum: ['COD','Razorpay', 'UPI', 'Card', 'NetBanking'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  trackingHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  deliveryDate: { type: Date },
}, { timestamps: true });

// Auto-add to tracking history on status change
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.trackingHistory.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
