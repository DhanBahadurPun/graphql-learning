const BookingModel = require("./booking.model");
const { DataUtils } = require("../../utils");
const UserModel = require('../users/user.model');
const mongoose = require("mongoose");

function mapped_booking_req(booking, bookingDetails) {
  if (bookingDetails.status) booking.status = bookingDetails.status;
  if (bookingDetails.check_out) booking.check_out = bookingDetails.check_out;
  if (bookingDetails.check_in) booking.check_in = bookingDetails.check_in;
  if (bookingDetails.nos_rooms) booking.nos_rooms = bookingDetails.nos_rooms;
  if (bookingDetails.booking_date)
    booking.booking_date = bookingDetails.booking_date;
  if (bookingDetails.price) booking.price = bookingDetails.price;
  if (bookingDetails.note) booking.note = bookingDetails.note;
  if (bookingDetails.title || bookingDetails.description) {
    booking.meta["title"] = bookingDetails.title;
    booking.meta["description"] = bookingDetails.description;
  }
  if (bookingDetails.room_id) booking.room_id = bookingDetails.room_id;
  if (bookingDetails.booked_by) booking.booked_by = bookingDetails.booked_by;

  return booking;
}
class Bookings {
  constructor() { }

  // create a new booking
  create(payload, loggedInUserId) {
    return new Promise((resolve, reject) => {
      payload.booked_by = loggedInUserId;
      const newBooking = new BookingModel();
      mapped_booking_req(newBooking, payload)
        .save()
        .then(booking => resolve(booking))
        .catch(err => reject(err));
    });
  }

  add(payload) {
    const newBooking = new BookingModel(payload);
    return newBooking.save();
  }

  // Update Booking details
  update(payload, id) {
    return new Promise((resolve, reject) => {
      BookingModel.findById(id)
        .then(booking => {
          if (booking) {
            mapped_booking_req(booking, payload)
              .save()
              .then(booking => {
                resolve(booking);
              })
              .catch(err => reject(err));
          } else {
            return reject({
              message: "Booking Not Found"
            });
          }
        })
        .catch(err => reject(err));
    });
  }

  // list specific room booking
  listOne(id) {
    return new Promise((resolve, reject) => {
      BookingModel.findById(id)
        .populate("room_id")
        .then(booking => {
          if (booking) resolve(booking);
          else {
            reject({
              message: "Booking Not Found"
            });
          }
        })
        .catch(err => reject(err));
    });
  }

  // list all bookings
  listAll() {
    return new Promise((resolve, reject) => {
      BookingModel.aggregate([
        {
          $match: {}
        }
      ])
        .then(bookings => resolve(bookings))
        .catch(err => reject(err));
    });
  }

  // delete specific booking
  delete(id) {
    return new Promise((resolve, reject) => {
      BookingModel.findByIdAndRemove(id)
        .then(booking => {
          if (booking) resolve(booking);
          else {
            return reject({
              message: "Booking Already deleted.."
            });
          }
        })
        .catch(err => reject(err));
    });
  }

  // list bookings by status (new or archived)
  listBookingsByStatus(payload) {
    return new Promise((resolve, reject) => {
      BookingModel.aggregate([
        {
          $match: {
            status: payload
          }
        }
      ])
        .then(booking => resolve(booking))
        .catch(err => reject(err));
    });
  }

  // list 
  listBookings({ limit, start, cur_user }) {
    return DataUtils.paging({
      start,
      limit,
      sort: { created_at: -1 },
      model: BookingModel,
      query: [
        {
          $lookup: {
            from: "rooms",
            localField: "room_id",
            foreignField: "_id",
            as: "room"
          }
        },
        { $unwind: "$room" },
        {
          $match: {
            "room.added_by": cur_user
          }
        }
      ]
    });
  }

  // Bookings of recent 6 months
  bookingRecentSixMonth() {
    return new Promise((resolve, reject) => {
      BookingModel.aggregate([
        {
          $match: {}
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$booking_date"
              },
              month: {
                $month: "$booking_date"
              }
            },
            data: {
              $push: "$$ROOT"
            },
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            "_id.year": -1,
            "_id.month": -1
          }
        },
        {
          $limit: 6
        }
      ])
        .then(booking => resolve(booking))
        .catch(err => reject(err));
    });
  }

  listByRoomId(roomId) {
    return new Promise((resolve, reject) => {
      BookingModel.find({ room_id: roomId })
        .then(bookings => resolve(bookings))
        .catch(err => reject(err));
    });
  }

  list({ limit, start, cur_user }) {
    return DataUtils.paging({
      start,
      limit,
      sort: { created_at: -1 },
      model: BookingModel,
      query: [
        {
          $match: { booked_by: cur_user }
        }
      ]
    });
  }
}

module.exports = new Bookings();
