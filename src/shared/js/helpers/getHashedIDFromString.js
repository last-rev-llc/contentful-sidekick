const MurmurHash3 = require('imurmurhash');

export default (string) => {
  return MurmurHash3(string).result().toString();
};