const { ObjectId } = require('mongodb');
const User = require('../models/User');

const followsCollection = require('../db').db().collection('follows');
const usersCollection = require('../db').db().collection('users');
function Follow(followedUsername, authorId) {
  this.followedUsername = followedUsername;
  this.authorId = authorId;
  this.errors = [];
}

Follow.prototype.cleanUp = function () {
  if (typeof this.followedUsername != 'string') {
    this.followedUsername = '';
  }
};

Follow.prototype.validate = async function (action) {
  let followedAccount = await usersCollection.findOne({
    username: this.followedUsername,
  });
  if (followedAccount) {
    this.followedId = followedAccount._id;
  } else {
    this.errors.push('You cannot follow a user that does not exist');
  }

  let doesFollowAlreadyExist = await followsCollection.findOne({
    followedId: this.followedId,
    authorId: new ObjectId(this.authorId),
  });
  if (doesFollowAlreadyExist && action == 'create') {
    this.errors.push('You are already following this user');
  }
  if (!doesFollowAlreadyExist && action == 'delete') {
    this.errors.push(
      'You cannot stop following some one who you do not follow already'
    );
  }

  if (this.followedId.equals(this.authorId)) {
    this.errors.push('You cannot follow yourself.');
  }
};

Follow.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate('create');
    if (this.errors.length == 0) {
      await followsCollection.insertOne({
        followedId: this.followedId,
        authorId: new ObjectId(this.authorId),
      });

      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.prototype.delete = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate('delete');
    if (this.errors.length == 0) {
      await followsCollection.deleteOne({
        followedId: this.followedId,
        authorId: new ObjectId(this.authorId),
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.isVisitorFollowing = async function (followedId, visitorId) {
  let followDoc = await followsCollection.findOne({
    followedId: followedId,
    authorId: new ObjectId(visitorId),
  });
  if (followDoc) {
    return true;
  } else {
    return false;
  }
};

Follow.getFollowersById = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let followers = await followsCollection
        .aggregate([
          { $match: { followedId: id } },
          {
            $lookup: {
              from: 'users',
              localField: 'authorId',
              foreignField: '_id',
              as: 'userDoc',
            },
          },
          {
            $project: {
              username: { $arrayElemAt: ['$userDoc.username', 0] },
              email: { $arrayElemAt: ['$userDoc.email', 0] },
            },
          },
        ])
        .toArray();

      followers = followers.map((follower) => {
        let user = new User(follower, true);
        return {
          username: follower.username,
          avatar: user.avatar,
        };
      });

      resolve(followers);
    } catch {
      reject();
    }
  });
};

Follow.getFollowingById = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let following = await followsCollection
        .aggregate([
          { $match: { authorId: id } },
          {
            $lookup: {
              from: 'users',
              localField: 'followedId',
              foreignField: '_id',
              as: 'userDoc',
            },
          },
          {
            $project: {
              username: { $arrayElemAt: ['$userDoc.username', 0] },
              email: { $arrayElemAt: ['$userDoc.email', 0] },
            },
          },
        ])
        .toArray();

      following = following.map((follower) => {
        let user = new User(follower, true);
        return {
          username: follower.username,
          avatar: user.avatar,
        };
      });

      resolve(following);
    } catch {
      reject();
    }
  });
};

module.exports = Follow;
