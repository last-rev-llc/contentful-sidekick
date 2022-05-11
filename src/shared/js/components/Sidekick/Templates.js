import React, { useEffect, useState } from 'react';
import getContentfulClient from '../../helpers/getContentfulEnvironment';
import insertTemplateOnPage from '../../helpers/insertTemplateOnPage';

const getTemplates = async () => {
  const client = await getContentfulClient();
  const templates = await client.getEntries({
    content_type: 'template'
  });
  return templates;
};

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [pageId, setPageId] = useState('');

  useEffect(() => {
    // TODO read this from a meta tag. This assumes on preview route
    const pageParams = new URLSearchParams(window.location.search); 
    setPageId(pageParams.get('id'));


    async function fetchTemplates() {
      const response = await getTemplates();
      setTemplates(response.items);
    }
    fetchTemplates();
  }, []);
  return (
    <div className="csk-templates">
      {templates.map((tmp) => {
        return <button key={tmp.sys.id} type="button" onClick={() => insertTemplateOnPage(pageId, tmp.sys.id)}>{tmp.fields.templateName['en-US']}</button>;
      })}
    </div>
  );
};

export default Templates;