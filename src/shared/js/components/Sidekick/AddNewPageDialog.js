import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  LinearProgress,
  Snackbar
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import useContentful from '../../helpers/useContentful';
// import insertTemplateOnPage from '../../helpers/insertTemplateOnPage';

const Templates = ({ open, handleClose, index }) => {
  const { envId } = useContentful();
  // const { previewClient: client } = useContentful();
  // const [templates, setTemplates] = useState([]);

  // const [loading, setLoading] = React.useState(false);
  // // const [message, setMessage] = React.useState();
  // // const [pageId, setPageId] = useState('');
  // useEffect(() => {
  //   // TODO read this from a meta tag. This assumes on preview route
  //   // const pageParams = new URLSearchParams(window.location.search);
  //   // setPageId(pageParams.get('id'));

  //   async function fetchTemplates() {
  //     try {
  //       const response = await client.getEntries({
  //         content_type: 'template'
  //       });
  //       // console.log('templates', response.items);
  //       // setTemplates(response.items);

  //     } catch (err) {
  //       console.log('error', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchTemplates();
  // }, [client]);
  // const groupedTemplates = templates.reduce((acc, template) => {
  //   if (!template.fields.category) return acc;
  //   if (!acc[template.fields.category.toUpperCase()]) {
  //     acc[template.fields.category.toUpperCase()] = [];
  //   }
  //   acc[template.fields.category.toUpperCase()].push(template);
  //   return acc;
  // }, {});
  // const handleClick = (template) => async () => {
  //   try {
  //     setMessage();
  //     setLoading(true);
  //     await insertTemplateOnPage(pageId, template.sys.id, index);
  //     setTimeout(() => {
  //       window.postMessage({ type: 'REFRESH_CONTENT' }, '*');
  //     }, 500);

  //     handleClose();
  //     setMessage('Template inserted in ' + pageId);
  //   } catch (err) {
  //     console.log('InsertTemplateError', err);
  //     setMessage('Error' + err.message);
  //   }
  //   setLoading(false);
  // };

  // console.log('AddContentDialog', { index })
  return (
    <Dialog onClose={handleClose} open={open} maxWidth="lg">
      <DialogTitle sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        Add new page in environment {envId}
        <Button sx={{ minWidth: 'auto' }} onClick={handleClose}>
          X
        </Button>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ minWidth: 640, py: 2 }}>
          <TextField label="Slug" variant="outlined" fullWidth />
        </Box>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="filled" color="primary">
            Create
          </Button>
        </Box>
        {/* <Loading visible={loading} /> */}
      </DialogContent>
    </Dialog>
  );
};

// const Loading = ({ visible }) => (
//   <Box
//     sx={{
//       cursor: 'progress',
//       ...(visible
//         ? {
//             opacity: 1
//           }
//         : {
//             opacity: 0,
//             visibility: 'hidden'
//           }),
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       width: '100%',
//       height: '100%',
//       backgroundColor: 'rgba(255,255,255,0.1)'
//     }}>
//     <LinearProgress sx={{ width: '100%' }} />
//   </Box>
// );
export default Templates;
