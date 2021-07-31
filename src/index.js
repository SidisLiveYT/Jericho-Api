const { EmbedGen } = require('./distributions/embedgen');
const { JokeGenerator } = require('./distributions/JokesGen');
const { MemesGenerator } = require('./distributions/MemesGen');
const { Shortner } = require('./distributions/ShortnerLinks');
const { CryptoSector } = require('./distributions/CryptoCurrency');
const { Doggie } = require('./distributions/Doggie');


module.exports = {
  EmbedGenerator: EmbedGen,
  Jokes: JokeGenerator,
  Memes: MemesGenerator,
  ShortLink: Shortner,
  Crypto: CryptoSector,
  Dogs: Doggie,
};
