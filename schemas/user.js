const { ObjectId } = require("mongodb");
const {
  findAllUser,
  findUserById,
  addUser,
  findUserByUsername,
} = require("../models/user");
const { comparePassword } = require("../utils/bcrypt");
const { signToken } = require("../utils/jwt");
const { GraphQLError } = require("graphql");

const typeDefs = `#graphql

    type User {
        _id: ID!
        name: String!
        username: String!
        email: String!
        password: String
        following: Int
        followers: Int
    }


    input AddUserInput {
        name: String!
        username: String!
        email: String!
        password: String!
    }

    input LoginInput {
        username: String!
        password: String!
    }

    type LoginResponse {
        username: String
        access_token: String
    }

    type Query {
        getUsers: [User!] 
        searchUser (username: String): User 
        getUserProfile(_id: ID): User
    }

    type Mutation {
        register(input: AddUserInput): User
        login(input: LoginInput) : LoginResponse
    }

`;

const resolvers = {
  Query: {
    getUsers: async () => {
      const users = await findAllUser();
      return users;
    },
    getUserProfile: async (_parent, args, contextValue) => {
      const authorizedUser = await contextValue.authentication();

      // console.log(authorizedUser, "ini saiaya");
      const { userId } = authorizedUser;

      const _id = authorizedUser.userId;

      const userProfile = await findUserById(_id);

      // console.log(userProfile, "punya siapa");

      return {
        _id: userProfile._id,
        name: userProfile.name,
        username: userProfile.username,
        email: userProfile.email,
        following: userProfile.following.length,
        followers: userProfile.followers.length,
      };
    },
    searchUser: async (_parent, args, contextValue) => {
      const authorizedUser = await contextValue.authentication();

      const { username } = args;

      const foundUser = await findUserByUsername(username);

      return foundUser;
    },
  },
  Mutation: {
    register: async (_parent, args) => {
      const { name, username, email, password } = args.input;

      const dataUser = await addUser({
        name,
        username,
        email,
        password,
      });
      return dataUser;
    },

    login: async (_parent, args) => {
      console.log(args, `args data`);
      const { username, password } = args.input;

      const userLogin = await findUserByUsername(username);

      console.log(userLogin, "saya");
      if (!userLogin) {
        throw new GraphQLError("Invalid username/password", {
          extensions: {
            code: "UNAUTHENTICATED",
            http: { status: 401 },
          },
        });
      }

      console.log(userLogin, "user login");

      const isValidPass = comparePassword(password, userLogin.password);

      if (!isValidPass) {
        throw new GraphQLError("Invalid username/password", {
          extensions: {
            code: "UNAUTHENTICATED",
            http: { status: 401 },
          },
        });
      }

      const payload = {
        id: userLogin._id,
        username: userLogin.username,
        email: userLogin.email,
      };

      // console.log(payload, 'ini payload');
      const access_token = signToken(payload);

      // console.log(access_token);

      return {
        username: userLogin.username,
        access_token,
      };
    },
  },
};

module.exports = {
  userTypeDefs: typeDefs,
  userResolvers: resolvers,
};
