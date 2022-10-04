const mongoose = require("mongoose");
const OrganizationModel = require("./organization.model");
const { DataUtils, TextUtils } = require("../../utils");
const RoomModel = require("../rooms/room.model");
const BookingsController = require("../bookings/booking.controller");
const UserController = require("../users/user.controller");

function mapped_organization_req(organization, organizationDetails) {
  if (organizationDetails.name) organization.name = organizationDetails.name;
  if (organizationDetails.type) organization.type = organizationDetails.type;
  if (organizationDetails.display_picture)
    organization.display_picture = organizationDetails.display_picture;
  if (organizationDetails.contact_no)
    organization.contact_no = organizationDetails.contact_no;
  if (organizationDetails.district)
    organization.district = organizationDetails.district;
  if (organizationDetails.city) organization.city = organizationDetails.city;
  if (organizationDetails.address)
    organization.address = organizationDetails.address;
  if (organizationDetails.lat || organizationDetails.lng) {
    organization.coordinates["lat"] = organizationDetails.lat;
    organization.coordinates["lng"] = organizationDetails.lng;
  }
  if (organizationDetails.facilities)
    organization.facilities = organizationDetails.facilities.split(",");
  if (organizationDetails.rules)
    organization.rules = organizationDetails.rules.split(",");
  if (organizationDetails.title || organizationDetails.description) {
    organization.meta["title"] = organizationDetails.name;
    organization.meta["description"] = organizationDetails.description;
  }
  if (organizationDetails.created_by)
    organization.created_by = organizationDetails.created_by;

  return organization;
}
class Organizations {
  constructor() { }

  // add organization's details
  add(payload) {
    return new Promise((resolve, reject) => {
      let organization_obj = new OrganizationModel(payload);
      organization_obj.save().then(async organization => {
        if (organization.created_by) {
          await UserController.findByIdAndUpdate(
            organization.created_by,
            organization._id
          );
          resolve(organization);
        }
      }).catch(err => reject(err))
    })
  }

  // update organization's details
  // update(payload, id, file, fileErr) {
  //   return new Promise((resolve, reject) => {
  //     OrganizationModel.findById(id)
  //       .then(organization => {
  //         if (organization) {
  //           if (fileErr) {
  //             return reject({
  //               message: "Invalid File Format"
  //             });
  //           }
  //           if (file) {
  //             payload.display_picture = file.path;
  //           }
  //           mapped_organization_req(organization, payload)
  //             .save()
  //             .then(organization => resolve(organization))
  //             .catch(err => reject(err));
  //         } else {
  //           return reject({
  //             Message: "Organization Not Found"
  //           });
  //         }
  //       })
  //       .catch(err => reject(err));
  //   });
  // }

  async update(payload, id) {
    const organization = await this.getOne(id);
    if (organization) {
      return OrganizationModel.findOneAndUpdate(
        { _id: id },
        { $set: payload },
        { new: true }
      )
    } else {
      throw "Organization does not exist"
    }
  }

  // List recently added organizations details
  listAll() {
    return OrganizationModel.find()
      .sort("-created_at")
      .limit(4);
  }

  getAll() {
    return OrganizationModel.find().sort("-created_at")
  }

  listActive(cur_user) {
    return OrganizationModel.find({
      $and: [{ created_by: cur_user }, { is_active: true }]
    });
  }

  // list specific organization's details
  getOne(id) {
    return new Promise((resolve, reject) => {
      OrganizationModel.findById(id)
        .then(organization => {
          if (organization) {
            return resolve(organization);
          } else {
            return reject({
              message: "Organization not Found"
            });
          }
        })
        .catch(err => reject(err));
    });
  }

  // total number of rooms
  async getRoomStat(orgId) {
    let docs = [];
    let result = {};
    try {
      let rooms = await RoomModel.find({ org_id: orgId });
      if (rooms.length) {
        for (let item of rooms) {
          let book = await BookingsController.listByRoomId(item._id);
          docs.push(book);
        }
      }
      result.room_count = rooms.length;
      result.bookings_count = docs.length;
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  list({ limit, start, search, cur_user }) {
    let query = {};
    if (search) {
      const regex = new RegExp(TextUtils.escapeRegex(search), "gi");
      query = { name: { $regex: regex } };
    }
    return DataUtils.paging({
      start,
      limit,
      sort: { created_at: -1 },
      model: OrganizationModel,
      query: [
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $match: {
            $and: [query, { created_by: cur_user }]
          }
        }
      ]
    });
  }

  // organizations pagination
  async pagination(page, perPage) {
    try {
      const allOrg = await OrganizationModel
        .find({})
        .sort("-created_at")
        .skip((perPage * page) - perPage)
        .limit(perPage);
      const count = await OrganizationModel.count();
      return {
        allOrg,
        count
      }
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new Organizations();
