const { GraphQLDateTime } = require("graphql-iso-date");

const userResolver = require("./user.resolver");
const organizationResolver = require("./organization.resolver");
const roomResolver = require("./room.resolver");

const customScalarResolver = {
  Date: GraphQLDateTime,
};

module.exports = [
  customScalarResolver,
  userResolver,
  organizationResolver,
  roomResolver,
];
