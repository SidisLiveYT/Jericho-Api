const { WebhookClient } = require('discord.js');

module.exports = {
  WebhookFunction(client, Embed, EmbedOptions) {
    try {
      if (!EmbedOptions.ID || !EmbedOptions.Token) throw TypeError('Invalid Discord Webhook ID or Token!');
      const Webhook = new WebhookClient(EmbedOptions.ID, EmbedOptions.Token);
      Webhook.send({ embeds: [Embed] });
      return true;
    } catch (error) { return error; }
  },
  setOptions(options) {
    /**
          * @property {function} SetOptions Make the Options filtered with acceptable values
          * @param {Object} options Package Options for Embed Gen
          * @returns {Object} options for this.options
          */

    const Option = {
      type: EmbedTypes.includes(`${options.type.toLowerCase().trim()}`) ? options.type.toLowerCase().trim() : 'null',
      Webhook: !!options.Webhook,
      Compilation: typeof options.Compilation === 'boolean' ? options.Compilation : false,
      WebhookID: options.Webhook ? options.Webhook.ID : null,
      WebhookToken: options.Webhook ? options.Webhook.Token : null,
    };
    return Option;
  }
};
