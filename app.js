const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
  AuthenticationError,
} = require("apollo-server-core");
const jwt = require("jsonwebtoken");

const schema = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

const SercureAPI = require("./utils/authenticate");
const models = require("./modules/model");

mongoose.Promise = global.Promise;

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on("open", () => {
  console.log("Connected to DB..");
});
mongoose.connection.on("error", (err) => {
  console.log("ERROR:", err.message);
});

const getMe = async (req) => {
  const token = req.headers["x-access-token"];

  if (token) {
    try {
      return jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      throw new AuthenticationError("Your session expired. Login again.");
    }
  }
};

const server = new ApolloServer({
  introspection: true,
  typeDefs: schema,
  resolvers,
  context: async ({ req, cennection }) => {
    return {
      models,
      getMe: await getMe(req),
      // secret key
      // SecureAPI
    };
  },
  cache: "bounded",
  csrfPrevention: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
