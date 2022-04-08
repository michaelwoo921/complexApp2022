const postsCollection = require('../db').db().collection('posts');
const ObjectId = require('mongodb').ObjectId;
const User = require('./User');

function Post(data, userid) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
}

Post.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();

    if (this.errors.length > 0) {
      reject(this.errors);
    } else {
      let result = await postsCollection.insertOne(this.data);
      resolve(result.insertedId);
    }
  });
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != 'string') {
    this.data.title = '';
  }
  if (typeof this.data.body != 'string') {
    this.data.body = '';
  }
  this.data = {
    title: this.data.title,
    body: this.data.body,
    createdDate: new Date(),
    author: new ObjectId(this.userid),
  };
  console.log(this.data);
};

Post.prototype.validate = function () {
  if (this.data.title == '') {
    this.errors.push('You must enter a title');
  }
  if (this.data.body == '') {
    this.errors.push('You must enter a post content');
  }
};

Post.findSingleById = function (id, visitorId) {
  return new Promise(async (resolve, reject) => {
    let posts = await postsCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'authorDocument',
          },
        },
        {
          $project: {
            title: 1,
            body: 1,
            createdDate: 1,
            authorId: '$author',
            author: { $arrayElemAt: ['$authorDocument', 0] },
          },
        },
      ])
      .toArray();

    posts = posts.map((post) => {
      post.isVisitorOwner = post.authorId.equals(visitorId);
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar,
      };
      return post;
    });

    if (posts.length > 0) {
      console.log(posts[0]);
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

module.exports = Post;
