import { createClient } from 'contentful-management';
import getCMAToken from "./getCMAToken";
import getContentfulVars from './getContentfulVars';

export default async () => {
  const [SPACE_ID, ENV] = await getContentfulVars();
  const client = await createClient({
    accessToken: getCMAToken,
  });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENV);
  return environment;
};