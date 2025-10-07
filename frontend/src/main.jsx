import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import the router
import { Auth0Provider } from '@auth0/auth0-react';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* THIS BrowserRouter component is the fix */}
    <BrowserRouter>
      <Auth0Provider
        domain="dev-5z1uhgrjd2nen5mw.us.auth0.com"
        clientId="886zJlf7XANlXhdxbbDff3Am5leDpeEf"
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
      >
        <App />
      </Auth0Provider>
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>
);