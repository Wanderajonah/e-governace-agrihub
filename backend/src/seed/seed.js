import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Farmer from '../models/Farmer.js';
import Produce from '../models/Produce.js';
import ProduceVerification from '../models/ProduceVerification.js';
import CommodityPrice from '../models/CommodityPrice.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

const now = new Date();
function daysAgo(n) { const d = new Date(now); d.setDate(d.getDate() - n); return d; }
function monthsAgo(n, day) { const d = new Date(now); d.setMonth(d.getMonth() - n); d.setDate(day || 15); return d; }

const usersData = [
  { name: "Wandera Jonah", email: "admin@agrihub.com", role: "Administrator", agency: "KCCA", status: "Active", phone: "+256 700 000 001", password: "admin123" },
  { name: "Sarah Tendo", email: "officer@agrihub.com", role: "Market Officer", agency: "KCCA", status: "Active", phone: "+256 700 000 002", password: "officer123" },
  { name: "David Okello", email: "gov@agrihub.com", role: "Government Officer", agency: "MAAIF", status: "Active", phone: "+256 700 000 003", password: "gov123" },
  { name: "Agnes Nalwoga", email: "a.nalwoga@ubos.go.ug", role: "Government Officer", agency: "UBOS", status: "Active", phone: "+256 700 000 004", password: "password123" },
  { name: "Robert Kiggundu", email: "r.kiggundu@kcca.go.ug", role: "Market Officer", agency: "KCCA", status: "Inactive", phone: "+256 700 000 005", password: "password123" },
  { name: "Grace Akinyi", email: "inspector@agrihub.com", role: "Produce Inspector", agency: "KCCA", status: "Active", phone: "+256 700 000 006", password: "inspector123" },
  { name: "John Ssekandi", email: "farmer@agrihub.com", role: "Farmer", agency: "Farmer", status: "Active", phone: "+256 700 000 007", password: "farmer123" },
];

const farmersData = [
  { farmerId: "F001", name: "John Ssekandi", district: "Wakiso", phone: "+256 700 123 456", produce: "Maize, Beans", status: "Active", registered: new Date("2024-01-15") },
  { farmerId: "F002", name: "Mary Nakato", district: "Mukono", phone: "+256 701 234 567", produce: "Tomatoes, Onions", status: "Active", registered: new Date("2024-02-20") },
  { farmerId: "F003", name: "Peter Oryem", district: "Lira", phone: "+256 702 345 678", produce: "Cassava, Sweet Potato", status: "Inactive", registered: new Date("2024-01-08") },
  { farmerId: "F004", name: "Grace Akello", district: "Gulu", phone: "+256 703 456 789", produce: "Beans, Groundnuts", status: "Active", registered: new Date("2024-03-12") },
  { farmerId: "F005", name: "Samuel Mwesige", district: "Mbarara", phone: "+256 704 567 890", produce: "Maize, Sorghum", status: "Active", registered: new Date("2024-02-05") },
  { farmerId: "F006", name: "Fatuma Nabukenya", district: "Kampala", phone: "+256 705 678 901", produce: "Vegetables, Fruits", status: "Pending", registered: new Date("2024-04-01") },
];

