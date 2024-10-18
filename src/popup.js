import 'jquery/dist/jquery.min';
import './assets/css/popup.css';
import { createRoot } from 'react-dom/client';
import React from 'react';
import Popup from './components/Popup';

const root = createRoot(document.getElementById('popup'));
root.render(<Popup />);
