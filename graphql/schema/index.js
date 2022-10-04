const { gql } = require("apollo-server");

const userSchema = require("./schema.user");
const organizationSchema = require("./schema.organization");
const roomSchema = require("./schema.room");

const baseSchema = gql`
  scalar Date

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

module.exports = [baseSchema, userSchema, organizationSchema, roomSchema];

// type Subcriptions {
//   _: Boolean
// }
