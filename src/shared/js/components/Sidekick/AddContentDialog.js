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
  Snackbar,
  TextField,
  InputLabel
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useContentfulContext } from '../../helpers/ContentfulContext';

function Templates({ open, handleClose: onClose, index, onTemplatesAvailable }) {
  const { insertTemplateIntoPage, envId, previewClient } = useContentfulContext();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [pageId, setPageId] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [ready, setReady] = useState(false);
  const [templatesAvailable, setTemplatesAvailable] = useState(false);

  useEffect(() => {
    const metaPageIdEl = document.querySelector('meta[name="pageId"]');
    let metaPageId = metaPageIdEl ? metaPageIdEl.content : null;
    if (!metaPageId) {
      const pageParams = new URLSearchParams(window.location.search);
      metaPageId = pageParams.get('id');
    }

    setPageId(metaPageId);

    async function fetchTemplates() {
      if (!previewClient) return;
      try {
        const response = await previewClient.getEntries({
          content_type: 'template'
        });
        const hasTemplates = response.items && response.items.length > 0;
        setTemplatesAvailable(hasTemplates);
        onTemplatesAvailable(hasTemplates);
        setTemplates(response.items);
      } catch (err) {
        console.log('error', err);
        setTemplatesAvailable(false);
        onTemplatesAvailable(false);
      }
    }
    fetchTemplates();
  }, [previewClient, onTemplatesAvailable]);

  useEffect(() => {
    if (uniqueId) {
      setReady(true);
    }
  }, [uniqueId]);

  useEffect(() => {
    if (!open) {
      // reset state on close
      setUniqueId('');
      setReady(false);
    }
  }, [open]);

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!template.fields.category) return acc;
    if (!acc[template.fields.category.toUpperCase()]) {
      acc[template.fields.category.toUpperCase()] = [];
    }
    acc[template.fields.category.toUpperCase()].push(template);
    return acc;
  }, {});

  const handleClick = template => async () => {
    setReady(true);
    if (uniqueId) {
      try {
        setMessage();
        setLoading(true);
        await insertTemplateIntoPage(pageId, template.sys.id, index, uniqueId);

        onClose();
        setMessage(`Template inserted in ${pageId}`);
      } catch (err) {
        setMessage(`Error: ${err.message}`);
      }
      setLoading(false);
    }
  };

  const updateUniqueId = e => {
    setUniqueId(e.currentTarget.value);
  };

  return previewClient && templatesAvailable ? (
    <Dialog onClose={onClose} open={open} maxWidth="lg" sx={{ zIndex: 999999999999 }}>
      <DialogTitle sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        Add new content in environment {envId}
        <Button sx={{ minWidth: 'auto' }} onClick={onClose}>
          X
        </Button>
      </DialogTitle>
      <DialogContent sx={{ position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            margin: '0 -8px',
            padding: '0px 8px',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingBottom: 16
          }}>
          <InputLabel htmlFor="templateUniqueId">Enter template info</InputLabel>

          <TextField
            required
            error={ready && !uniqueId}
            id="templateUniqueId"
            label="Prefix"
            fullWidth
            helperText={
              ready && !uniqueId
                ? 'Please enter prefix to create content.'
                : 'This will be used to prefix the title of each new content.'
            }
            onChange={updateUniqueId}
          />
          <InputLabel>Select your template</InputLabel>
        </div>
        {Object.entries(groupedTemplates).map(([category, groupTemplates]) => (
          <Box key={category} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Snackbar
              open={!!message}
              autoHideDuration={6000}
              // onClose={handleClose}
              message={message}
              // action={action}
            />

            <Typography variant="body">{category}</Typography>

            <Box
              display="grid"
              gridTemplateColumns={`repeat(${Math.min(templates.length, 2)}, 1fr)`}
              gap={2}>
              {groupTemplates.map(tmp => (
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
                    <Typography variant="body2">
                      {tmp.fields.templateName.replace('TEMPLATE - ', '')}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            <br />
            <br />
          </Box>
        ))}
        <Loading visible={loading} />
      </DialogContent>
    </Dialog>
  ) : null;
}

function Loading({ visible }) {
  return (
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
}
export default Templates;
