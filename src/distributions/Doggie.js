const NodeFetch = require('node-fetch');

/**
 * @property {function} Doggie Function to Fetch Random Doggie Images based on breed if any
 * @param {*} Option Custom Options for Doggie Function
 * @returns {Object} Images of Doggies
 */

function Doggie(Option) {
  /**
     * @property {Object} Option Custom Options for Doggie Functions
     * @param {number} Amount Amount of Doggy pictures to Send
     * @param {string} Breed Dog's Breed for Search
     * @param {string} SubBreed Sub-Breed of the Dog for Search
     */

  const Settings = {
    Amount: Option && Option.Amount && typeof Option.Amount === 'number' ? Option.Amount : null,
    Breed: Option && Option.Breed && typeof Option.Breed === 'string' ? Option.Breed : false,
    SubBreed: Option && Option.SubBreed && typeof Option.SubBreed === 'string' ? Option.SubBreed : false,
  };

  let Url = 'https://dog.ceo/api/breed/';

  if (Settings.Breed) Url += `${Settings.Breed}/`;
  if (Settings.SubBreed) Url += `${Settings.SubBreed}/`;
  Url += 'images/random/';
  if (Settings.Amount) Url += `${Settings.Amount}/`;

  return NodeFetch(Url).then((response) => response.json()).then((JsonResponse) => JsonResponse.message).catch((error) => error);
}

module.exports = { Doggie };
