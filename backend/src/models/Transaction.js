const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
    },
    buyer: {
      type: String,
      required: [true, 'Buyer is required'],
      trim: true,
    },
    seller: {
      type: String,
      required: [true, 'Seller is required'],
      trim: true,
    },
    sellerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
    },
    commodity: {
      type: String,
      required: [true, 'Commodity is required'],
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, 'Quantity is required'],
      trim: true,
    },
    qtyNum: {
      type: Number,
      required: [true, 'Quantity number is required'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
    },
    total: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    payment: {
      type: String,
      enum: ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'],
      required: [true, 'Payment method is required'],
    },
    receiptNumber: {
      type: String,
      unique: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ sellerRef: 1 });
transactionSchema.index({ commodity: 1 });
transactionSchema.index({ date: -1 });

transactionSchema.statics.generateTransactionId = async function () {
  const transactions = await this.collection.find({ transactionId: { $exists: true } }, { projection: { transactionId: 1, _id: 0 } }).toArray();
  let maxNum = 0;
  for (const t of transactions) {
    const num = parseInt(t.transactionId.replace('TXN-', ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  }
  const nextNum = maxNum + 1;
  return `TXN-${String(nextNum).padStart(3, '0')}`;
};

function generateReceiptNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'RCP-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

transactionSchema.statics.generateReceiptNumber = async function () {
  let receiptNumber;
  let exists = true;

  while (exists) {
    receiptNumber = generateReceiptNumber();
    const existing = await this.findOne({ receiptNumber });
    if (!existing) {
      exists = false;
    }
  }

  return receiptNumber;
};

transactionSchema.pre('save', async function (next) {
  if (this.isNew) {
    if (!this.transactionId) {
      this.transactionId = await this.constructor.generateTransactionId();
    }
    if (!this.receiptNumber) {
      this.receiptNumber = await this.constructor.generateReceiptNumber();
    }
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
