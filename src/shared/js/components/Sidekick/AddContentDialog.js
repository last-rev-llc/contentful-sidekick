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
  LinearProgress,
  Snackbar
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useContentfulContext } from '../../helpers/ContentfulContext';

const Templates = ({ open, handleClose, index }) => {
  const { insertTemplateIntoPage, envId, previewClient } = useContentfulContext();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [pageId, setPageId] = useState('');

  useEffect(() => {
    // TODO read this from a meta tag. This assumes on preview route
    const pageParams = new URLSearchParams(window.location.search);
    setPageId(pageParams.get('id'));

    async function fetchTemplates() {
      if (!previewClient) return;
      try {
        const response = await previewClient.getEntries({
          content_type: 'template'
        });
        // console.log('templates', response.items);
        setTemplates(response.items);
      } catch (err) {
        console.log('error', err);
      }
    }
    fetchTemplates();
  }, [previewClient]);
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!template.fields.category) return acc;
    if (!acc[template.fields.category.toUpperCase()]) {
      acc[template.fields.category.toUpperCase()] = [];
    }
    acc[template.fields.category.toUpperCase()].push(template);
    return acc;
  }, {});
  const handleClick = (template) => async () => {
    try {
      setMessage();
      setLoading(true);
      await insertTemplateIntoPage(pageId, template.sys.id, index);

      handleClose();
      setMessage(`Template inserted in ${pageId}`);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  // console.log('AddContentDialog', { index })
  return previewClient ? (
    <Dialog onClose={handleClose} open={open} maxWidth="lg">
      <DialogTitle sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        Add new content in environment {envId}
        <Button sx={{ minWidth: 'auto' }} onClick={handleClose}>
          X
        </Button>
      </DialogTitle>
      <DialogContent>
        {Object.entries(groupedTemplates).map(([category, groupTemplates]) => (
          <div key={category}>
            <Snackbar
              open={!!message}
              autoHideDuration={6000}
              // onClose={handleClose}
              message={message}
              // action={action}
            />

            <Typography variant="h6">{category}</Typography>
            <br />
            <Box display="grid" gridTemplateColumns={`repeat(${Math.min(templates.length, 2)}, 1fr)`} gap={2}>
              {groupTemplates.map((tmp) => {
                return (
                  <Card
                    key={tmp.sys.id}
                    elevation={0}
                    onClick={handleClick(tmp)}
                    sx={{
                      'cursor': 'pointer',
                      'width': '100%',
                      'transition': '.2s',
                      '&:hover': { boxShadow: 5 }
                    }}>
                    <CardMedia
                      component="img"
                      height="200"
                      width="1440"
                      sx={{ objectFit: 'contain', objectPosition: 'center' }}
                      image={tmp.fields.image ? tmp.fields.image.fields.file.url : ''}
                    />
                    <CardContent>
                      <Typography variant="body2">{tmp.fields.templateName.replace('TEMPLATE - ', '')}</Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
            <br />
            <br />
          </div>
        ))}
        <Loading visible={loading} />
      </DialogContent>
    </Dialog>
  ) : null;
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
export default Templates;
