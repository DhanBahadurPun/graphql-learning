const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const OrganizationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      // required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["HOTEL", "HOMESTAY", "GUESTHOUSE"],
    }, // hotel/homestay/guesthouse
    display_picture: String,
    contact_no: {
      type: Number,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    facilities: [{ type: String }],
    rules: [{ type: String }],
    meta: {
      title: String,
      description: String,
    },
    created_by: {
      type: ObjectId,
      ref: "Users",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "organization",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

module.exports = mongoose.model("Organization", OrganizationSchema);
