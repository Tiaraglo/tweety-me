const redis = require("../config/redishConnection");
const { GraphQLError } = require("graphql");
const {
  addPost,
  addCommentToPost,
  likePost,
  findAllPost,
  findPostById,
} = require("../models/post");
const { ObjectId } = require("mongodb");

const DATA_POSTS_KEY = "data:post";

const typeDefs = `#graphql

    type Post {
        _id: ID,
        content: String,
        tags: [String],
        imgUrl: String,
        authorId: ID,
        comments: [Comment], 
        likes: [Like], 
        createdAt: String,
        updatedAt: String,
        author: User
    }

    type Comment {
        content: String,
        username: String,
        createdAt: String,
        updatedAt: String
    }

    type Like {
        username: String,
        createdAt: String,
        updatedAt: String
    }

    input AddPost {
        content: String,
        tags: [String],
        imgUrl: String
    }

    input AddCommentPost {
        content: String,
        postId: ID!
    }

    input AddLikePost {
        postId: ID!
    }

    type Query {
        getPosts: [Post]
        getPostById(_id: ID!): Post
    }

    type Mutation {
        addPost(input: AddPost): Post
        addComment(postId: String, content: String): Post
        addLike(input: AddLikePost): Post
    }
`;

const resolvers = {
  Query: {
    getPosts: async (_parent, args, contextValue) => {
      const postChache = await redis.get(DATA_POSTS_KEY);

      // console.log(postChache, "ini diaaaaaa data redish baru");

      if (postChache) {
        return JSON.parse(postChache);
      }

      const authorizedUser = await contextValue.authentication();

      const AllPosts = await findAllPost();

      await redis.set(DATA_POSTS_KEY, JSON.stringify(AllPosts));
      // console.log(AllPosts, "hahah");

      return AllPosts;
    },
    getPostById: async (_parent, args, contextValue) => {
      const authorizedUser = await contextValue.authentication();

      const { _id } = args;

      const OnePost = await findPostById(_id);

      return OnePost;
    },
  },
  Mutation: {
    addPost: async (_parent, args, contextValue) => {
      const authorizedUser = await contextValue.authentication();

      // console.log(authorizedUser.userId);
      const { content, tags, imgUrl } = args.input;

      const newPost = await addPost({
        content,
        tags,
        imgUrl,
        authorId: new ObjectId(authorizedUser.userId),
        comments: [],
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(newPost);

      redis.del(DATA_POSTS_KEY); // INVALIDATE CACHE

      return newPost;
    },
    addComment: async (_parent, args, contextValue) => {
      const authorizedUser = await contextValue.authentication();

      // console.log( await addComment(), `><<<<<<`);

      const { content, postId } = args;

      const { username } = authorizedUser;

      // console.log(postId, 'post id');
      const filter = { _id: new ObjectId(postId) };

      const commentInput = {
        $push: {
          comments: {
            content,
            username,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };
      const newComment = await addCommentToPost(filter, commentInput);

      redis.del(DATA_POSTS_KEY); // INVALIDATE CACHE

      console.log(newComment, "ini new comment");
      return newComment;
    },
    addLike: async (_parent, args, contextValue) => {
      const authorizedUser = await contextValue.authentication();

      const { postId } = args.input;

      const { username } = authorizedUser;

      const filter = { _id: new ObjectId(postId) };

      const likeInput = {
        $push: {
          likes: {
            username,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      const likeAPost = await likePost(filter, likeInput);

      redis.del(DATA_POSTS_KEY); // INVALIDATE CACHE

      return likeAPost;
    },
  },
};

module.exports = {
  postTypeDefs: typeDefs,
  postResolvers: resolvers,
};
