const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const email = process.argv[2];
if (!email) {
  console.error('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!user) {
    console.log('User not found');
  } else {
    console.log(`✅ ${user.name} (${user.email}) is now an admin`);
  }
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
