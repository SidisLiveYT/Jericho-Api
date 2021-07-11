const NodeFetch = require('node-fetch');

/**
  * @property {Class} JokeGenClass Joke Generator Class for Configuration Caches
  * @param {Object.<string>} Options Joke Gen Options and Building Initially
  */

class JokeGenerator {
  /**
    * @constructor Class Constructor defining the Options to Respective smaller Options
    * @param {Object.<any>} Options Jokes Gen Default Options
    */

  constructor(Options) {
    /**
      * @property {Object} Options Jokes Gen options
      * @param {boolean} nsfw Nsfw should be enabled if
      * @param {boolean} explicit Explicit Content should be delivered if
      * @param {boolean} religious Religious Content can be Delivered if
      * @param {boolean} racist Racist Jokes can be delivered if
      * @param {boolean} sexist Sexist Jokes can be Delivered if
      * @param {boolean} political Political Jokes from any Country but Related
      * @param {number} Amount Amount of Jokes should be Delivered if any
      * @param {string} Search Related Word from Jokes DB if any
      */

    this.nsfw = Options.category.nsfw && typeof Options.category.nsfw === 'boolean' ? 'nsfw' : null;
    this.explicit = Options.category.explicit && typeof Options.category.explicit === 'boolean' ? 'explicit' : null;
    this.religious = Options.category.religious && typeof Options.category.religious === 'boolean' ? 'religious' : null;
    this.racist = Options.category.racist && typeof Options.category.racist === 'boolean' ? 'racist' : null;
    this.sexist = Options.category.sexist && typeof Options.category.sexist === 'boolean' ? 'sexist' : null;
    this.political = Options.category.political && typeof Options.category.political === 'boolean' ? 'political' : null;
    this.amount = Options.category.amount && typeof Options.category.amount === 'number' ? `${Options.category.amount}` : 1;
    this.search = Options.category.search && typeof Options.category.search === 'string' ? `${Options.category.search}` : '';
  }

  create(Options) {
    /**
      * @property {Object} Options Jokes Gen Custom options
      * @param {boolean} nsfw Nsfw should be enabled if
      * @param {boolean} explicit Explicit Content should be delivered if
      * @param {boolean} religious Religious Content can be Delivered if
      * @param {boolean} racist Racist Jokes can be delivered if
      * @param {boolean} sexist Sexist Jokes can be Delivered if
      * @param {boolean} political Political Jokes from any Country but Related
      * @param {number} Amount Amount of Jokes should be Delivered if any
      * @param {string} Search Related Word from Jokes DB if any
      */

    let Url = 'https://v2.jokeapi.dev/joke/Any';
    const Categories = [];

    if (Options) {
      if (Options.category) {
        Categories.push(Options.category.nsfw && typeof Options.category.nsfw === 'boolean' ? 'nsfw' : this.nsfw);
        Categories.push(Options.category.explicit && typeof Options.category.explicit === 'boolean' ? 'explicit' : this.explicit);
        Categories.push(Options.category.religious && typeof Options.category.religious === 'boolean' ? 'religious' : this.religious);
        Categories.push(Options.category.racist && typeof Options.category.racist === 'boolean' ? 'racist' : this.racist);
        Categories.push(Options.category.sexist && typeof Options.category.sexist === 'boolean' ? 'sexist' : this.sexist);
        Categories.push(Options.category.political && typeof Options.category.political === 'boolean' ? 'political' : this.political);
      }
      if (`${Categories.join('').trim()}` !== '') Url += `?blacklistFlags=${Categories.join(',').slice(0, Categories.length - 2)}`;

      Url += Options.search && typeof Options.search === 'string' ? `?contains=${Options.search}` : this.search;
      Url += Options.amount && typeof Options.amount === 'number' && Number(Options.amount) <= 10 && Number(Options.amount) >= 1 ? `&amount=${Options.amount}` : this.amount;
    } else {
      Categories.push(this.nsfw);
      Categories.push(this.explicit);
      Categories.push(this.religious);
      Categories.push(this.racist);
      Categories.push(this.sexist);
      Categories.push(this.political);
      if (`${Categories.join('').trim()}` !== '') Url += `?blacklistFlags=${Categories.join(',').slice(0, Categories.length - 2)}`;

      Url += this.search && typeof this.search === 'string' ? `?contains=${this.search}` : '';
      Url += this.amount && typeof this.amount === 'number' && Number(this.amount) <= 10 && Number(this.amount) >= 1 ? `&amount=${this.amount}` : '';
    }

    // 2 Requests/per Second or else IP will be blocked || Can be fixed by hosting on diffrent IP

    return NodeFetch(`${Url}`).then((response) => response.json()).then((JsonResponse) => JsonResponse).catch((error) => error);
  }
}
module.exports = { JokeGenerator };
