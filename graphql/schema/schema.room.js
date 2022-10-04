const { gql } = require("apollo-server");

module.exports = gql`
  type Room {
    title: String
    status: Status!
    category: Type!
    no_of_rooms: Int!
    booked: Int!
    price: Int!
    capacity: Capacity
    beds: Int!
  }

  enum Status {
    DRAFT
    PUBLISHED
  }

  enum Type {
    CHEAP
    BUDGET
    PREMIUM
  }

  type Capacity {
    adults: Int!
    children: Int!
  }

  input AvailableRoom {
    adults: Int!
    children: Int!
  }

  input CreateRoomInput {
    title: String
    status: Status!
    category: Type!
    room_number: Int!
    booked: Int!
    price: Int!
    available_room: AvailableRoom
    beds: Int!
  }

  extend type Mutation {
    createRoom(input: CreateRoomInput): String!
  }

  extend type Query {
    getAllRooms: [Room]
  }
`;
