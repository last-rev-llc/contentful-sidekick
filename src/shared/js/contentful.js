const contentful = require('contentful-management');

const getSpaces = (accessToken) => {
  return new Promise((resolve, reject) => {
    const client = contentful.createClient({
      accessToken,
    });

    client.getSpaces()
      .then((spaces) => {
        resolve(spaces);
      });
  });
};

const getEntry = (accessToken, spaceId, contentId) => {
  return new Promise((resolve, reject) => {
    const client = contentful.createClient({
      accessToken,
    });
    client.getSpace(spaceId)
      .then(space => space.getEnvironment('master'))
      .then(environment => environment.getEntry(contentId))
      .then((entry) => {
        resolve(entry);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getContentType = (accessToken, spaceId, contentTypeId) => {
  return new Promise((resolve, reject) => {
    const client = contentful.createClient({
      accessToken,
    });
    client.getSpace(spaceId)
      .then(space => space.getEnvironment('master'))
      .then(environment => environment.getContentType(contentTypeId))
      .then((contentType) => {
        resolve(contentType);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports = {
  getSpaces,
  getEntry,
  getContentType,
};
