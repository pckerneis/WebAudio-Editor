import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import GraphComponent from './components/Graph/GraphComponent';
import CommandPaletteComponent from './components/CommandPalette/CommandPaletteComponent';

ReactDOM.render(
  <React.StrictMode>
    <GraphComponent />
    <CommandPaletteComponent />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
