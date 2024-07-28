const { getDatabase } = require("../config/mongoConnection");
const { ObjectId } = require("mongodb");

const followCollection = () => {
  return getDatabase().collection("follows");
};

const addUserFollow = async (input) => {
  const newFollow = await followCollection().insertOne(input);

  const dataFollow = await followCollection().findOne({
    _id: new ObjectId(newFollow.insertedId),
  });

  // console.log(dataFollow);
  return dataFollow;
};

module.exports = {
  addUserFollow,
};
