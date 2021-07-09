const { WebhookClient } = require('discord.js');

module.exports = {
  WebhookFunction(client, Embed, Embed_Options) {
    try {
      if (!Embed_Options.ID || !Embed_Options.Token) throw TypeError('Invalid Discord Webhook ID or Token!');
      const Webhook = new WebhookClient(Embed_Options.ID, Embed_Options.Token);
      Webhook.send({ embeds: [Embed] });
      return true;
    } catch (error) { return error; }
  },
};
