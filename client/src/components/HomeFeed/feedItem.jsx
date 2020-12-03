/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import React, { useState } from 'react';
import axios from 'axios';
import './homefeed.css';
import { FaRegHeart, FaRegCommentDots } from 'react-icons/fa';

const FeedItem = ({ post, handleUserClick }) => {
  const [liked, setLiked] = useState(post.liked);
  const [commentClicked, setCommentClicked] = useState(false);
  const [respondClicked, setRespondClicked] = useState(false);
  const [respondId, setRespondId] = useState('');
  const [likedCount, setLikedCount] = useState(post.likedCount);

  const [currentComment, setCurrentComment] = useState('');
  const [commentsList, setCommentsList] = useState(post.comments || []);
  const [responseList, setResponseList] = useState([]);

  const handleLiked = () => {
    axios
      .post('/liked', { postId: post._id, liked: !liked })
      .then(({ data }) => {
        console.log('DATA', data);
        setLiked(data.liked);
        setLikedCount(data.likedCount);
      })
      .catch((err) => console.log(err));
  };

  const handleCommentClicked = () => setCommentClicked(!commentClicked);
  const handleRespondClicked = (id) => setRespondId(id);

  const handleSubmit = (e) => {
    setCommentClicked(!commentClicked);
    e.target.previousSibling.value = '';
    axios
      .post('/addComment', {
        comment: { currentComment, childComments: [] },
        postId: post._id,
      })
      .then(({ data }) => {
        console.log('object', data);
        setCommentsList(data);
      })
      .catch((err) => {});
  };

  const handleRespondSubmit = (e) => {
    e.target.previousSibling.value = '';
    const parentComment = e.target.parentElement.parentElement.firstChild.innerHTML;

    axios
      .post('/addResponse', {
        comment: { currentComment, parentComment, postId: post._id },
      })
      .then(({ data }) => {
        setCommentsList(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleChange = (event) => setCurrentComment(event.target.value);

  return (
    <div className="main-post-container">
      <div>
        <div className="posted-by">
          Posted By:
          {' '}
          <div className="posted-by" onClick={handleUserClick}>
            {post.name}
          </div>
          {' '}
          in
          {' '}
          <div className="posted-in-show-title">
            {post.show || 'insert show here'}
          </div>
        </div>
        <div className="feed-post-title">
          POST TITLE:
          {post.title}
        </div>
        <p className="feed-post-content">
          POST CONTENT:
          {post.content}
        </p>
      </div>
      <div>
        {liked ? (
          <div className="like-comment-block">
            <FaRegHeart
              className="liked-button"
              onClick={handleLiked}
            />
            <p className="like-count">{likedCount}</p>
          </div>
        ) : (
          <FaRegHeart className="like-button" onClick={handleLiked} />
        )}
        <FaRegCommentDots className="insert-comment-button" onClick={handleCommentClicked} />
      </div>
      {commentClicked ? (
        <div>
          <textarea
            placeholder="Insert comment here"
            onChange={handleChange}
          />
          <button className="submit-comment-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      ) : null}
      <div>
        <div className="comments-header">Comments</div>
        {commentsList.map((comment, i) => (
          <div
            key={i + comment.currentComment}
            id={i + comment.currentComment}
          >
            <p>{comment.currentComment}</p>
            {comment.childComments.length > 0 ? (
              <div>
                <div className="responses-header">Responses</div>
                {comment.childComments.map((childComment, index) => (
                  <h4 className="response" key={index + childComment}>
                    {childComment}
                  </h4>
                ))}
                {' '}
              </div>
            ) : null}
            <button
              className="response-button"
              onClick={handleRespondClicked.bind(
                this,
                i + comment.currentComment,
              )}
            >
              Respond
            </button>
            {respondId === i + comment.currentComment ? (
              <div>
                <textarea
                  className="response-textbox"
                  placeholder="Respond Here."
                  cols="50"
                  onChange={handleChange}
                />
                <button className="submit-comment-button" onClick={handleRespondSubmit}>
                  Submit
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedItem;
