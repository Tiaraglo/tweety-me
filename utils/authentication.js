const { GraphQLError } = require("graphql");
const { verifyToken } = require("./jwt");
const { findUserById } = require("../models/user");

const authentication = async (req) => {
  const { authorization } = req.headers;
  // console.log(authorization, 'ini authentication di dalam context')
  console.log(authorization, "here");
  if (!authorization) {
    throw new GraphQLError("Invalid Token", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  const token = authorization.split(" ")[1];

  // console.log(token, 'ini authentication di dalam context')

  if (!token) {
    throw new GraphQLError("Invalid Token", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  const payload = verifyToken(token);

  const user = await findUserById(payload.id);

  //   console.log(user, "disini");
  if (!user) {
    throw new GraphQLError("Invalid User", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }
  // console.log(authorization, ' ini dia');

  return {
    userId: user._id,
    username: user.username,
  };
};

module.exports = authentication;
