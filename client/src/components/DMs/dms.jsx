/* eslint-disable import/extensions */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
import React, { useState } from 'react';
import axios from 'axios';
import Messages from './messages.jsx';
import './dms.css';

const DMs = ({ user, setUser }) => {
  const [messages, setMessages] = useState();
  const [Users, setUsers] = useState();
  const [find, setfind] = useState();
  return (
    <div>
      { messages ? <Messages id={messages} messages={user.messages} user={user} setUser={setUser} />
        : (
          <div>
            <link href="https://fonts.googleapis.com/css2?family=Poppins&family=Work+Sans:wght@300&display=swap" rel="stylesheet" />
            <h1 id="header">Direct Messages</h1>
            <div id="dms-sub-header"> connect with another user!</div>
            <div>
              {
              Users ? (
                <div id="search-for-user-button">
                  <input
                    onChange={(e) => {
                      setfind(e.target.value);
                    }}
                    placeholder="search for a user"
                  />
                  <div>
                    {Users.map(({ name, id }) => {
                      if (user.id === id) {
                        return null;
                      }
                      if (find) {
                        return name.toLowerCase().includes(find.toLowerCase()) ? (
                          <h4
                            id="users1"
                            key={String(id)}
                            onClick={() => {
                              for (let i = 0; i < user.messages.length; i += 1) {
                                if (user.messages[i].id === String(id)) {
                                  return setMessages(String(id));
                                }
                              }
                              axios.put(`/startMessage/${id}/${name}`)
                                .then(() => {
                                  setMessages(String(id));
                                  axios.get('/user')
                                    .then((result) => setUser(result.data));
                                });
                            }}
                          >
                            {name}
                            ?
                          </h4>
                        ) : null;
                      }
                      return (
                        <div>
                          <h2 id="recents">Recents:</h2>
                          <h4
                            id="searched-users"
                            key={String(id)}
                            onClick={() => {
                              for (let i = 0; i < user.messages.length; i += 1) {
                                if (user.messages[i].id === String(id)) {
                                  return setMessages(String(id));
                                }
                              }
                              axios.put(`/startMessage/${id}/${name}`)
                                .then(() => {
                                  setMessages(String(id));
                                  axios.get('/user')
                                    .then((result) => setUser(result.data));
                                });
                            }}
                          >
                            {name}
                          </h4>
                        </div>
                      );
                    })}
                  </div>
                  <div />
                </div>
              )
                : (
                  <button
                    id="create-message-button"
                    onClick={() => {
                      axios.get('/users')
                        .then(({ data }) => {
                          setUsers(data);
                          axios.get('/user')
                            .then((result) => setUser(result.data));
                        })
                        .catch();
                    }}
                  >
                    create message
                  </button>
                )
            }
            </div>
            <div className="inbox">
              <h1>Inbox: </h1>
              {
              user.messages.map((({ id, name }) => (<h2 key={String(id)} onClick={() => setMessages(String(id))}>{name}</h2>)))
              }
            </div>
          </div>
        )}
    </div>
  );
};

export default DMs;
