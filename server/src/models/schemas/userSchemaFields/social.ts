import { Schema } from "mongoose";

export const socialFields = {
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },

  githubId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },

  facebookId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },

  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],

  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],

  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],

  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],

  friendRequests: {
    sent: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    received: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
};
