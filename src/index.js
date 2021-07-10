const { EmbedGen } = require('./distributions/embedgen');
const { JokeGenerator } = require('./distributions/JokesGen');
const { MemesGenerator } = require('./distributions/MemesGen');

module.exports = {
  EmbedGenerator: EmbedGen,
  Jokes: JokeGenerator,
  Memes: MemesGenerator,
};
