const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const RoomSchema = mongoose.Schema(
  {
    title: String,
    slug: {
      type: String,
      unique: true,
      // required: true,
    },
    status: {
      type: String,
      required: true,
      default: "PUBLISHED",
      enum: ["DRAFT", "PUBLISHED"],
    },
    category: {
      type: String,
      require: true,
      enum: ["CHEAP", "BUDGET", "PREMIUM"],
    }, // cheap/budget/premium
    featured_img: String,
    images: Array,
    no_of_rooms: {
      type: Number,
      required: true,
    },
    booked: {
      type: Number, //No of rooms booked
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
    },
    capacity: {
      adults: { type: Number, required: true },
      children: { type: Number, required: true },
    },
    beds: { type: Number, required: true },
    description: String,
    amenities: [{ type: String }],
    meta: {
      title: String,
      description: String,
    },
    added_by: {
      type: ObjectId,
      ref: "Users",
    },
    org_id: {
      type: ObjectId,
      ref: "Organization",
    },
  },
  {
    collection: "rooms",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

module.exports = mongoose.model("Rooms", RoomSchema);
