import mongoose from 'mongoose';

const produceSchema = new mongoose.Schema(
  {
    produceId: {
      type: String,
      unique: true,
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
    unit: {
      type: String,
      enum: ['kg', 'tonnes', 'bags', 'crates', 'boxes'],
      required: [true, 'Unit is required'],
    },
    sourceDistrict: {
      type: String,
      required: [true, 'Source district is required'],
      trim: true,
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Arrival date is required'],
    },
    vehiclePlate: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Under Review'],
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
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

produceSchema.index({ produceId: 1 });
produceSchema.index({ farmer: 1 });
produceSchema.index({ commodity: 1 });
produceSchema.index({ status: 1 });
produceSchema.index({ sourceDistrict: 1 });

produceSchema.statics.generateProduceId = async function () {
  const produces = await this.collection.find({ produceId: { $exists: true } }, { projection: { produceId: 1, _id: 0 } }).toArray();
  let maxNum = 0;
  for (const p of produces) {
    const num = parseInt(p.produceId.replace('PR', ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  }
  const nextNum = maxNum + 1;
  return `PR${String(nextNum).padStart(3, '0')}`;
};

produceSchema.pre('save', async function (next) {
  if (this.isNew && !this.produceId) {
    this.produceId = await this.constructor.generateProduceId();
  }
  next();
});

produceSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Produce = mongoose.model('Produce', produceSchema);

export default Produce;
