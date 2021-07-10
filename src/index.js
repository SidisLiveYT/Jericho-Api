const { EmbedGen } = require('./distributions/embedgen');
const { JokeGen } = require('./distributions/JokesGen');

module.exports = {
  EmbedGenerator: EmbedGen,
  Jokes: JokeGen,
};
