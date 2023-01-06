import { Box, Button, Dialog, DialogContent, DialogTitle, TextField, Tabs, Tab, Typography } from '@mui/material';
import React, { useState } from 'react';
import axios from 'axios';
import RSSFeedIcon from '@mui/icons-material/RssFeed';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

const getPrompt = (
  topic
) => `Create a blog post in a json format that will be used on a website based on the topic below.

Response should be in json format:
- "title" 
- "body" in Contentful Rich Text format
- "tags" 
- "quote"
Topic:${topic}`;

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index) => {
  return {
    'id': `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
};

const getBlogPost = async (prompt, options) => {
  try {
    const response = await axios.post(
      'https://63b7906fc3f9c25adaaeea51--last-rev-marketing-site-prod.netlify.app/api/ai',
      {
        prompt,
        ...options
      }
    );
    console.log(response);

    const { data } = response;
    return data.response;
  } catch (error) {
    console.error(error);
    return `ERROR: ${error}`;
  }
};

const updateBlogPostTitleField = async (id, title) => {
  try {
    const config = {
      headers: { Authorization: `Bearer thisisthesuperrandomsecret` }
    };
    const response = await axios.post(
      'https://63b7906fc3f9c25adaaeea51--last-rev-marketing-site-prod.netlify.app/api/management',
      {
        prompt,
        ...options
      },
      config
    );
    console.log(response);

    const { data } = response;
    return data.response;
  } catch (error) {
    console.error(error);
    return `ERROR: ${error}`;
  }
};
thisisthesuperrandomsecret;
const AddNewPageDialog = ({ open, handleClose }) => {
  const [value, setValue] = useState(0);
  const [textFieldValue, setTextFieldValue] = useState('');
  const [answerText, setAnswerText] = useState('');

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  const handleSubmit = async () => {
    const prompt = getPrompt(textFieldValue);

    const answer = await getBlogPost(prompt, {
      model: 'text-davinci-003',
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    console.log({ answer });

    setAnswerText(answer);
  };

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="lg">
      <DialogTitle sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        Add new page
        <Button sx={{ minWidth: 'auto' }} onClick={handleClose}>
          X
        </Button>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ minWidth: 640, py: 2 }}>
          What type of page would you like to add?
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab icon={<NoteAddIcon />} label="Basic" {...a11yProps(0)} />
              <Tab icon={<RSSFeedIcon />} label="Blog Post" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <Box sx={{ py: 2 }}>
            <TabPanel value={value} index={0}>
              <TextField
                rows={10}
                multiline
                label="What is your new basic page about?"
                placeholder="Write a few sentences about the page."
                variant="outlined"
                fullWidth
                value={textFieldValue}
                onChange={(event) => setTextFieldValue(event.target.value)}
              />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <TextField
                rows={10}
                multiline
                label="What is your new blog post about?"
                placeholder="Write a few sentences or bullet points about the topic and main focus of your blog post"
                variant="outlined"
                fullWidth
                value={textFieldValue}
                onChange={(event) => setTextFieldValue(event.target.value)}
              />
            </TabPanel>
          </Box>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="filled" color="primary" onClick={handleSubmit}>
              Create New Page
            </Button>
          </Box>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <TextField rows={10} value={answerText} multiline label="Results" variant="outlined" fullWidth />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewPageDialog;
