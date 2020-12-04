/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const path = require('path');
const express = require('express');
const passport = require('passport');
const axios = require('axios');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();
require('./db/index');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const Notifs = require('twilio')(accountSid, authToken);
const { GoogleStrategy } = require('./oauth/passport');
const { Users, Posts, Shows, Comments } = require('./db/schema.js');
// const { session } = require('passport');

const app = express();

const client = path.resolve(__dirname, '..', 'client', 'dist');

let userInfo = null;

app.use(express.static(client));
app.use(express.json());
app.use(cors());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(
  session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    saveUninitialized: false,
    resave: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
  '/auth/google',
  passport.authenticate(
    'google',
    { scope: ['https://www.googleapis.com/auth/plus.login'] },
    (req, res) => {
      // res.redirect('/');
    },
  ),
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/logout' }),
  (req, res) => {
    const newUser = new Users({
      id: Number(req.user.id),
      name: req.user.displayName,
    });

    Users.findOne({ id: Number(req.user.id) }).then((data) => {
      if (data) {
        res.redirect('/');
        userInfo = data;
      } else {
        newUser.save().then(() => {
          userInfo = newUser;
          res.redirect('/');
        });
      }
    });
  },
);

app.get('/user', (req, res) => {
  // res.status(200).json(userInfo);
  if (userInfo !== null) {
    Users.findOne({ id: userInfo.id }).then((data) => {
      userInfo = data;
      res.json(userInfo);
    });
  } else {
    res.json(userInfo);
  }
});

app.get('/users', (req, res) => {
  Users.find()
    .then((data) => res.status(200).json(data))
    .catch();
});

app.get('/posts', (req, res) => {
  // Posts.remove().then(
  Posts.find()
    .then((posts) => res.send(posts))
    .catch();
  // );
});

app.get('/shows', (req, res) => {
  Shows.find()
    .then((data) => res.status(200).json(data))
    .catch();
});

app.get('/comments', (req, res) => {
  Comments.find()
    .then((data) => res.status(200).json(data))
    .catch();
});

app.get('/findUser', (req, res) => {
  // Users.remove().then(
  Users.find()
    .then((data) => res.json(data))
    .catch();
  // );
});

app.get('/user/posts/:name', (req, res) => {
  console.log('PARAMS', req.params.name);
  const user = req.params.name;
  Posts.find({ name: user })
    .then((posts) => res.send(posts))
    .catch();
});

app.put('/startMessage/:user/:name', (req, res) => {
  Users.updateOne(
    { id: userInfo.id },
    {
      messages: [
        ...userInfo.messages,
        { id: req.params.user, name: req.params.name, text: [] },
      ],
    },
  )
    .then((data) => res.json(data))
    .catch();
});

app.put('/sendMessage/:id/:text', (req, res) => {
  const content = userInfo.messages;
  for (let i = 0; i < content.length; i += 1) {
    if (content[i].id === req.params.id) {
      content[i].text.push({ name: userInfo.name, message: req.params.text });
      break;
    }
  }
  Users.updateOne({ id: userInfo.id }, { messages: content })
    .then(() => Users.findOne({ id: req.params.id }))
    .then((data) => {
      const replace = data.messages || [];
      let test = false;
      for (let i = 0; i < replace.length; i += 1) {
        if (replace[i].id === String(userInfo.id)) {
          replace[i].text.push({
            name: userInfo.name,
            message: req.params.text,
          });
          test = true;
          break;
        }
      }
      if (test) {
        Users.updateOne(
          { id: Number(req.params.id) },
          { messages: replace,
            notifs: [...data.notifs, `${userInfo.name} messaged you`],
          },
        ).then((result) => res.json(result));
      } else {
        // console.log(content, 'here');
        Users.updateOne(
          { id: Number(req.params.id) },
          {
            messages: [
              ...replace,
              {
                id: String(userInfo.id),
                name: userInfo.name,
                text: [{ name: userInfo.name, message: req.params.text }],
              },
            ],
            notifs: [...data.notifs, `${userInfo.name} messaged you`],
          },
        ).then((result) => res.json(result));
      }
    });
});

app.post('/liked', (req, res) => {
  const postId = req.body.postId;
  const liked = req.body.liked;
  const addOrMinus = liked ? -1 : 1;

  Posts.findById(postId)
    .then((post) => {
      let newLiked = post.liked;
      if (newLiked === undefined) {
        newLiked = {};
        newLiked[userInfo._id] = true;
      } else if (post.liked[userInfo._id]) {
        newLiked[userInfo._id] = false;
      } else {
        newLiked[userInfo._id] = true;
      }
      Posts.updateOne(
        { _id: postId },
        {
          likedCount: post.likedCount + addOrMinus,
          liked: newLiked,
        },
      ).catch();
    }).then(() => res.send()).catch();
});

