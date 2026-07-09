import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['price', 'verification', 'system', 'market'],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recipientRole: {
      type: String,
    },
    link: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ sentAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
