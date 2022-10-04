const router = require("express").Router();
const randomString = require("randomstring");
const moment = require('moment');
const BookingController = require("./booking.controller");
const UserController = require("../users/user.controller");
const RoomController = require("../rooms/room.controller");
const sendEmail = require("../../utils/mailer");
const { SecureAPI } = require('../../utils/secure');

// create new room booking
router.post("/", async (req, res, next) => {
  try {
    let room = await RoomController.get(req.body.roomId);
    let rooms = {
      price: req.body.price || room.price,
      nights: req.body.nights || 2,
      adults: req.body.adults || room.capacity.adults,
      children: req.body.children || room.capacity.children,
      rooms: req.body.rooms //No of rooms booked
    }
    let users = {
      name: req.body.name,
      email: req.body.username,
      contact_no: req.body.phone,
      city: req.body.city,
      address: req.body.address,
      country: req.body.country
    }

    if (req.cookies.user) {
      var userId = JSON.parse(req.cookies.user).id
    }

    let body = Object.assign({}, req.body, {
      room_details: rooms,
      user_details: users,
      booked_by: req.body.booked_by || userId,
      room_id: room._id
    });


    if (req.cookies.user) {
      let booking = await BookingController.add(body);
      res.status(200).json(booking);
    } else {
      let password = randomString.generate(8);
      users.password = password
      users.username = req.body.username
      let doc = await UserController.singup(users);
      body.booked_by = doc._id
      let booking = await BookingController.add(body);
      res.status(200).json(booking);
      await sendEmail(
        "sendPassword",
        users.username,
        `Your generated password`,
        users
      );
    }
  } catch (err) {
    throw next(err);
  }
});

router.get("/", SecureAPI(), (req, res, next) => {
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let cur_user = req.tokenData._id;
  BookingController.list({ limit, start, cur_user })
    .then(booking => {
      const formatDate = booking.data.map(res => {
        return Object.assign(res, {
          check_in: moment(res.check_in).format('LLL'),
          check_out: moment(res.check_out).format('LLL')
        })
      })
      res.status(200).json(Object.assign(booking, { data: formatDate }));
    })
    .catch(err => next(err));
});

router.get("/list", SecureAPI(), (req, res, next) => {
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let cur_user = req.tokenData._id;
  BookingController.listBookings({ limit, start, cur_user })
    .then(booking => {
      console.log("bookings", booking)
      const dateFormat = booking.data.map(res => Object.assign(res, {
        check_in: moment(res.check_in).format("LLL"),
        check_out: moment(res.check_out).format('LLL')
      }));
      res.status(200).json(Object.assign(booking, { data: dateFormat }));
    })
    .catch(err => next(err));
});

// update new room booking
router.put("/:id", (req, res, next) => {
  BookingController.update(req.body, req.params.id)
    .then(booking => res.status(200).json(booking))
    .catch(err => next(err));
});

// get specific bookings
router.get("/getOne/:id", (req, res, next) => {
  BookingController.listOne(req.params.id)
    .then(booking => res.status(200).json(booking))
    .catch(err => next(err));
});

// get all bookings
router.get("/", (req, res, next) => {
  BookingController.listAll()
    .then(booking => res.status(200).json(booking))
    .catch(err => next(err));
});

// delete specific bookings
router.delete("/:id", (req, res, next) => {
  BookingController.delete(req.params.id)
    .then(booking => res.status(200).json(booking))
    .catch(err => next(err));
});

// list bookings by status (new or archived)
router.post("/listBookingsByStatus", (req, res, next) => {
  BookingController.listBookingsByStatus(req.body.status)
    .then(booking => res.status(200).json(booking))
    .catch(err => next(err));
});

// Bookings of recent 6 months
router.get("/recentSixMonth", (req, res, next) => {
  BookingController.bookingRecentSixMonth()
    .then(booking => res.status(200).json(booking))
    .catch(err => next(err));
});

module.exports = router;
