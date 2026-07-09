import mongoose from 'mongoose';

const produceVerificationSchema = new mongoose.Schema(
  {
    verificationId: {
      type: String,
      unique: true,
    },
    produce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produce',
      required: [true, 'Produce reference is required'],
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: [true, 'Farmer reference is required'],
    },
    farmerName: {
      type: String,
      trim: true,
    },
    commodity: {
      type: String,
      required: [true, 'Commodity is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    arrived: {
      type: Date,
      required: [true, 'Arrival date is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C'],
    },
    qualityStatus: {
      type: String,
    },
    moistureContent: {
      type: Number,
    },
    inspectorComments: {
      type: String,
      trim: true,
    },
    inspectorName: {
      type: String,
      trim: true,
    },
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inspectedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

produceVerificationSchema.index({ verificationId: 1 });
produceVerificationSchema.index({ produce: 1 });
produceVerificationSchema.index({ farmer: 1 });
produceVerificationSchema.index({ status: 1 });

produceVerificationSchema.statics.generateVerificationId = async function () {
  const verifications = await this.collection.find({ verificationId: { $exists: true } }, { projection: { verificationId: 1, _id: 0 } }).toArray();
  let maxNum = 0;
  for (const v of verifications) {
    const num = parseInt(v.verificationId.replace('PV', ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  }
  const nextNum = maxNum + 1;
  return `PV${String(nextNum).padStart(3, '0')}`;
};

produceVerificationSchema.pre('save', async function (next) {
  if (this.isNew && !this.verificationId) {
    this.verificationId = await this.constructor.generateVerificationId();
  }
  next();
});

const ProduceVerification = mongoose.model('ProduceVerification', produceVerificationSchema);

export default ProduceVerification;
