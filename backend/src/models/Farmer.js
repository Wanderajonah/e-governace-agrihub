import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema(
  {
    farmerId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Farmer name is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    produce: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending'],
      default: 'Pending',
    },
    registered: {
      type: Date,
      default: Date.now,
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

farmerSchema.index({ farmerId: 1 });
farmerSchema.index({ district: 1 });
farmerSchema.index({ status: 1 });

farmerSchema.statics.generateFarmerId = async function () {
  const farmers = await this.collection.find({ farmerId: { $exists: true } }, { projection: { farmerId: 1, _id: 0 } }).toArray();
  let maxNum = 0;
  for (const f of farmers) {
    const num = parseInt(f.farmerId.replace('F', ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  }
  const nextNum = maxNum + 1;
  return `F${String(nextNum).padStart(3, '0')}`;
};

farmerSchema.pre('save', async function (next) {
  if (this.isNew && !this.farmerId) {
    this.farmerId = await this.constructor.generateFarmerId();
  }
  next();
});

farmerSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Farmer = mongoose.model('Farmer', farmerSchema);

export default Farmer;
