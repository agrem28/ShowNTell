import React, { useState } from 'react';
import axios from 'axios';
import './sub.css';

const Sub = ({ user, setView }) => {
  const [subs, setSubs] = useState([]);
  const [gotSubs, setGotSubs] = useState(false);

  const getSubs = () => {
    if (!gotSubs) {
      const promises = user.subscriptions.map((showId) => axios.get(`/show/${showId}`).catch());
      Promise.all(promises)
        .then((results) => results.map((show) => show.data))
        .then((shows) => {
          setSubs(shows);
          setGotSubs(true);
        })
        .catch();
    }
  };

  return (
    <div>
      <h1 id="header">Subscriptions</h1>
      {getSubs()}
      {subs.map((sub, i) => (
        <div
          key={sub + i}
          data-id={sub.id}
          onClick={(e) => setView(e.target.dataset.id)}
        >
          {sub.name}
        </div>
      ))}
    </div>
  );
};

export default Sub;
