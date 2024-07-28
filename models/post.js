const { getDatabase } = require("../config/mongoConnection");
const { ObjectId } = require("mongodb");

const postCollection = () => {
  return getDatabase().collection("posts");
};

const addPost = async (input) => {
  const newPost = await postCollection().insertOne(input);

  const dataPost = await postCollection().findOne({
    _id: new ObjectId(newPost.insertedId),
  });

  return dataPost;
};

const addCommentToPost = async (filter, commentInput) => {
  await postCollection().updateOne(filter, commentInput); //filter, payload for update

  const dataComment = await postCollection().findOne(filter);

  // console.log(filter);
  // console.log(dataComment);
  // console.log(dataComment);
  return dataComment;
};

const likePost = async (filter, likeInput) => {
  await postCollection().updateOne(filter, likeInput);

  const dataLike = await postCollection().findOne(filter);

  return dataLike;
};

const findAllPost = async () => {
  const agg = [
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "author.password": 0,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];

  const allPost = await postCollection().aggregate(agg).toArray();

  console.log(allPost, "all post");

  return allPost;
};

const findPostById = async (_id) => {
  const agg = [
    {
      $match: {
        _id: new ObjectId(_id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $project: {
        "author.password": 0,
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const onePostById = await postCollection().aggregate(agg).toArray();

  // console.log(onePostById, 'ini dia');

  return onePostById[0];
};

module.exports = {
  addPost,
  addCommentToPost,
  likePost,
  findAllPost,
  findPostById,
};
