const router = require("express").Router();
const BookingController = require('../bookings/booking.controller');
const RoomController = require("../rooms/room.controller");
const UserController = require('../users/user.controller');


router.get("/list", (req, res, next) => {
  res.render("booking/list", {
    title: "Room Booking",
    layout: "layouts/dashboard.ejs"
  });
});

router.get("/details/:id", async (req, res, next) => {
  const booking = await BookingController.listOne(req.params.id);
  res.render("booking/details", {
    title: "Booking Details",
    layout: "layouts/dashboard.ejs",
    booking: booking
  });
});

router.get("/listing", (req, res) => {
  res.render("booking/list-by-org", {
    title: "booking",
    layout: "layouts/dashboard"
  });
})

module.exports = router;
