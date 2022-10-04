const router = require("express").Router();
const slugify = require("slugify");
const helper = require("../../utils/helper");
const upload = require("../../utils/image.upload");
const OrganizationController = require("./organization.controller");
const { SecureAPI } = require("../../utils/secure");

// add organization's details
router.post("/", SecureAPI(), async (req, res, next) => {
  let cord = {
    lat: req.body.lat || 27.70221,
    lng: req.body.lng || 85.313638
  };
  let meta_info = {
    title: req.body.name,
    description: req.body.description || ""
  };
  let random = helper.randomString();
  let slug_url = slugify(req.body.name, { lower: true }) + "-" + random;
  let facilities = req.body.facilities.split(',');
  let rules = req.body.rules.split(",");
  let body = Object.assign({}, req.body, {
    created_by: req.tokenData._id,
    coordinates: cord,
    meta: meta_info,
    slug: slug_url,
    facilities: facilities,
    rules: rules
  })

  try {
    let organization = await OrganizationController.add(body);
    return res.status(200).json(organization)
  } catch (e) {
    return next(e)
  }
});

// update organization's details
router.put("/:id", SecureAPI(), async (req, res, next) => {
  let cord = {
    lat: req.body.lat || 27.70221,
    lng: req.body.lng || 85.313638
  };
  let meta_info = {
    title: req.body.name,
    description: req.body.description || ""
  };
  let facilities = req.body.facilities.split(',');
  let rules = req.body.rules.split(",");
  let body = Object.assign({}, req.body, {
    created_by: req.tokenData._id,
    coordinates: cord,
    meta: meta_info,
    facilities: facilities,
    rules: rules
  })

  try {
    let organization = await OrganizationController.update(body, req.params.id);
    return res.status(200).json(organization)
  } catch (e) {
    return next(e)
  }
});

// update organization's details with pictures
// router.put("/:id", upload.single("display_picture"), (req, res, next) => {
//   OrganizationController.update(req.body, req.params.id, req.file, req.fileErr)
//     .then(organization => res.status(200).json(organization))
//     .catch(err => next(err));
// });

// List all organization's details
router.get("/", SecureAPI(), (req, res, next) => {
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let search = req.query.search ? req.query.search.value : null;
  let cur_user = req.tokenData._id;
  OrganizationController.list({ limit, start, search, cur_user })
    .then(organization => res.status(200).json(organization))
    .catch(err => next(err));
});

// list specific organization's details
router.get("/getOne/:id", (req, res, next) => {
  OrganizationController.getOne(req.params.id)
    .then(organization => {
      res.status(200).json(organization);
    })
    .catch(err => next(err));
});

// total numbers of rooms
router.get("/totalrooms", (req, res, next) => {
  OrganizationController.getTotalRooms()
    .then(organization => res.status(200).json(organization))
    .catch(err => next(err));
});

// total rooms and bookings

router.post("/totalroomandbooking", (req, res, next) => {
  OrganizationController.getRoomStat(req.body.org_id)
    .then(org => res.status(200).json(org))
    .catch(err => next(err));
});

module.exports = router;
