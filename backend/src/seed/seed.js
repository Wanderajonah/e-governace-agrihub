const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Produce = require('../models/Produce');
const ProduceVerification = require('../models/ProduceVerification');
const CommodityPrice = require('../models/CommodityPrice');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).catch(err => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});

const now = new Date();
function daysAgo(n) { const d = new Date(now); d.setDate(d.getDate() - n); return d; }
function monthsAgo(n, day) { const d = new Date(now); d.setMonth(d.getMonth() - n); d.setDate(day || 15); return d; }

const usersData = [
  { name: "Wandera Jonah", email: "admin@agrihub.com", role: "Administrator", agency: "KCCA", status: "Active", phone: "+256 700 000 001", password: "admin123" },
  { name: "Sarah Tendo", email: "officer@agrihub.com", role: "Market Officer", agency: "KCCA", status: "Active", phone: "+256 700 000 002", password: "officer123" },
  { name: "Grace Akinyi", email: "inspector@agrihub.com", role: "Produce Inspector", agency: "KCCA", status: "Active", phone: "+256 700 000 003", password: "inspector123" },
  { name: "David Okello", email: "gov@agrihub.com", role: "Government Officer", agency: "MAAIF", status: "Active", phone: "+256 700 000 004", password: "gov123" },
  { name: "John Ssekandi", email: "farmer@agrihub.com", role: "Farmer", agency: "Farmer", status: "Active", phone: "+256 700 000 005", password: "farmer123" },
];

const farmersData = [
  { name: "John Ssekandi", phone: "+256 700 000 005", district: "Masaka", produce: "Matooke", status: "Active", registered: monthsAgo(12) },
  { name: "Grace Nabatanzi", phone: "+256 701 100 001", district: "Mubende", produce: "Sweet Potatoes", status: "Active", registered: monthsAgo(11) },
  { name: "Peter Kato", phone: "+256 702 200 002", district: "Mbale", produce: "Irish Potatoes", status: "Active", registered: monthsAgo(10) },
  { name: "Joyce Achieng", phone: "+256 703 300 003", district: "Gulu", produce: "Cassava", status: "Active", registered: monthsAgo(9) },
  { name: "Musa Ssali", phone: "+256 704 400 004", district: "Jinja", produce: "Maize", status: "Active", registered: monthsAgo(8) },
  { name: "Sarah Nantongo", phone: "+256 705 500 005", district: "Masaka", produce: "Beans", status: "Active", registered: monthsAgo(7) },
  { name: "Joseph Okot", phone: "+256 706 600 006", district: "Lira", produce: "Groundnuts", status: "Active", registered: monthsAgo(6) },
  { name: "Mary Nakato", phone: "+256 707 700 007", district: "Mukono", produce: "Matooke", status: "Active", registered: monthsAgo(5) },
  { name: "Samuel Wasswa", phone: "+256 708 800 008", district: "Kayunga", produce: "Cassava", status: "Active", registered: monthsAgo(4) },
  { name: "Robinah Nansubuga", phone: "+256 709 900 009", district: "Wakiso", produce: "Vegetables", status: "Active", registered: monthsAgo(3) },
  { name: "Hassan Kiggundu", phone: "+256 710 000 010", district: "Masaka", produce: "Matooke", status: "Active", registered: monthsAgo(2) },
  { name: "Martha Babirye", phone: "+256 711 000 011", district: "Jinja", produce: "Maize", status: "Active", registered: monthsAgo(1) },
];

const commodities = ['Matooke', 'Maize', 'Beans', 'Cassava', 'Sweet Potatoes', 'Irish Potatoes', 'Groundnuts', 'Vegetables', 'Tomatoes', 'Onions', 'Cabbages', 'Eggplants', 'Passion Fruit', 'Mangoes', 'Oranges', 'Pineapples', 'Watermelons', 'Peas', 'Soybeans', 'Coffee'];
const districts = ['Masaka', 'Mubende', 'Mbale', 'Gulu', 'Jinja', 'Lira', 'Mukono', 'Kayunga', 'Wakiso', 'Mpigi', 'Kamuli', 'Busia', 'Tororo', 'Kasese', 'Kabale', 'Mbarara', 'Ntungamo', 'Luwero', 'Mityana', 'Kampala'];

