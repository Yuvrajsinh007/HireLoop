const mongoose = require("mongoose");

const pendingRegistrationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    otpHash: { type: String, select: false },
    otpExpire: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    lastOtpSentAt: { type: Date, select: false },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

pendingRegistrationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 });

const PendingRegistration = mongoose.model(
  "PendingRegistration",
  pendingRegistrationSchema
);
module.exports = PendingRegistration;
