const { gql } = require("apollo-server");

module.exports = gql`
  type Organization {
    name: String!
    category: Category!
    photoUri: String
    contact_no: String!
    district: String
    city: String
    address: String
    coordinates: Coordinates
    facilities: [String]
    rules: [String]
    meta: Meta
    userId: ID
    active: Boolean
  }

  enum Category {
    HOTEL
    HOMESTAY
    GUESTHOUSE
  }

  type Coordinates {
    lat: Int
    lng: Int
  }

  type Meta {
    title: String
    description: String
  }

  input CreateOrganizationInput {
    name: String!
    category: Category
    contact: String!
    district: String
    city: String
    address: String
    facilities: [String]
    rules: [String]
  }

  extend type Mutation {
    createOrganization(input: CreateOrganizationInput): String
  }

  extend type Query {
    getAllOrganizations: [Organization]
  }
`;
