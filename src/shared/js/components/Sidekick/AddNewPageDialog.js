import { Box, Button, Dialog, DialogContent, DialogTitle, TextField, Tabs, Tab, Typography } from '@mui/material';
import React, { useState } from 'react';
import _ from 'lodash';
import axios from 'axios';
import RSSFeedIcon from '@mui/icons-material/RssFeed';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';

// const API_HOST = 'https://63b7906fc3f9c25adaaeea51--last-rev-marketing-site-prod.netlify.app/api';
const API_HOST = 'http://localhost:3000/api'

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

const getBlogContentFromOpenAI = async (text, action, headings) => {
  try {
    const response = await axios.post(
      `${API_HOST}/openai/blog`,
      {
        text,
        textAction: action,
        headings
      }
    );
    

    const { data } = response;
    // console.log(data);
    return data.response;
  } catch (error) {
    console.error(error);
    return `ERROR: ${error}`;
  }
};


const getImageFromOpenAI = async (prompt) => {
  try {
    const response = await axios.post(
      `${API_HOST}/openai/images`,
      {
        prompt,
      }
    );
    

    const { data } = response;
    // console.log(data);
    return data.response;
  } catch (error) {
    console.error(error);
    return `ERROR: ${error}`;
  }
};

const createEntry = async (options) => {
  try {
    const response = await axios.post(
      `${API_HOST}/contentful/createEntry`,
      options
    );
    console.log(response);

    const { data } = response;
    return data.response;
  } catch (error) {
    console.error(error);
    return `ERROR: ${error}`;
  }
}

const createContentfulAsset = async (options) => {
  try {
    const response = await axios.post(
      `${API_HOST}/contentful/assets`,
      options
    );

    const { data } = response;
    return data;
  } catch (error) {
    console.error(error);
    return
  }
}

function createIDFromDate() {
  let d = new Date().toISOString();
  d = d.replace(/[^a-zA-Z0-9-_.]/g, "");
  return d.slice(0, 64);
}


const getBlogFieldData = async (prompt, options) => {
  // Get the Blog Headers
  const headers = await getBlogContentFromOpenAI(prompt, 'blogHeaders');

   // Get the Blog Markdown Content
  const markdown = await getBlogContentFromOpenAI(prompt, 'blogMarkdown', headers);

  const richtext = await richTextFromMarkdown(markdown);


  // Get the Blog Title
  const title = await getBlogContentFromOpenAI(markdown, 'blogTitle');

  // Create the Slug
  const slug = _.kebabCase(title).slice(0, 100);

  // Get the Blog Tags
  const tags = await getBlogContentFromOpenAI(markdown, 'blogTags');

  // Get the blog image
  const imageURLs = await getImageFromOpenAI(tags);

  console.log('IMAGE URL', imageURLs[0].url);

  // TEMP only getting first image now
  const assetID = `asset-${createIDFromDate()}`;
  const mediaEntryID = `media-entry-${createIDFromDate()}`;
  // const imageID = '2233126893';

  // Create the asset object
  const imageRef = await createContentfulAsset({
    id: assetID,
    fieldData: {
      fields: {
        title: {
          'en-US': assetID
        },
        file: {
          'en-US': {
            contentType: 'image/png',
            fileName: tags,
            upload: imageURLs[0].url
          }
        }
      }
    }
  });

  console.log('IMAGE REF', imageRef)

  // Create the Media Entry
  const newMediaEntry = await createEntry({
    id: mediaEntryID,
    contentType: 'media',
    fieldData: {
      fields: {
        internalTitle: {
          'en-US': mediaEntryID
        },
        asset: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: assetID
            }
          }
        }
      }
    }
  });

  console.log('NEW MEDIA ENTRY', newMediaEntry)

  // console.log('IMAGE URL', imageURLs[0].url);
  
  return {
    "fields": {
        "internalTitle": {
            "en-US": prompt
        },
        "body": {
            "en-US": richtext
        },
        "title": {
            "en-US": title
        },
        "slug": {
          "en-US": slug
        },
        "tags": {
          "en-US": tags.split(',')
        },
        "featuredMedia": {
          "en-US": [
            {
              "sys": {
                "type": "Link",
                "linkType": "Entry",
                "id": mediaEntryID
              }
            }
          ]
        }
    }
  }
}

const AddNewPageDialog = ({ open, handleClose }) => {
  const [value, setValue] = useState(0);
  const [textFieldValue, setTextFieldValue] = useState('');
  const [answerText, setAnswerText] = useState('');

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  

  const handleSubmit = async () => {
    const prompt = textFieldValue;

    const fieldData = await getBlogFieldData(prompt);
    console.log('FIELD DATA', fieldData);
    const entryID = createIDFromDate();
    const newBlog = await createEntry({
      id: entryID,
      contentType: 'pageBlog',
      fieldData
    });
    
    console.log(newBlog);

    location.replace(`https://last-rev-marketing-site-dev.netlify.app/live-preview?environment=master&id=${entryID}&locale="en-US"`);

    // setAnswerText(newBlog);
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
