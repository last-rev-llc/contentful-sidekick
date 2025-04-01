import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import React from 'react';
import Popup from './components/Popup';

const container = document.getElementById('popup');
const root = createRoot(container);
root.render(<Popup />);
