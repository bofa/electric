import React from 'react';
import './index.css';
// import App from './App';
import TopBar from './TopBar';
import { createRoot } from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import 'chart.js/auto';
import 'chartjs-adapter-luxon';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
// import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
// import "@blueprintjs/datetime2/lib/css/blueprint-datetime2.css";
// import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
// import "@blueprintjs/table/lib/css/table.css";

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<TopBar />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
