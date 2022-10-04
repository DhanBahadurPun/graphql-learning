const { gql } = require("apollo-server");

module.exports = gql`
  enum Gender {
    MALE
    FEMALE
  }

  enum Role {
    ADMIN
    ORG_ADMIN
    USER
  }

  type Password {
    hash: String
    salt: String
  }

  type Extras {
    city: String
    about: String
    address: String
    phone: String
  }

  type User {
    id: ID
    name: String!
    username: String!
    gender: Gender
    phone: String!
    role: Role!
    password: Password
    imgUrl: String
    resetToken: String
    resetTokenExpire: Date
    extras: Extras
    is_active: Boolean
    organizations: [ID]
  }

  type LoginUser {
    token: String!
    user: User
  }

  input UserInput {
    name: String!
    username: String!
    gender: Gender!
    phone: String!
    password: String!
    role: Role! = user
    is_active: Boolean! = true
  }

  input LoginInput {
    username: String!
    password: String!
  }

  extend type Mutation {
    userSignup(newUser: UserInput!): User
    userLogin(loginInfo: LoginInput!): LoginUser
  }

  extend type Query {
    getAllUsers: [User]
    getOneUser(id: ID!): User
  }
`;
