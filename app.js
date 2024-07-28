if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { userTypeDefs, userResolvers } = require("./schemas/user");
const { mongoConnect } = require("./config/mongoConnection");
const authentication = require("./utils/authentication");
const { postTypeDefs, postResolvers } = require("./schemas/post");
const { followTypeDefs, followResolvers } = require("./schemas/follow");

const server = new ApolloServer({
  typeDefs: [userTypeDefs, postTypeDefs, followTypeDefs],
  resolvers: [userResolvers, postResolvers, followResolvers],
  introspection: true,
});

(async () => {
  try {
    await mongoConnect();
    const { url } = await startStandaloneServer(server, {
      context: async ({ req, res }) => {
        return {
          authentication: async () => {
            return await authentication(req);
          },
        };
      },
      listen: { port: process.env.PORT || 4000 },
    });

    console.log(`🚀  Server ready at: ${url}`);
  } catch (error) {
    console.log(error);
  }
})();
