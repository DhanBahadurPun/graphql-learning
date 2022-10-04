const router = require("express").Router();
const RoomController = require("./room.controller");
const upload = require("../../utils/image.upload");
const { SecureAPI } = require("../../utils/secure");
const slugify = require("slugify");
const helper = require("../../utils/helper");
const multer = require("multer");
const path = require("path");
const Resize = require("../../utils/resizer");

const up = multer({
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post("/uploadImg", up.single("file"), async (req, res) => {
  const imagePath = path.join(__dirname, "../../public/assets/images/uploads/");
  const fileUpload = new Resize(imagePath);
  if (!req.file) {
    res.status(401).json({ error: "Please provide an image" });
  }
  const filename = await fileUpload.save(req.file.buffer);
  return res.status(200).json({ error: false, result: filename });
});

router.post("/", SecureAPI(), async (req, res, next) => {
  const pictures = req.body.images
    ? req.body.images.split(",")
    : ["default.png"];
  const featuredImg = pictures.length ? pictures[0] : "";
  let capa = {
    adults: req.body.adults || 0,
    children: req.body.children || 0
  };
  let meta_info = {
    title: req.body.title + " " + "in nepal",
    description: req.body.description || ""
  };
  let random = helper.randomString();
  let slug_url = slugify(req.body.title, { lower: true }) + "-" + random;
  let amenities = req.body.amenities.split(',');
  let body = Object.assign({}, req.body, {
    added_by: req.tokenData._id,
    capacity: capa,
    meta: meta_info,
    slug: slug_url,
    featured_img: featuredImg,
    images: pictures,
    amenities: amenities
  });
  delete body.adults;
  delete body.children;
  try {
    let doc = await RoomController.add(body);
    res.status(200).json(doc);
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", SecureAPI(), async (req, res, next) => {
  const pictures = req.body.images
    ? req.body.images.split(",")
    : ["default.png"];
  const featuredImg = pictures.length ? pictures[0] : "";
  let capa = {
    adults: req.body.adults || 0,
    children: req.body.children || 0
  };
  let amenities = req.body.amenities.split(',');
  let body = Object.assign({}, req.body, {
    added_by: req.tokenData._id,
    capacity: capa,
    featured_img: featuredImg,
    images: pictures,
    amenities: amenities
  });
  delete body.adults;
  delete body.children;
  try {
    let doc = await RoomController.update(req.params.id, body);
    res.status(200).status(200).json(doc);
  } catch (e) {
    return next(e);
  }
});

router.get("/", SecureAPI(), (req, res, next) => {
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let search = req.query.search ? req.query.search.value : null;
  let cur_user = req.tokenData._id;
  RoomController.list({ limit, start, search, cur_user })
    .then(rooms => {
      res.status(200).json(rooms);
    })
    .catch(err => next(err));
});

// list specific room's routes
router.get("/:id", (req, res, next) => {
  RoomController.listOne(req.params.id)
    .then(room => res.status(200).json(room))
    .catch(err => next(err));
});

// delete specific room's routes
router.delete("/:id", (req, res, next) => {
  RoomController.remove(req.params.id)
    .then(room => res.status(200).json(room))
    .catch(err => next(err));
});

// update specific room's routes
router.put("/:id", upload.array("images"), (req, res, next) => {
  RoomController.update(req.body, req.params.id, req.files, req.fileErr)
    .then(room => res.status(200).json(room))
    .catch(err => next(err));
});

router.post("/listWithStatus", (req, res, next) => {
  RoomController.listWithStatus(req.body.status)
    .then(room => res.status(200).json(room))
    .catch(err => next(err));
});

module.exports = router;
