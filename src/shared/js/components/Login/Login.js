import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useContentfulContext } from '../../helpers/ContentfulContext';

const HeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2)
}));

const Header = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

const Title = styled('h1')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '2rem',
  fontWeight: 'bold'
}));

function Login() {
  const { handleLogin } = useContentfulContext();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 3,
        p: 2,
        bgcolor: 'background.paper'
      }}>
      <HeaderContainer>
        <Header>
          <Title>Contentful</Title>
        </Header>
      </HeaderContainer>
      <Typography variant="h6" component="h1" textAlign="center">
        Sign in to Contentful to use Sidekick
      </Typography>
      <Button
        variant="contained"
        onClick={handleLogin}
        sx={{
          'bgcolor': '#0B2ED9',
          '&:hover': {
            bgcolor: '#0A2BC7'
          }
        }}>
        Sign in with Contentful
      </Button>
    </Box>
  );
}

export default Login;
