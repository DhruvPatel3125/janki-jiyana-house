import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Soft Care Ultra-Thin Sanitary Pads (Pack of 30 XL+)',
    category: 'Sanitary Pads',
    price: 299,
    mrp: 399,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Ultra-soft cottony sanitary pads designed with advanced leak-guard technology and wide wings for complete all-night protection.',
    features: ['100% Organic Cotton Top Sheet', 'Zero Rash Guarantee', 'Odour Lock Gel Technology', 'Extra Long 320mm XL+ Size'],
    rating: 4.9,
    reviewsCount: 48,
    isFeatured: true,
  },
  {
    name: 'Gentle Wings Overnight Heavy Flow Pads (Pack of 20)',
    category: 'Sanitary Pads',
    price: 249,
    mrp: 320,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Maximum absorption overnight pads crafted for heavy flow days. Breathable backsheet ensures skin stays dry and fresh.',
    features: ['Heavy Absorption Core', 'Double Wings Lock System', 'Dermatologically Tested'],
    rating: 4.7,
    reviewsCount: 32,
    isFeatured: false,
  },
  {
    name: 'ComfortFit Adult Tape Diapers - Large (Pack of 10)',
    category: 'Adult Diapers',
    price: 499,
    mrp: 650,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'High-absorbency adult tape diapers with wetness indicator, anti-leak standing leg cuffs, and refastenable side tapes.',
    features: ['Up to 12 Hours Absorption', 'Wetness Indicator Line', 'Refastenable Side Tapes', 'Odour Neutralizer'],
    rating: 4.8,
    reviewsCount: 64,
    isFeatured: true,
  },
  {
    name: 'SecureDignity Adult Pull-Up Pants - Medium (Pack of 10)',
    category: 'Adult Diapers',
    price: 549,
    mrp: 699,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Easy pull-up adult diaper pants with 360-degree stretch waistband for active seniors. Soft, cloth-like feel.',
    features: ['Underwear-Like Design', '360° Flexible Stretch Fit', 'Rapid Dry Core'],
    rating: 4.9,
    reviewsCount: 29,
    isFeatured: false,
  },
  {
    name: 'LittleAngels Baby Diaper Pants - Medium (Pack of 54)',
    category: 'Children Diapers',
    price: 699,
    mrp: 899,
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Super soft, aloe vera infused baby diaper pants that protect delicate baby skin for up to 12 hours of uninterrupted sleep.',
    features: ['Aloe Vera Lotion Coating', 'Bubble Bed Technology', '12 Hour Leakage Protection', 'Soft Elastic Waistband'],
    rating: 4.9,
    reviewsCount: 112,
    isFeatured: true,
  },
  {
    name: 'TinyTots Newborn Taped Diapers (Pack of 46)',
    category: 'Children Diapers',
    price: 599,
    mrp: 750,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Specially designed for newborn delicate skin with a umbilical cord cut-out notch and ultra-soft cotton fabric.',
    features: ['Navel Care Cutout', 'Hypoallergenic Material', 'Wetness Indicator'],
    rating: 4.8,
    reviewsCount: 57,
    isFeatured: false,
  },
  {
    name: 'GentleTouch Pure Water Baby Wipes (Pack of 3 - 240 Wipes)',
    category: 'Baby Items',
    price: 349,
    mrp: 450,
    stock: 75,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    ],
    description: '99% pure water wipes with organic chamomile extracts. Paraben-free, alcohol-free, and safe for hands, face, and diaper area.',
    features: ['99% Pure Water Formula', 'Thick Spunlace Fabric', 'pH Balanced 5.5', 'Flip-top Moisture Seal Cover'],
    rating: 4.9,
    reviewsCount: 88,
    isFeatured: true,
  },
  {
    name: 'NourishBaby Soft Lotion Shampoo & Wash 500ml',
    category: 'Baby Items',
    price: 399,
    mrp: 499,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Tear-free 2-in-1 head-to-toe baby wash enriched with natural almond oil and calendula. Mild fragrance for sensitive skin.',
    features: ['Tear-Free Formula', 'Dermatologically Approved', 'No Sulfates or Parabens'],
    rating: 4.8,
    reviewsCount: 41,
    isFeatured: false,
  },
];

const seedData = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await User.deleteMany();

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Seeded ${createdProducts.length} products successfully!`);

    const adminUser = await User.create({
      name: 'Shop Admin',
      email: 'admin@jankijiyana.com',
      password: 'adminpassword123',
      role: 'admin',
      address: {
        street: '123 Care Street',
        city: 'Surat',
        state: 'Gujarat',
        zipCode: '395003',
        phone: '+91 9876543210',
      },
    });

    console.log(`Seeded Admin User: ${adminUser.email}`);
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
