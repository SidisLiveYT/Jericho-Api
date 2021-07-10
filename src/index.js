const { EmbedGen } = require('./Distributions/embedgen');
const { JokeGenerator } = require('./Distributions/JokesGen');
const { MemesGenerator } = require('./Distributions/MemesGen');

module.exports = {
  EmbedGenerator: EmbedGen,
  Jokes: JokeGenerator,
  Memes: MemesGenerator,
};
