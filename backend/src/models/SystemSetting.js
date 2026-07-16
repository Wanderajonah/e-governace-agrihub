const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Key is required'],
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Value is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

systemSettingSchema.index({ key: 1 });
systemSettingSchema.index({ category: 1 });

systemSettingSchema.statics.updateSetting = async function (key, value, options = {}) {
  return this.findOneAndUpdate(
    { key },
    { key, value, ...options },
    { upsert: true, new: true, runValidators: true }
  );
};

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

module.exports = SystemSetting;
