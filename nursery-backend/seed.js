const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const plants = [
  {
    name: 'Money Plant',
    description: 'A popular indoor plant believed to bring good luck and prosperity. Very easy to grow and maintain.',
    price: 149, originalPrice: 199,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Epipremnum_aureum_31082012.jpg/800px-Epipremnum_aureum_31082012.jpg',
    category: 'Indoor Plants', stock: 50,
    sunlight: 'Low to Medium', watering: 'Once per week', soil: 'Well drained potting mix', difficulty: 'Easy', petFriendly: false,
    rating: 4.5, numReviews: 20, season: ['All'],
  },
  {
    name: 'Tulsi (Holy Basil)',
    description: 'Sacred plant with medicinal properties. Known for its antibacterial and anti-inflammatory benefits.',
    price: 99, originalPrice: 149,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Ocimum_tenuiflorum3.jpg/800px-Ocimum_tenuiflorum3.jpg',
    category: 'Medicinal Plants', stock: 30,
    sunlight: 'Full Sun', watering: 'Daily', soil: 'Fertile, well-drained', difficulty: 'Easy', petFriendly: true,
    rating: 4.8, numReviews: 35, season: ['Summer', 'Monsoon'],
  },
  {
    name: 'Areca Palm',
    description: 'An elegant and air-purifying indoor palm that adds a tropical feel to any space.',
    price: 499, originalPrice: 699,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Dypsis_lutescens1.jpg/800px-Dypsis_lutescens1.jpg',
    category: 'Air Purifying Plants', stock: 20,
    sunlight: 'Bright Indirect', watering: 'Twice per week', soil: 'Well drained mix', difficulty: 'Medium', petFriendly: true,
    rating: 4.3, numReviews: 15, season: ['All'],
  },
  {
    name: 'Neem Tree',
    description: 'A versatile medicinal tree with amazing antibacterial, antifungal and pest-repelling properties.',
    price: 299, originalPrice: 399,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Azadirachta_indica_%28Neem%29_in_Hyderabad%2C_AP_W_IMG_0820.jpg/800px-Azadirachta_indica_%28Neem%29_in_Hyderabad%2C_AP_W_IMG_0820.jpg',
    category: 'Medicinal Plants', stock: 15,
    sunlight: 'Full Sun', watering: 'Twice per week', soil: 'Sandy loam', difficulty: 'Easy', petFriendly: false,
    rating: 4.6, numReviews: 25, season: ['Summer', 'Monsoon'],
  },
  {
    name: 'Snake Plant',
    description: 'One of the hardiest and most air-purifying plants. Perfect for beginners. Tolerates low light.',
    price: 249, originalPrice: 349,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg/800px-Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg',
    category: 'Air Purifying Plants', stock: 40,
    sunlight: 'Low to Medium', watering: 'Once every 2 weeks', soil: 'Sandy, well-drained', difficulty: 'Easy', petFriendly: false,
    rating: 4.7, numReviews: 45, season: ['All'],
  },
  {
    name: 'Peace Lily',
    description: 'Beautiful flowering plant that blooms even in low light. Excellent air purifier.',
    price: 349, originalPrice: 449,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Spathiphyllum_cochlearispathum_RTBG.jpg/800px-Spathiphyllum_cochlearispathum_RTBG.jpg',
    category: 'Flowering Plants', stock: 25,
    sunlight: 'Low to Medium', watering: 'Twice per week', soil: 'Rich, moist mix', difficulty: 'Easy', petFriendly: false,
    rating: 4.4, numReviews: 18, season: ['All'],
  },
  {
    name: 'Aloe Vera',
    description: 'A must-have succulent with medicinal gel used for skin care, burns and digestion.',
    price: 129, originalPrice: 179,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aloe_vera_flower_inset.png/800px-Aloe_vera_flower_inset.png',
    category: 'Succulents', stock: 60,
    sunlight: 'Full to Partial Sun', watering: 'Once per week', soil: 'Sandy, cactus mix', difficulty: 'Easy', petFriendly: false,
    rating: 4.9, numReviews: 60, season: ['All'],
  },
  {
    name: 'Hibiscus',
    description: 'Vibrant flowering outdoor plant. The flowers are used for making herbal tea and hair care.',
    price: 199, originalPrice: 249,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Hibiscus_rosa-sinensis1.jpg/800px-Hibiscus_rosa-sinensis1.jpg',
    category: 'Outdoor Plants', stock: 35,
    sunlight: 'Full Sun', watering: 'Daily in summer', soil: 'Rich, well-drained', difficulty: 'Medium', petFriendly: true,
    rating: 4.2, numReviews: 22, season: ['Summer', 'Monsoon'],
  },
  {
    name: 'Jade Plant',
    description: 'A long-living succulent that looks like a mini tree. Very easy to care for.',
    price: 199, originalPrice: 249,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Crassula_ovata.jpg/800px-Crassula_ovata.jpg',
    category: 'Succulents', stock: 30,
    sunlight: 'Full Sun', watering: 'Once every 2 weeks', soil: 'Sandy cactus mix', difficulty: 'Easy', petFriendly: false,
    rating: 4.4, numReviews: 12, season: ['All'],
  },
  {
    name: 'Rubber Plant',
    description: 'A stunning indoor plant with large glossy leaves. Great air purifier and very low maintenance.',
    price: 399, originalPrice: 499,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Ficus_elastica_-_leaves.jpg/800px-Ficus_elastica_-_leaves.jpg',
    category: 'Indoor Plants', stock: 18,
    sunlight: 'Bright Indirect', watering: 'Once per week', soil: 'Well drained potting mix', difficulty: 'Easy', petFriendly: false,
    rating: 4.6, numReviews: 28, season: ['All'],
  },
  {
    name: 'Mint',
    description: 'A fast-growing aromatic herb perfect for kitchen gardens. Great for cooking and making tea.',
    price: 79, originalPrice: 99,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Mint-leaves-2007.jpg/800px-Mint-leaves-2007.jpg',
    category: 'Medicinal Plants', stock: 50,
    sunlight: 'Partial Sun', watering: 'Daily', soil: 'Moist, fertile', difficulty: 'Easy', petFriendly: true,
    rating: 4.7, numReviews: 40, season: ['All'],
  },
  {
    name: 'Bougainvillea',
    description: 'A stunning climbing plant with vibrant pink/purple bracts. Perfect for gates and walls.',
    price: 249, originalPrice: 299,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Bougainvillea_Anbg.jpg/800px-Bougainvillea_Anbg.jpg',
    category: 'Outdoor Plants', stock: 22,
    sunlight: 'Full Sun', watering: 'Twice per week', soil: 'Well drained', difficulty: 'Medium', petFriendly: true,
    rating: 4.5, numReviews: 17, season: ['Summer', 'Winter'],
  },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await Product.deleteMany();
    const created = await Product.insertMany(plants);
    console.log(`✅ Seeded ${created.length} plants with online images`);
    process.exit(0);
  })
  .catch(err => { console.error(err); process.exit(1); });
