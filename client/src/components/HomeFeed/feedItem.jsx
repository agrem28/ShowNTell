/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import React, { useState } from 'react';
import axios from 'axios';
import './homefeed.css';
import { FaRegHeart, FaRegCommentDots } from 'react-icons/fa';

const FeedItem = ({ post, handleUserClick, user }) => {
  const [liked, setLiked] = useState(post.liked === undefined ? false : post.liked[user._id]);
  const [commentClicked, setCommentClicked] = useState(false);
  const [respondClicked, setRespondClicked] = useState(false);
  const [respondId, setRespondId] = useState('');
  const [likedCount, setLikedCount] = useState(post.likedCount);

  const [currentComment, setCurrentComment] = useState('');
  const [commentsList, setCommentsList] = useState(post.comments || []);
  const [responseList, setResponseList] = useState([]);

  const handleLiked = () => {
    console.log(commentsList);
    axios
      .post('/liked', { postId: post._id, liked })
      .then(() => {
        setLiked(!liked);
        axios.get(`/post/${post._id}`)
          .then(({ data }) => {
            setLikedCount(data.likedCount);
            setLiked(data.liked[user._id]);
          }).catch();
      }).catch((err) => console.log(err));
  };

  const handleCommentClicked = () => setCommentClicked(!commentClicked);
  const handleRespondClicked = (id) => {
    console.log(id);
    setRespondId(id);
    setRespondClicked(!respondClicked);
  };

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
    setRespondClicked(!respondClicked);
    setCurrentComment('');
    const parentComment = e.target.parentElement.parentElement.parentElement.id;

    axios
      .post('/addResponse', {
        response: { currentComment, childComments: [] }, parentComment, postId: post._id,
      })
      .then(({ data }) => {
        setCommentsList(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleChange = (event) => setCurrentComment(event.target.value);

  const createRespondTextArea = (comment, i) => {
    return (
      <div>
        {(respondId === i + comment.currentComment) && respondClicked ? (
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
    );
  };

  const createRespondButton = (comment, i) => {
    return (
      <button
        className="response-button"
        onClick={handleRespondClicked.bind(
          this,
          i + comment.currentComment,
        )}
      >
        Respond
      </button>
    );
  };

  const createResponseDiv = (response, i) => {
    return (
      <div>
        <h4 className="response" key={response + i} id={response._id}>
          {response.currentComment}
          {createRespondButton(response, i)}
          {createRespondTextArea(response, i)}
        </h4>
      </div>
    );
  };

  const createCommentDiv = (comment, i) => {
    return (
      <div>
        <div id={comment._id}>
          {comment.currentComment}
          {createRespondButton(comment, i)}
          {createRespondTextArea(comment, i)}
        </div>
        {comment.childComments.length > 0 ? <div className="responses-header">Responses</div> : null}
        {comment.childComments.map((response, index) => {
          return (
            <div>
              {createResponseDiv(response, index)}
            </div>
          );
        })}
      </div>
    );
  };

  const createCommentsSection = () => {
    return commentsList.map((comment, i) => {
      return (
        <div key={comment + i} id={i + comment.currentComment}>
          {createCommentDiv(comment, i)}
        </div>
      );
    });
  };

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
        {/* {commentsList.map((comment, i) => (
          <div
            key={i + comment.currentComment}
            id={i + comment.currentComment}
          >
            <p id={comment._id}>{comment.currentComment}</p>
            {comment.childComments.length > 0 ? (
              <div>
                <div className="responses-header">Responses</div>
                {comment.childComments.map((childComment, index) => (
                  <h4 className="response" key={index + childComment} id={childComment._id}>
                    {childComment.currentComment}
                    <div>
                      <button
                        className="response-button"
                        onClick={handleRespondClicked.bind(
                          this,
                          index + childComment.currentComment,
                        )}
                      >
                        Respond
                      </button>
                    </div>
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
            {(respondId === i + comment.currentComment) && respondClicked ? (
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
        ))} */}
        {createCommentsSection()}
      </div>
    </div>
  );
};

export default FeedItem;
