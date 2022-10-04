const RoomModel = require("./room.model");
const { DataUtils, TextUtils } = require("../../utils");

function mapped_room_req(room, roomDetails) {
  if (roomDetails.status) room.status = roomDetails.status;
  if (roomDetails.type) room.type = roomDetails.type;
  if (roomDetails.available_nos) room.available_nos = roomDetails.available_nos;
  if (roomDetails.price) room.price = roomDetails.price;
  if (roomDetails.discount) room.discount = roomDetails.discount;
  if (roomDetails.guest_capacity)
    room.guest_capacity = roomDetails.guest_capacity;
  if (roomDetails.description) room.description = roomDetails.description;
  if (roomDetails.amenities) room.amenities = roomDetails.amenities.split(",");
  if (roomDetails.title || roomDetails.description) {
    room.meta["title"] = roomDetails.title;
    room.meta["description"] = roomDetails.description;
  }
  if (roomDetails.org_id) room.org_id = roomDetails.org_id;
  if (roomDetails.added_by) room.added_by = roomDetails.added_by;

  return room;
}
class Rooms {
  constructor() {}

  //add room details
  add(payload) {
    let room_obj = new RoomModel(payload);
    return room_obj.save();
  }

  // list all rooms details
  listAll() {
    return RoomModel.find({ status: "published" })
      .sort("-created_at")
      .populate("org_id")
      .limit(8);
  }

  getAll() {
    return RoomModel.find({ status: "published" })
      .sort("-created_at")
      .populate("org_id");
  }

  list({ limit, start, search, cur_user }) {
    let query = {};
    if (search) {
      const regex = new RegExp(TextUtils.escapeRegex(search), "gi");
      query = { title: { $regex: regex } };
    }
    return DataUtils.paging({
      start,
      limit,
      sort: { created_at: -1 },
      model: RoomModel,
      query: [
        {
          $lookup: {
            from: "organization",
            localField: "org_id",
            foreignField: "_id",
            as: "org",
          },
        },
        { $unwind: "$org" },
        {
          $match: {
            $and: [query, { added_by: cur_user }],
          },
        },
      ],
    });
  }

  async pagination(page, perPage) {
    try {
      const allRoom = await RoomModel.find({})
        .sort("-created_at")
        .skip(perPage * page - perPage)
        .limit(perPage);
      const count = await RoomModel.count();
      return {
        allRoom,
        count,
      };
    } catch (err) {
      throw err;
    }
  }

  getBySlug(slug_url) {
    return RoomModel.findOne({ slug: slug_url }).populate("org_id");
  }

  //list specific room details
  get(id) {
    return new Promise((resolve, reject) => {
      RoomModel.findById(id)
        .populate("org_id")
        .then((room) => {
          if (room) return resolve(room);
          return reject({
            message: "No room available",
          });
        })
        .catch((err) => reject(err));
    });
  }

  // remove specific room
  remove(id) {
    return new Promise((resolve, reject) => {
      RoomModel.findByIdAndRemove(id)
        .then((room) => {
          if (room) return resolve(room);
          return reject({
            message: "No room available",
          });
        })
        .catch((err) => reject(err));
    });
  }

  async update(id, payload) {
    let room = await this.get(id);
    if (room) {
      return RoomModel.findOneAndUpdate(
        { _id: id },
        { $set: payload },
        { new: true }
      );
    } else {
      throw "Room does not exists!";
    }
  }

  // update(id,payload) {
  //   return new Promise((resolve, reject) => {
  //     RoomModel.findById(id)
  //       .then(room => {
  //         if (room) {
  //           if (fileErr) {
  //             return reject({
  //               message: "Invalid File Format"
  //             });
  //           }
  //           if (files) {
  //             files.map(imgObj => room.images.unshift(imgObj.path));
  //           }
  //           mapped_room_req(room, payload)
  //             .save()
  //             .then(room => {
  //               return resolve(room);
  //             })
  //             .catch(err => reject(err));
  //         } else {
  //           return reject({
  //             message: "No Room available"
  //           });
  //         }
  //       })
  //       .catch(err => reject(err));
  //   });
  // }

  listWithStatus(payload) {
    return new Promise((resolve, reject) => {
      RoomModel.aggregate([
        {
          $match: {
            status: payload,
          },
        },
      ])
        .then((rooms) => resolve(rooms))
        .catch((err) => reject(err));
    });
  }

  async listByOrg(orgId, page, perPage) {
    try {
      const roomList = await RoomModel.find({ org_id: orgId })
        .sort("-created_at")
        .populate("org_id")
        .skip(perPage * page - perPage)
        .limit(perPage);
      const count = await RoomModel.find({ org_id: orgId }).count();
      return {
        roomList,
        count,
      };
    } catch (error) {
      throw error;
    }
  }

  listOrgById(orgId) {
    return RoomModel.find({ org_id: orgId })
      .sort("-created_at")
      .populate("org_id");
  }

  // Search ROOMS
  search(payload) {
    console.log("payload:", payload);

    let query = {
      organization: {},
      capacity: {},
    };
    Object.keys(payload).forEach((field) => {
      if (payload[field]) {
        if (field === "address") {
          query.organization.address = payload.address;
        } else if (field === "startPrice") {
          query.price = { $gte: +payload.startPrice };
        } else if (field === "endPrice") {
          if (query.price) {
            query.price = Object.assign(query.price, {
              $lte: +payload.endPrice,
            });
          } else {
            query.price = { $lte: +payload.endPrice };
          }
        } else if (field === "room_no") {
          query.no_of_rooms = payload.room_no;
        } else if (field === "children") {
          query.capacity.children = payload.children;
        }
      } else {
        query[field] = payload[field];
      }
    });

    console.log("query:", query);

    return RoomModel.aggregate([
      {
        $lookup: {
          from: "organization",
          localField: "org_id",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },
      {
        $project: {
          result: {
            $cond: [query, 9, 0],
          },
        },
      },
    ]);
  }
}

module.exports = new Rooms();