const produceData = [
  { produceId: "PR001", farmerName: "John Ssekandi", commodity: "Maize", quantity: 500, unit: "kg", sourceDistrict: "Wakiso", arrivalDate: daysAgo(2), status: "Pending" },
  { produceId: "PR002", farmerName: "Mary Nakato", commodity: "Tomatoes", quantity: 200, unit: "kg", sourceDistrict: "Mukono", arrivalDate: daysAgo(2), status: "Verified" },
  { produceId: "PR003", farmerName: "Grace Akello", commodity: "Beans", quantity: 350, unit: "kg", sourceDistrict: "Gulu", arrivalDate: daysAgo(3), status: "Under Review" },
  { produceId: "PR004", farmerName: "Samuel Mwesige", commodity: "Sorghum", quantity: 800, unit: "kg", sourceDistrict: "Mbarara", arrivalDate: daysAgo(3), status: "Verified" },
  { produceId: "PR005", farmerName: "Fatuma Nabukenya", commodity: "Vegetables", quantity: 100, unit: "kg", sourceDistrict: "Kampala", arrivalDate: daysAgo(4), status: "Pending" },
  { produceId: "PR006", farmerName: "John Ssekandi", commodity: "Maize", quantity: 1200, unit: "kg", sourceDistrict: "Wakiso", arrivalDate: daysAgo(5), status: "Verified" },
  { produceId: "PR007", farmerName: "Mary Nakato", commodity: "Tomatoes", quantity: 600, unit: "kg", sourceDistrict: "Mukono", arrivalDate: daysAgo(5), status: "Verified" },
  { produceId: "PR008", farmerName: "Grace Akello", commodity: "Beans", quantity: 900, unit: "kg", sourceDistrict: "Gulu", arrivalDate: daysAgo(6), status: "Verified" },
  { produceId: "PR009", farmerName: "Samuel Mwesige", commodity: "Maize", quantity: 1500, unit: "kg", sourceDistrict: "Mbarara", arrivalDate: daysAgo(6), status: "Verified" },
  { produceId: "PR010", farmerName: "Fatuma Nabukenya", commodity: "Onions", quantity: 400, unit: "kg", sourceDistrict: "Kampala", arrivalDate: daysAgo(7), status: "Verified" },
  { produceId: "PR011", farmerName: "John Ssekandi", commodity: "Sweet Potato", quantity: 600, unit: "kg", sourceDistrict: "Wakiso", arrivalDate: daysAgo(10), status: "Verified" },
  { produceId: "PR012", farmerName: "Grace Akello", commodity: "Groundnuts", quantity: 300, unit: "kg", sourceDistrict: "Gulu", arrivalDate: daysAgo(10), status: "Verified" },
  { produceId: "PR013", farmerName: "Mary Nakato", commodity: "Onions", quantity: 350, unit: "kg", sourceDistrict: "Mukono", arrivalDate: daysAgo(12), status: "Verified" },
  { produceId: "PR014", farmerName: "Samuel Mwesige", commodity: "Cassava", quantity: 2000, unit: "kg", sourceDistrict: "Mbarara", arrivalDate: daysAgo(12), status: "Verified" },
  { produceId: "PR015", farmerName: "Fatuma Nabukenya", commodity: "Maize", quantity: 800, unit: "kg", sourceDistrict: "Kampala", arrivalDate: daysAgo(14), status: "Verified" },
];

const verificationData = [
  { verificationId: "PV001", farmerName: "John Ssekandi", commodity: "Maize", quantity: "500 kg", district: "Wakiso", arrived: daysAgo(2), status: "Pending" },
  { verificationId: "PV002", farmerName: "Mary Nakato", commodity: "Tomatoes", quantity: "200 kg", district: "Mukono", arrived: daysAgo(2), status: "Pending" },
  { verificationId: "PV003", farmerName: "Grace Akello", commodity: "Beans", quantity: "350 kg", district: "Gulu", arrived: daysAgo(3), status: "Under Review" },
  { verificationId: "PV004", farmerName: "Samuel Mwesige", commodity: "Sorghum", quantity: "800 kg", district: "Mbarara", arrived: daysAgo(3), status: "Pending" },
];

const pricesData = [
  { commodity: "Maize", unit: "kg", price: 1500, change: 5.2, grade: "A" },
  { commodity: "Beans", unit: "kg", price: 3100, change: -2.1, grade: "A" },
  { commodity: "Tomatoes", unit: "kg", price: 1200, change: 8.7, grade: "B" },
  { commodity: "Onions", unit: "kg", price: 1800, change: 1.5, grade: "A" },
  { commodity: "Cassava", unit: "kg", price: 800, change: -0.5, grade: "B" },
  { commodity: "Sweet Potato", unit: "kg", price: 600, change: 3.2, grade: "A" },
];
pricesData.forEach((p, i) => { p.date = daysAgo(i + 1); });

