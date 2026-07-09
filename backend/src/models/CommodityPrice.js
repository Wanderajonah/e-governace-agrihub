import mongoose from 'mongoose';

const commodityPriceSchema = new mongoose.Schema(
  {
    commodity: {
      type: String,
      required: [true, 'Commodity is required'],
      trim: true,
    },
    unit: {
      type: String,
      default: 'kg',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    change: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commodityPriceSchema.index({ commodity: 1, date: -1 });
commodityPriceSchema.index({ date: -1 });

const CommodityPrice = mongoose.model('CommodityPrice', commodityPriceSchema);

export default CommodityPrice;
