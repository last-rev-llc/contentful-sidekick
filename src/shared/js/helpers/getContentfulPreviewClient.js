import { createClient } from 'contentful';
import getPreviewToken from './getPreviewToken';
import getContentfulVars from './getContentfulVars';

export default async ({ spaceId, env } = {}) => {
  const [SPACE_ID, ENV] = await getContentfulVars();
  const contentPreviewToken = await getPreviewToken();
  console.log('contentPreviewToken', contentPreviewToken);
  const previewClient = createClient({
    accessToken: contentPreviewToken,
    space: spaceId || SPACE_ID,
    environment: env || ENV,
    host: 'preview.contentful.com',
    resolveLinks: true
  });

  return previewClient;
};
