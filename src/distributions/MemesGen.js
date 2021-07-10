const NodeFetch = require('node-fetch');
const { ShuffleArray } = require('../Functions/Shuffle_Workload');

class MemesGenerator {
  /**
     * @constructor MemesGen MemesGenerator for a Node.js Application || Discord Bot
     * @param {Object<string>} Options Amount of Memes to be fetched from API
     */

  constructor(Options) {
    /**
         * @param {number} Amount Meme's Amount to Produce for the Request
         * @param {boolean} Shuffle Increase Randomize Meme's Allocation || To Ease Developer's Work
         */

    this.amount = Options && Options.amount && typeof Options.amount === 'number' ? Options.amount : 5; // 5 Memes Array is Default to be Set
    this.shuffe = !!(Options && Options.shuffle && typeof Options.shuffle === 'boolean');
  }

  create(Options) {
    /**
         * @property {method} Create Class's property to Create Memes by Options if any
         * @param {Object.<string>} Options Meme's Generator Custom Options if any!
         */

    let ShuffledArray = null;

    let Option = { amount: Options && Options.amount && typeof Options.amount === 'number' ? Options.amount : this.amount };
    Option = { shuffle: Options && Options.shuffle && typeof Options.shuffle === 'boolean' ? true : this.shuffle };

    if (!Number.isNaN(Option.amount)) throw SyntaxError('Amount should be in Number Type');
    else {
      return NodeFetch('https://api.imgflip.com/get_memes').then((response) => response.json()).then((JsonResponse) => {
        const Array = JsonResponse.data.memes;
        if (Number(Option.amount) > 500) throw TypeError('Amount value should be > 0 and < 500');
        else if (Option.shuffle) { ShuffledArray = ShuffleArray(Array); return ShuffledArray.slice(0, Number(Option.amount)); } else return Array.slice(0, Number(Option.amount));
      }).catch((error) => error);
    }
  }
}

module.exports = { MemesGenerator };
