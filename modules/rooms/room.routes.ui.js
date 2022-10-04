const router = require("express").Router();
const { SecureAPI } = require("../../utils/secure");
const OrgController = require("../organization/organization.controller");
const RoomController = require("../rooms/room.controller");
const UserController = require('../users/user.controller');
const BookingsController = require('../bookings/booking.controller');

router.get("/list", SecureAPI(), (req, res, next) => {
  res.render("rooms/list", { title: "Room List", layout: "layouts/dashboard" });
});

router.get("/edit/:id", SecureAPI(), async (req, res, next) => {
  let cur_user = req.tokenData._id;
  let docs = await OrgController.listActive(cur_user);
  let doc = await RoomController.get(req.params.id);
  res.render("rooms/edit", {
    title: "Rooms Details",
    layout: "layouts/dashboard",
    orgs: docs,
    result: doc
  });
});

router.get("/add", SecureAPI(), async (req, res, next) => {
  let cur_user = req.tokenData._id;
  let docs = await OrgController.listActive(cur_user);
  res.render("rooms/add", {
    title: "Add Room",
    layout: "layouts/dashboard",
    orgs: docs
  });
});

router.get("/view/:slug", async (req, res, next) => {
  let doc = await RoomController.getBySlug(req.params.slug);
  res.render("rooms/details", {
    title: "Room Details",
    result: doc
  });
});


router.get("/bookings/:id", async (req, res, next) => {
  try {
    let room = await RoomController.get(req.params.id);
    if (req.cookies.user) {
      let loggedInUser = await UserController.getOne(JSON.parse(req.cookies.user).id);
      res.render("rooms/booking", { title: "Hotel Booking", room: room, data: loggedInUser });
    } else {
      res.render("rooms/booking", { title: "Hotel Booking", room: room, data: {} });
    }

  } catch (e) {
    next(e)
  }
});


router.get('/listing', (req, res, next) => {
  const perPage = 15;
  const page = req.query.page || 1;
  RoomController.pagination(page, perPage).then(rooms => {
    res.render('rooms/list-all', {
      title: "Room List",
      result: rooms.allRoom,
      current: page,
      pages: Math.ceil(rooms.count / perPage)
    })
  }).catch(err => next(err))
});


router.get("/booking/:id", async (req, res, next) => {
  let docs = await BookingsController.listOne(req.params.id)
  let result = await OrgController.getOne(docs.room_id.org_id);
  res.render("rooms/thank-you", {
    title: "Thank You",
    data: docs,
    hotel: result
  })
})

router.get("/search", async (req, res, next) => {
  let query = {
    address: req.query.address || null,
    startPrice: req.query.startPrice || null,
    endPrice: req.query.endPrice || null,
    room_no: req.query.room_no || null,
    children: req.query.children || null
  }

  const result = await RoomController.search(query);
  console.log("Result", result);

  res.render("rooms/search", {
    title: "Room Search"
  })
})

module.exports = router;
