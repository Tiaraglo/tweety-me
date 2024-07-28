// const { ObjectId } = require("mongodb");
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/mongoConnection");
const { hashPassword } = require("../utils/bcrypt");

const userCollection = () => {
  return getDatabase().collection("users");
};

const findAllUser = async () => {
  const users = await userCollection().find().toArray();

  return users;
};

const findUserById = async (id) => {
  const agg = [
    {
      $match: {
        _id: new ObjectId(id),
      },
    },
    {
      $project: {
        password: 0,
      },
    },
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "followerId",
        as: "following",
      },
    },
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "followingId",
        as: "followers",
      },
    },
  ];

  const user = await userCollection().aggregate(agg).toArray();

  console.log(user);

  return user[0];
};

const addUser = async (payload) => {
  payload.password = hashPassword(payload.password);
  const newUser = await userCollection().insertOne(payload);

  const dataUser = await userCollection().findOne(
    {
      _id: new ObjectId(newUser.insertedId),
    },
    {
      projection: {
        password: 0,
      },
    }
  );

  return dataUser;
};

const findUserByUsername = async (username) => {
  const user = await userCollection().findOne({ username });

  return user;
};

const findUserByName = async (name) => {
  const user = await userCollection().findOne({ name });

  return user;
};

module.exports = {
  findAllUser,
  findUserById,
  addUser,
  findUserByUsername,
  findUserByName,
};
