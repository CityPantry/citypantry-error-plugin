import * as React from 'preact';
import { Popup } from './popup';

React.render(
  <Popup></Popup>,
document.getElementById('react') as Element
);
const loader = document.getElementById('initial-loader') as Element;
(loader.parentElement as Element).removeChild(loader);