const transactionsData = [
  { buyer: "Kampala Fresh Ltd", seller: "John Ssekandi", commodity: "Maize", qtyNum: 500, unitPrice: 1500, payment: "Mobile Money", qty: "500 kg" },
  { buyer: "Nakasero Traders", seller: "Mary Nakato", commodity: "Tomatoes", qtyNum: 200, unitPrice: 1200, payment: "Cash", qty: "200 kg" },
  { buyer: "Uganda Export Co.", seller: "Grace Akello", commodity: "Beans", qtyNum: 350, unitPrice: 3100, payment: "Bank Transfer", qty: "350 kg" },
  { buyer: "City Supermarkets", seller: "Samuel Mwesige", commodity: "Sorghum", qtyNum: 800, unitPrice: 1100, payment: "Mobile Money", qty: "800 kg" },
  { buyer: "Rwenzori Foods", seller: "John Ssekandi", commodity: "Maize", qtyNum: 1200, unitPrice: 1450, payment: "Bank Transfer", qty: "1200 kg" },
  { buyer: "Equatorial Mills", seller: "Mary Nakato", commodity: "Tomatoes", qtyNum: 600, unitPrice: 1150, payment: "Cheque", qty: "600 kg" },
  { buyer: "Kampala City Traders", seller: "Grace Akello", commodity: "Beans", qtyNum: 900, unitPrice: 3050, payment: "Mobile Money", qty: "900 kg" },
  { buyer: "Northern Distributors", seller: "Peter Oryem", commodity: "Cassava", qtyNum: 1500, unitPrice: 800, payment: "Cash", qty: "1500 kg" },
  { buyer: "Mbarara Fresh Produce", seller: "Samuel Mwesige", commodity: "Sorghum", qtyNum: 450, unitPrice: 1050, payment: "Mobile Money", qty: "450 kg" },
  { buyer: "Jinja Wholesalers", seller: "Fatuma Nabukenya", commodity: "Vegetables", qtyNum: 300, unitPrice: 2000, payment: "Cash", qty: "300 kg" },
  // Historical transactions spread across months for chart data
  { buyer: "Masaka Cooperative", seller: "John Ssekandi", commodity: "Maize", qtyNum: 750, unitPrice: 1250, payment: "Mobile Money", qty: "750 kg" },
  { buyer: "Gulu Food Suppliers", seller: "Grace Akello", commodity: "Beans", qtyNum: 600, unitPrice: 2650, payment: "Bank Transfer", qty: "600 kg" },
  { buyer: "Arua Market Union", seller: "Mary Nakato", commodity: "Tomatoes", qtyNum: 350, unitPrice: 980, payment: "Cash", qty: "350 kg" },
  { buyer: "Jinja Millers Ltd", seller: "Samuel Mwesige", commodity: "Maize", qtyNum: 2000, unitPrice: 1180, payment: "Cheque", qty: "2000 kg" },
  { buyer: "Soroti Traders", seller: "Grace Akello", commodity: "Groundnuts", qtyNum: 400, unitPrice: 4500, payment: "Mobile Money", qty: "400 kg" },
  { buyer: "Kampala Supermarket", seller: "Fatuma Nabukenya", commodity: "Onions", qtyNum: 250, unitPrice: 1750, payment: "Cash", qty: "250 kg" },
  { buyer: "Mukono Wholesale", seller: "John Ssekandi", commodity: "Maize", qtyNum: 900, unitPrice: 1380, payment: "Bank Transfer", qty: "900 kg" },
  { buyer: "Busoga Traders", seller: "Samuel Mwesige", commodity: "Sorghum", qtyNum: 700, unitPrice: 950, payment: "Mobile Money", qty: "700 kg" },
  { buyer: "Lira Commodities", seller: "Mary Nakato", commodity: "Tomatoes", qtyNum: 500, unitPrice: 1100, payment: "Cheque", qty: "500 kg" },
  { buyer: "Kigezi Growers", seller: "Grace Akello", commodity: "Beans", qtyNum: 800, unitPrice: 2850, payment: "Bank Transfer", qty: "800 kg" },
];

