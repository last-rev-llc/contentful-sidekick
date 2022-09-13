import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
  LinearProgress,
  Snackbar,
  styled
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import getContentfulPreviewClient from '../../helpers/getContentfulPreviewClient';
import useAuth from '../../helpers/useAuth';
import insertTemplateOnPage from '../../helpers/insertTemplateOnPage';

const PageInfoDialog = ({ open, handleClose, index }) => {
  const [templates, setTemplates] = useState([]);

  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState();
  const Contentful = useAuth();
  const [pageId, setPageId] = useState('');
  useEffect(() => {
    // TODO read this from a meta tag. This assumes on preview route
    const pageParams = new URLSearchParams(window.location.search);
    setPageId(pageParams.get('id'));
  }, []);

  // console.log('AddContentDialog', { index })
  return (
    <Dialog onClose={handleClose} open={open} maxWidth="lg">
      <DialogTitle sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        Page details
        <Button sx={{ minWidth: 'auto' }} onClick={handleClose}>
          X
        </Button>
      </DialogTitle>
      <DialogContent>
        <Loading visible={loading} />
        <Grid container alignItems="center" justifyContent="space-between" sx={{ paddingBottom: 8 }}>
          <Typography variant="overline">Uptime</Typography>
          <Button variant="text">View full report</Button>
        </Grid>
        <Uptime
          src={
            'https://images.ctfassets.net/abjv67t9l34s/6OSJDWlV7WjdP1odIuMCBJ/7cb7f90e8587c751524f910b89a1d125/Screen_Shot_2022-06-06_at_9.32.26_AM.png?h=250'
          }
        />
        <br />
        <Grid container alignItems="center" justifyContent="space-between" sx={{ paddingBottom: 8 }}>
          <Typography variant="overline">Page score</Typography>
          <Button variant="text">View full report</Button>
        </Grid>
        <Score
          src={
            'https://images.ctfassets.net/abjv67t9l34s/5KBXtFqNFj0PSGfn8w5iKr/5e63844122dff08a861dd5db364e7863/Screen_Shot_2022-06-06_at_9.13.25_AM.png?h=250'
          }
        />
      </DialogContent>
    </Dialog>
  );
};

const Loading = ({ visible }) => (
  <Box
    sx={{
      cursor: 'progress',
      ...(visible
        ? {
            opacity: 1
          }
        : {
            opacity: 0,
            visibility: 'hidden'
          }),
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255,255,255,0.1)'
    }}>
    <LinearProgress sx={{ width: '100%' }} />
  </Box>
);
const Score = styled('img')`
  //height: 250px;
  width: 100%;
`;
const Uptime = styled('img')`
  //height: 250px;
  width: 100%;
`;
export default PageInfoDialog;
