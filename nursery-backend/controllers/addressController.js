const Address = require('../models/Address');

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addAddress = async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user: req.user._id, name, phone, address, city, state, pincode, isDefault: isDefault || false
    });
    res.status(201).json(newAddress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    const addr = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    res.json(addr);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addr = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
