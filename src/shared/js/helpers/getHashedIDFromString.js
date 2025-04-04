const MurmurHash3 = require('imurmurhash');

export const getHashedIDFromString = str => MurmurHash3(str).result().toString();
