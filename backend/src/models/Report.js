const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'annual'],
      required: [true, 'Report type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    period: {
      type: String,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    format: {
      type: String,
      enum: ['PDF', 'Excel', 'CSV'],
      required: [true, 'Format is required'],
    },
    fileUrl: {
      type: String,
    },
    dateRange: {
      start: {
        type: Date,
        required: [true, 'Start date is required'],
      },
      end: {
        type: Date,
        required: [true, 'End date is required'],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reportSchema.index({ type: 1, createdAt: -1 });
reportSchema.index({ generatedBy: 1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
