const router = require("express").Router();
const { SecureAPI } = require("../../utils/secure");
const OrganizationController = require("../organization/organization.controller");
const RoomController = require("../rooms/room.controller");

router.get("/hotel-grid-view", (req, res, next) => {
  res.render("organizations/hotel-grid-view", { title: "Hotel Views" });
});

router.get("/view/:org_id", (req, res, next) => {
  const perPage = 15;
  const page = req.query.page || 1;
  RoomController.listByOrg(req.params.org_id, page, perPage).then(docs => {
    if (docs.roomList.length) {
      res.render("organizations/details", {
        title: "Hotel Details",
        result: docs.roomList,
        current: page,
        pages: Math.ceil(docs.count / perPage),
        id: docs.roomList[0].org_id._id
      });
    } else {
      res.render("organizations/details", {
        title: "Hotel Details",
        result: docs.roomList,
        current: page,
        pages: Math.ceil(docs.count / perPage),
        id: docs.roomList
      });
    }
  })


});

router.get("/add", SecureAPI(), (req, res, next) => {
  res.render("organizations/add", {
    layout: "layouts/dashboard.ejs",
    title: "Add Organization"
  });
});

router.get("/list", SecureAPI(), (req, res, next) => {
  res.render("organizations/list", {
    layout: "layouts/dashboard.ejs",
    title: "List Organization"
  });
});

// router.get("/list", SecureAPI(), async (req, res, next) => {
//   // let orgs = [];
//   // try {
//   //   let user = await UserController.getOne(req.tokenData._id);
//   //   let org_ids = user.organizations || [];
//   //   if (org_ids.length) {
//   //     for (let i of org_ids) {
//   //       let doc = await OrganizationController.getOne(i);
//   //       orgs.push(doc);
//   //     }
//   //   }
//     res.render("organizations/list", {
//       layout: "layouts/dashboard.ejs",
//       title: "List Organization"
//     });
//   // } catch (err) {
//   //   return next(err);
//   // }
// });

router.get("/edit/:id", SecureAPI(), (req, res, next) => {
  OrganizationController.getOne(req.params.id)
    .then(organization => {
      res.render("organizations/update", {
        title: "Update Organization",
        layout: "layouts/dashboard.ejs",
        organization: organization
      });
    })
    .catch(err => next(err));
});

router.get('/listing', (req, res, next) => {
  const perPage = 15;
  const page = req.query.page || 1;
  OrganizationController.pagination(page, perPage).then(async organization => {
    var obj = [];
    for (let org of organization.allOrg) {
      let totalRooms = await RoomController.listOrgById(org._id);
      obj.push(totalRooms.length);
    }
    res.render('organizations/list-all', {
      title: "Hotel List",
      result: organization.allOrg,
      current: page,
      pages: Math.ceil(organization.count / perPage),
      roomsCount: obj
    })
  }).catch(err => next(err))
});

module.exports = router;
