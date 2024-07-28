const { GraphQLError } = require("graphql");
const { addPost, addCommentToPost, likePost } = require("../models/post");
const { ObjectId } = require("mongodb");
const { addUserFollow } = require("../models/follow");

const typeDefs = `#graphql

    type Follow {
        _id: ID!,
        followingId: ID!,
        followerId: ID!,
        createdAt: String,
        updateAt: String
    }


    type Mutation {
        followUser(_id: String): Follow
    }

`;

const resolvers = {
  Mutation: {
    followUser: async (_parent, args, contextValue) => {
      //   console.log(contextValue, "here");
      const authorizedUser = await contextValue.authentication();

      console.log(authorizedUser, "ini usernya");

      const { _id } = args;

      const newFollow = await addUserFollow({
        followingId: new ObjectId(_id),
        followerId: new ObjectId(authorizedUser.userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return newFollow;
    },
  },
};

module.exports = {
  followTypeDefs: typeDefs,
  followResolvers: resolvers,
};
