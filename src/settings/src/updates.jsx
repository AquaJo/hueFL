// EDIT updates.jsx INSTEAD OF updates.js AND TRANSPILE IT VIA BABEL! (don't using babels standalone cdn bc I don't want a need to transpile in productions using babel + unsafe inline ...)
// let updates = document.getElementById('updates'); // already declared ...
import React, { useState, useEffect } from 'react';
//import React from 'react';

//console.log(React.useState);
import ReactDOM from 'react-dom';
let updates = document.getElementById('updates');
const e = React.createElement;
//const { useState, useEffect } = React;
updates.addEventListener('click', async function () {
  let obj = await api.send('currentVersionInfo'); // version, owner, repo, releaseLink
  const reactDiv = document
    .getElementById('updatesContentMain')
    .querySelector('.vueLocal');
  const root = ReactDOM.createRoot(reactDiv);
  const version = obj.version;
  const owner = obj.owner;
  const repo = obj.repo;
  const releaseLink = obj.releaseLink;

  root.render(e(CurrentVersionStat({ version, releaseLink })));
  toggleAll(updates);
  toggleContents(updatesContent);
  if (!releaseLink) return;
  /* try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Fehler beim Abrufen der Releases:', error);
  } */
});
console.log(React);
console.log(ReactDOM);
function CurrentVersionStat(props) {
  //console.log(React.useState());
  const [count, setCount] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    // Beispiel für eine asynchrone Funktion innerhalb useEffect
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/releases`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('Fehler beim Abrufen der Releases:', error);
      }
    };

    fetchData(); // Rufe die asynchrone Funktion auf
  }, [props.releaseLink]); // Abhängigkeiten des useEffect

  const handleClick = (event) => {
    event.preventDefault();
    api.send('openLink', props.releaseLink);
  };

  if (loading) {
    return e('p', null, 'Loading...');
  }

  if (error) {
    return e('p', null, `Error: ${error.message}`);
  }
  return e(
    'div',
    null,
    e('p', { className: 'contentText' }, `Version: ${props.version}`),
    e(
      'p',
      { className: 'contentText', style: { marginTop: '-10px' } },
      'Release: ',
      props.releaseLink
        ? e(
            'a',
            { href: props.releaseLink, onClick: handleClick },
            'github/AquaJo/hueFL/v0.0.2'
          )
        : 'No release link found'
    )
  );
}
