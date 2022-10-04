const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const BookingSchema = mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      default: "PENDING",
      enum: ["PENDING", "BOOKED", "CANCELED", "CHECKEDOUT"],
    },
    check_in: Date,
    check_out: Date,
    booking_date: Date,
    room_details: {
      price: Number,
      nights: Number,
      adults: Number,
      children: Number,
      rooms: Number, //No of rooms booked
    },
    user_details: {
      name: String,
      email: String,
      contact_no: Number,
      city: String,
      address: String,
      country: String,
    },
    note: String,
    booked_by: {
      type: ObjectId,
      ref: "Users",
    },
    room_id: {
      type: ObjectId,
      ref: "Rooms",
    },
  },
  {
    collection: "bookings",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

module.exports = mongoose.model("Bookings", BookingSchema);
