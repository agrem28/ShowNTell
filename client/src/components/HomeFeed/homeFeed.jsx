/* eslint-disable import/extensions */
import React, { useState } from 'react';
import FeedItem from './feedItem.jsx';
import './homefeed.css';

const HomeFeed = ({ posts, handleUserClick, user }) => (
  <div className="home-feed-container">
    {posts
      ? posts.map((post, i) => (
        <FeedItem
          handleUserClick={handleUserClick}
          post={post}
          key={post + i}
          user={user}
        />
      ))
      : null}
  </div>
);

export default HomeFeed;