app.post('/addComment', (req, res) => {
  const comment = req.body.comment;
  comment.createdAt = new Date();
  // console.log('----', comment);
  const postId = req.body.postId;
  Comments.create(comment)
    .then((record) => {
      Posts.updateOne({ _id: postId }, { $push: { comments: record } })
        .then(() => {
          Posts.findById(postId)
            .then((post) => res.send(post.comments)).catch();
        }).catch();
    })
    .catch();
});

app.post('/addResponse', (req, res) => {
  const update = (comments) => {
    comments.forEach((comment) => {});
  };
  Posts.updateOne(
    { 'comments.currentComment': req.body.comment.parentComment },
    {
      $push: {
        'comments.$.childComments': req.body.comment.currentComment,
      },
    },
  )
    .then(() => {
      Posts.find({ _id: req.body.comment.postId }).then((post) => {
        res.send(post[0].comments);
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/search/:query', (req, res) => {
  const url = `http://api.tvmaze.com/search/shows?q=${req.params.query}`;
  return axios(url)
    .then(({ data }) => data)
    .then((data) => res.status(200).send(data))
    .catch(() => console.log('error'));
});

app.get('/show/:id', (req, res) => {
  Shows.find({ id: req.params.id })
    .then((record) => {
      if (record.length > 0) {
        return record[0];
      }
      return axios(`http://api.tvmaze.com/shows/${req.params.id}`)
        .then(({ data }) => Shows.create({
          id: data.id,
          name: data.name,
          posts: [],
          subscriberCount: 0,
        })).then((result) => result)
        .catch();
    })
    .then((result) => res.status(200).send(result))
    .catch(() => res.status(500).send());
});

app.put('/subscribe/:id', (req, res) => {
  const { id } = req.params;
  Users.findById(userInfo._id)
    .then((user) => {
      if (!user.subscriptions.includes(id)) {
        userInfo.subscriptions = [...user.subscriptions, id];
        Users.updateOne(
          { _id: user._id },
          { subscriptions: [...user.subscriptions, id] },
        ).then(() => {
          Shows.findOne({ id })
            .then((record) => {
              Shows.updateOne(
                { id: req.params.id },
                { subscriberCount: record.subscriberCount + 1 },
              ).catch();
            })
            .catch();
        }).catch();
      } else {
        console.log('already subscribed');
      }
    })
    .then(() => res.status(200).send())
    .catch(() => res.status(500).send());
});

app.get('/delete', (req, res) => {
  Users.deleteMany()
    .then(() => Posts.deleteMany())
    .then(() => Shows.deleteMany())
    .then(() => Comments.deleteMany())
    .then(() => res.status(200).json('done'))
    .catch();
});

app.get('/logout', (req, res) => {
  userInfo = null;
  res.status(200).json(userInfo);
});

app.post('/posts', (req, res) => {
  const { title, content, poster, show, name } = req.body;

  return Posts.create({
    title,
    content,
    user: poster,
    name,
    show,
    comments: {},
    createdAt: new Date(),
    liked: {},
    likedCount: 0,
  })
    .then((post) => {
      Users.findById(poster)
        .then((user) => {
          userInfo.posts = [...user.posts, post._id];
          Users.updateOne(
            { _id: poster },
            { posts: [...user.posts, post._id] },
          ).catch();
        }).then(() => {
          Shows.findOne({ id: show })
            .then((record) => {
              Shows.updateOne(
                { id: show },
                { posts: [...record.posts, post._id] },
              ).catch();
            }).catch();
        })
        .catch();
    })
    .then(() => res.status(201).send())
    .catch(() => res.status(500).send());
});

app.get('/post/:id', (req, res) => {
  Posts.findById(req.params.id)
    .then((post) => res.status(200).send(post))
    .catch(() => res.status(500).send());
});

app.post('/number', (req, res) => {
  const { number } = req.body;
  if (!number) {
    Users.updateOne({ id: userInfo.id }, { phone: number })
      .then((data) => res.json(data));
  } else {
    Users.updateOne({ id: userInfo.id }, { phone: number, notifs: [`you will now receive notifications @ ${number}   `] })
      .then((data) => res.json(data));
  }
});

app.get('/notifs/:text/:id', (req, res) => {
  res.json(req.params);
  if (req.params.id === 'null') {
    Notifs.messages
      .create({
        body: req.params.text,
        from: '+12678677568',
        to: userInfo.phone,
      })
      .then((message) => res.json(message.sid))
      .catch((err) => console.log(err));
  } else {
    Users.findOne({ id: req.params.id })
      .then((data) => {
        Notifs.messages
          .create({
            body: req.params.text,
            from: '+12678677568',
            to: data.phone,
          })
          .then((message) => res.json(message.sid))
          .catch((err) => console.log(err));
      });
  }
});

app.delete('/notifs/:index', (req, res) => {
  const replacementNotif = [];
  for (let i = 0; i < userInfo.notifs.length; i += 1) {
    if (i !== Number(req.params.index)) {
      replacementNotif.push(userInfo.notifs[i]);
    }
  }
  Users.update({ id: userInfo.id }, { notifs: replacementNotif })
    .then((data) => res.json(data));
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});
