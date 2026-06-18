const User = require('../models/User');

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const idx = user.wishlist.indexOf(productId);

    if (idx === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(idx, 1);
    }

    await user.save();
    const updated = await User.findById(req.user._id).populate('wishlist');
    res.json({ wishlist: updated.wishlist, added: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getWishlist, toggleWishlist };