const notificationsData = [
  { type: "price", title: "Price Alert: Maize prices up 5.2%", message: "Maize prices have increased by 5.2% today. Consider issuing a market advisory.", read: false },
  { type: "verification", title: "4 produce items pending verification", message: "There are 4 produce items waiting for inspection and verification.", read: false },
  { type: "system", title: "System maintenance scheduled", message: "The system will undergo scheduled maintenance this weekend.", read: true },
  { type: "market", title: "Weekly market report available", message: "This week's market report is now available for download.", read: true },
  { type: "price", title: "Tomatoes price spike detected in Mukono", message: "Tomato prices in Mukono district have spiked 12% above the market average.", read: true },
];

const priceTrendData = [
  { month: "Feb", maize: 1200, beans: 2800, tomatoes: 900, onions: 1500 },
  { month: "Feb", maize: 1180, beans: 2750, tomatoes: 920, onions: 1480 },
  { month: "Feb", maize: 1220, beans: 2820, tomatoes: 880, onions: 1520 },
  { month: "Mar", maize: 1350, beans: 2600, tomatoes: 1100, onions: 1400 },
  { month: "Mar", maize: 1320, beans: 2650, tomatoes: 1050, onions: 1380 },
  { month: "Mar", maize: 1380, beans: 2550, tomatoes: 1150, onions: 1420 },
  { month: "Apr", maize: 1100, beans: 3000, tomatoes: 800, onions: 1600 },
  { month: "Apr", maize: 1080, beans: 3050, tomatoes: 780, onions: 1620 },
  { month: "Apr", maize: 1150, beans: 2950, tomatoes: 850, onions: 1580 },
  { month: "May", maize: 1400, beans: 2900, tomatoes: 1300, onions: 1750 },
  { month: "May", maize: 1380, beans: 2850, tomatoes: 1280, onions: 1720 },
  { month: "May", maize: 1420, beans: 2950, tomatoes: 1350, onions: 1780 },
  { month: "Jun", maize: 1250, beans: 2750, tomatoes: 950, onions: 1550 },
  { month: "Jun", maize: 1280, beans: 2700, tomatoes: 980, onions: 1580 },
  { month: "Jun", maize: 1220, beans: 2800, tomatoes: 920, onions: 1520 },
  { month: "Jul", maize: 1500, beans: 3100, tomatoes: 1200, onions: 1800 },
  { month: "Jul", maize: 1480, beans: 3050, tomatoes: 1180, onions: 1780 },
  { month: "Jul", maize: 1520, beans: 3150, tomatoes: 1220, onions: 1820 },
];

