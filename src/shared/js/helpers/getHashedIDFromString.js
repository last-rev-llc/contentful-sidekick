const MurmurHash3 = require('imurmurhash');

export default string => MurmurHash3(string).result().toString();