const seed = async () => {
  try {
    console.log('\n--- Starting AgriHub Seed ---\n');

    await User.deleteMany({});
    await Farmer.deleteMany({});
    await Produce.deleteMany({});
    await ProduceVerification.deleteMany({});
    await CommodityPrice.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    const users = await User.create(usersData);
    console.log(`Users: ${users.length}`);

    const farmers = [];
    for (const data of farmersData) {
      const farmerId = await Farmer.generateFarmerId();
      farmers.push(await Farmer.create({ ...data, farmerId }));
    }
    console.log(`Farmers: ${farmers.length}`);

    const produceItems = [];
    for (let i = 0; i < 30; i++) {
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      const commodity = commodities[Math.floor(Math.random() * commodities.length)];
      const district = districts[Math.floor(Math.random() * districts.length)];
      const quantity = Math.floor(Math.random() * 500) + 10;
      const units = ['kg', 'tonnes', 'bags', 'crates', 'boxes'];
      const unit = units[Math.floor(Math.random() * units.length)];

      const produceId = await Produce.generateProduceId();
      const produce = await Produce.create({
        produceId,
        farmer: farmer._id,
        farmerName: farmer.name,
        commodity,
        quantity,
        unit,
        sourceDistrict: district,
        arrivalDate: daysAgo(Math.floor(Math.random() * 30) + 1),
        status: ['Pending', 'Verified', 'Under Review'][Math.floor(Math.random() * 3)],
      });
      produceItems.push(produce);
    }
    console.log(`Produce: ${produceItems.length}`);

    const verifications = [];
    for (let i = 0; i < 15; i++) {
      const produce = produceItems[i];
      if (!produce) continue;
      const farmer = farmers[i % farmers.length];
      const verificationId = await ProduceVerification.generateVerificationId();
      const verification = await ProduceVerification.create({
        verificationId,
        produce: produce._id,
        farmer: farmer._id,
        farmerName: farmer.name,
        commodity: produce.commodity,
        quantity: produce.quantity,
        district: produce.sourceDistrict,
        arrived: produce.arrivalDate,
        status: produce.status === 'Verified' ? 'Approved' : produce.status === 'Under Review' ? 'Under Review' : 'Pending',
        grade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        qualityStatus: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
        inspectorComments: 'Produce looks acceptable',
        inspectorName: 'Grace Akinyi',
        inspectedBy: users[2]._id,
        inspectedAt: produce.status === 'Verified' ? new Date() : undefined,
      });
      verifications.push(verification);
    }
    console.log(`Verifications: ${verifications.length}`);

    const prices = [];
    const basePrices = {
      'Matooke': 5000, 'Maize': 2500, 'Beans': 4500, 'Cassava': 3000,
      'Sweet Potatoes': 3500, 'Irish Potatoes': 4000, 'Groundnuts': 6000,
      'Vegetables': 2000, 'Tomatoes': 3000, 'Onions': 3500,
      'Cabbages': 2500, 'Eggplants': 3000, 'Passion Fruit': 8000,
      'Mangoes': 5000, 'Oranges': 4000, 'Pineapples': 7000,
      'Watermelons': 5000, 'Peas': 5500, 'Soybeans': 3500, 'Coffee': 12000,
    };

    for (const [commodity, basePrice] of Object.entries(basePrices)) {
      for (let d = 30; d >= 0; d--) {
        const variation = (Math.random() - 0.5) * 1000;
        const price = Math.max(500, Math.round(basePrice + variation));
        const previousPrice = d < 30 ? prices[prices.length - 1]?.price || price : price;
        const change = price - previousPrice;
        const commodityPrice = await CommodityPrice.create({
          commodity,
          price,
          change,
          date: daysAgo(d),
          grade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        });
        prices.push(commodityPrice);
      }
    }
    console.log(`Commodity Prices: ${prices.length}`);

    const transactions = [];
    for (let i = 0; i < 50; i++) {
      const produce = produceItems[Math.floor(Math.random() * produceItems.length)];
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      const qtyNum = Math.floor(Math.random() * 100) + 1;
      const unitPrice = Object.values(basePrices)[Math.floor(Math.random() * Object.keys(basePrices).length)];
      const total = qtyNum * unitPrice;
      const transactionId = await Transaction.generateTransactionId();

      const transaction = await Transaction.create({
        transactionId,
        buyer: ['Nakasero Traders Ltd', 'Kampala City Market', 'Fresh Foods Uganda', 'Uganda Grain Millers', 'Green Grocers Ltd', 'Nile Agro Industries', 'Equatorial Foods', 'Uganda Exporters Co.'][Math.floor(Math.random() * 8)],
        seller: farmer.name,
        sellerRef: farmer._id,
        commodity: produce.commodity,
        quantity: `${qtyNum} ${produce.unit}`,
        qtyNum,
        unitPrice,
        total,
        payment: ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'][Math.floor(Math.random() * 4)],
        date: daysAgo(Math.floor(Math.random() * 30)),
      });
      transactions.push(transaction);
    }
    console.log(`Transactions: ${transactions.length}`);

    const notifications = await Notification.create([
      { type: 'system', title: 'Welcome to AgriHub', message: 'Your account has been created successfully', user: users[4]._id },
      { type: 'price', title: 'Price Alert: Matooke', message: 'Matooke prices have increased by 10% this week', recipientRole: 'Farmer' },
      { type: 'verification', title: 'Verification Required', message: 'New produce registered and pending inspection', recipientRole: 'Produce Inspector' },
      { type: 'market', title: 'Market Report', message: 'Weekly market summary is now available', recipientRole: 'Administrator' },
      { type: 'system', title: 'Profile Updated', message: 'Your profile information has been updated', user: users[4]._id },
    ]);
    console.log(`Notifications: ${notifications.length}`);

    const adminUser = users[0];
    const auditLogs = await AuditLog.create([
      { action: 'LOGIN', user: adminUser._id, userName: adminUser.name, module: 'Auth', description: 'User logged in', ipAddress: '192.168.1.1' },
      { action: 'CREATE', user: adminUser._id, userName: adminUser.name, module: 'Farmers', description: 'Registered new farmer: John Ssekandi', ipAddress: '192.168.1.1' },
      { action: 'CREATE', user: adminUser._id, userName: adminUser.name, module: 'Produce', description: 'Registered produce: 100 kg Matooke', ipAddress: '192.168.1.1' },
      { action: 'VERIFY', user: users[2]._id, userName: 'Grace Akinyi', module: 'Verification', description: 'Verified produce: Grade A Matooke', ipAddress: '192.168.1.2' },
      { action: 'CREATE', user: adminUser._id, userName: adminUser.name, module: 'Transactions', description: 'Recorded transaction: Matooke sale for UGX 500,000', ipAddress: '192.168.1.1' },
    ]);
    console.log(`Audit Logs: ${auditLogs.length}`);

    console.log('\n--- Seed Complete ---\n');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seed();