const recentActivitiesData = [
  { action: "Farmer registered", user: "Officer Tendo", detail: "John Ssekandi from Wakiso" },
  { action: "Produce verified", user: "Inspector Okello", detail: "500kg Maize — Grade A" },
  { action: "Transaction recorded", user: "Officer Tendo", detail: "TXN-001 — UGX 750,000" },
  { action: "Price updated", user: "Admin Mugisha", detail: "Beans: UGX 3,100/kg" },
  { action: "Report generated", user: "System", detail: "Daily Market Report" },
];

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function findUserByName(users, partialName) {
  return users.find(u =>
    u.name.toLowerCase().includes(partialName.toLowerCase().replace(/^(officer|inspector|admin)\s+/i, ''))
  );
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      await mongoose.connection.db.dropCollection(col.name);
    }
    console.log('Cleared all collections');

    const users = await User.insertMany(
      await Promise.all(
        usersData.map(async u => ({
          ...u,
          password: await bcrypt.hash(u.password, 12),
        }))
      )
    );
    console.log(`Seeded ${users.length} users`);

    const farmers = await Farmer.insertMany(farmersData);
    console.log(`Seeded ${farmers.length} farmers`);

    const produceWithFarmerRefs = produceData.map(p => {
      const farmer = farmers.find(f => f.name === p.farmerName);
      return { ...p, farmer: farmer ? farmer._id : undefined };
    });
    const produces = await Produce.insertMany(produceWithFarmerRefs);
    console.log(`Seeded ${produces.length} produce registrations`);

    const verificationRecords = verificationData.map(v => {
      const farmer = farmers.find(f => f.name === v.farmerName);
      const produce = produces.find(p => p.farmerName === v.farmerName && p.commodity === v.commodity);
      const qtyNum = parseInt(v.quantity, 10);
      return {
        verificationId: v.verificationId,
        produce: produce ? produce._id : undefined,
        farmer: farmer ? farmer._id : undefined,
        farmerName: v.farmerName,
        commodity: v.commodity,
        quantity: qtyNum,
        district: v.district,
        arrived: v.arrived,
        status: v.status,
      };
    });
    const verifications = await ProduceVerification.insertMany(verificationRecords);
    console.log(`Seeded ${verifications.length} produce verifications`);

    const commodityPricesArr = pricesData.map(p => ({
      commodity: p.commodity,
      unit: p.unit,
      price: p.price,
      change: p.change,
      date: p.date,
      grade: p.grade,
    }));
    const prices = await CommodityPrice.insertMany(commodityPricesArr);
    console.log(`Seeded ${prices.length} commodity prices`);

    for (let i = 0; i < priceTrendData.length; i++) {
      const entry = priceTrendData[i];
      // Spread 3 entries per month across days 5, 15, 25
      const dayOfMonth = [5, 15, 25][i % 3];
      const monthsBack = 5 - Math.floor(i / 3);
      const date = monthsAgo(monthsBack, dayOfMonth);
      const trendRecords = [
        { commodity: "Maize", unit: "kg", price: entry.maize, change: 0, date, grade: "A" },
        { commodity: "Beans", unit: "kg", price: entry.beans, change: 0, date, grade: "A" },
        { commodity: "Tomatoes", unit: "kg", price: entry.tomatoes, change: 0, date, grade: "B" },
        { commodity: "Onions", unit: "kg", price: entry.onions, change: 0, date, grade: "A" },
      ];
      await CommodityPrice.insertMany(trendRecords);
    }
    console.log(`Seeded price trend data (last ${priceTrendData.length} months)`);

    const transactionRecords = transactionsData.map((t, i) => {
      const farmer = farmers.find(f => f.name === t.seller);
      // Spread transactions across last 6 months
      const monthsBack = Math.floor(i / 3);
      const dayOffset = (i % 3) * 8 + 1;
      return {
        buyer: t.buyer,
        seller: t.seller,
        sellerRef: farmer ? farmer._id : undefined,
        commodity: t.commodity,
        quantity: t.qty,
        qtyNum: t.qtyNum,
        unitPrice: t.unitPrice,
        total: t.qtyNum * t.unitPrice,
        payment: t.payment,
        receiptNumber: `RCP-${String(i + 1).padStart(4, '0')}`,
        date: monthsAgo(monthsBack, dayOffset),
        transactionId: `TXN-${String(i + 1).padStart(3, '0')}`,
      };
    });
    const transactions = await Transaction.insertMany(transactionRecords);
    console.log(`Seeded ${transactions.length} transactions`);

    const notifications = await Notification.insertMany(notificationsData);
    console.log(`Seeded ${notifications.length} notifications`);

    const auditRecords = recentActivitiesData.map(a => {
      const matchedUser = findUserByName(users, a.user);
      const moduleMap = {
        "Farmer registered": "Farmer",
        "Produce verified": "Produce",
        "Transaction recorded": "Transaction",
        "Price updated": "CommodityPrice",
        "Report generated": "Report",
      };
      return {
        action: a.action,
        user: matchedUser ? matchedUser._id : undefined,
        userName: matchedUser ? matchedUser.name : a.user,
        module: moduleMap[a.action] || "System",
        description: a.detail,
        createdAt: daysAgo(1),
      };
    });
    const auditLogs = await AuditLog.insertMany(auditRecords);
    console.log(`Seeded ${auditLogs.length} audit log entries`);

    console.log('\n--- Seed Summary ---');
    console.log(`Users:                 ${users.length}`);
    console.log(`Farmers:               ${farmers.length}`);
    console.log(`Produce Registrations: ${produces.length}`);
    console.log(`Produce Verifications: ${verifications.length}`);
    console.log(`Commodity Prices:      ${prices.length} + ${priceTrendData.length * 4} trend records`);
    console.log(`Transactions:          ${transactions.length}`);
    console.log(`Notifications:         ${notifications.length}`);
    console.log(`Audit Logs:            ${auditLogs.length}`);
    console.log('--- Seed Complete ---\n');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seed();
