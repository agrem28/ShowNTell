const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  id: Number,
  name: String,
  posts: Array,
  messages: Array,
  phone: String,
  notifs: Array,
  follows: Array,
  subscriptions: Array,
});

const Users = mongoose.model('Users', userSchema);

const showSchema = mongoose.Schema({
  name: String,
  id: Number,
  posts: Array,
  subscriberCount: Number,
});

const Shows = mongoose.model('Shows', showSchema);

const postSchema = mongoose.Schema({
  user: String,
  name: String,
  show: String,
  title: String,
  content: String,
  comments: Object,
  createdAt: Date,
  liked: Object,
  likedCount: Number,
});

const Posts = mongoose.model('Posts', postSchema);

const commentSchema = mongoose.Schema({
  currentComment: String,
  childComments: Array,
  parentId: String,
  createdAt: Date,
});

const Comments = mongoose.model('Comments', commentSchema);

module.exports = {
  Users,
  Shows,
  Posts,
  Comments,
};
