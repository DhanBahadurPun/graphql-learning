module.exports = {
  Query: {
    async getAllRooms(parent, args, { models: { RoomModel } }) {
      const rooms = await RoomModel.find({});
      return rooms;
    },
  },
  Mutation: {
    async createRoom(parent, { input }, { models: { RoomModel } }) {
      const room = new RoomModel();

      room.title = input.title;
      room.status = input.status;
      room.category = input.category;
      room.no_of_rooms = input.room_number;
      room.booked = input.booked;
      room.price = input.price;
      room.capacity["adults"] = input.available_room["adults"];
      room.capacity["children"] = input.available_room["children"];
      room.beds = input.beds;

      await room.save();
      return "Room Saved Successfully!";
    },
  },
};
