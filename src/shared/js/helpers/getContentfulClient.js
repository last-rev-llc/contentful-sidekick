import { createClient } from 'contentful-management';
import getCMAToken from './getCMAToken';
import getContentfulVars from './getContentfulVars';

export default async ({ spaceId, env } = {}) => {
  const [SPACE_ID, ENV] = await getContentfulVars();
  const client = await createClient({
    accessToken: getCMAToken
  });
  const space = await client.getSpace(!!spaceId ? spaceId : SPACE_ID);

  const environment = await space.getEnvironment(!!env ? env : ENV);
  return { client, space, environment };
};
