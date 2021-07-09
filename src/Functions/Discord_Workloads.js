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
};
