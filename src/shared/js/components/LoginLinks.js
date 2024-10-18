import { Box } from '@mui/material';
import React from 'react';

export default function LoginLinks({ user, handleLogin, handleLogout, loadedAuth }) {
  return (
    <Box component="div" sx={{ opacity: loadedAuth ? 1 : 0, transition: '.3s' }}>
      {!user ? (
        <div>
          <p>Connect content management</p>
          <button type="submit" className="oauth-button" onClick={handleLogin}>
            Sign In
          </button>
        </div>
      ) : (
        <div>
          <p>User {user} Connected</p>
          <button type="submit" className="oauth-button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      )}
    </Box>
  );
}
