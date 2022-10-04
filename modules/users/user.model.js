const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema(
  {
    name: { type: String },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "org_admin", "user"],
      default: "user",
    },
    password: {
      hash: String,
      salt: String,
    },
    imgUrl: String,
    resetToken: String,
    resetTokenExpire: Date,
    extras: { type: mongoose.Schema.Types.Mixed },
    is_active: { type: Boolean, default: true },
    organizations: [{ type: ObjectId, ref: "Organization" }],
  },
  {
    collection: "users",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

module.exports = mongoose.model("Users", UserSchema);
