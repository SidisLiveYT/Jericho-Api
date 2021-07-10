const EmbedStructure = require('../classes/Embed_Structure');
const { WebhookFunction, setOptions } = require('../Functions/Discord_Workloads');

const EmbedTypes = ['error', 'return', 'show', 'null'];

class EmbedGen {

  /**
      * Class meant for Distinguish Clients in Discord.Client
      * @template {Object.<string>} T
      */

  /**
   * @constructor 
   * @param {string} client new Disord.Client
   * @param {Object.<any>} options Embed Function Options <Webhook-Integration || Message Options>
   * @return {class} Returns a new Embed Gen Class
   */

  constructor(client, options) {
    if (!client) throw new SyntaxError('Invalid Discord\'s Client | Take from Disord.Client');
    this.client = client;
    this.options = setOptions(options);
  }

  /**
     * @param {Object.<any>} message Message for Data Class
     * @param {Object.<any>} RawEmbed Raw values for Embed generator
     * @param {Object.<any>} options Embed Function Custom Options
     * @return {Promise} Promise for if the Embed Gen was a Success or not
     */

  async create(message, RawEmbed, Options) {
    /**
         * @property {Structure} Options Message Embed Gen <Discord.Client> Options
         * @param {string} type Embed Type Resolve
         * @param {boolean} Webhook Webhook Integration <Boolean>
         * @param {boolean} Compilation Embed to Send by Package <Boolean>
         * @param {Object.<any>} Default Default Values for Embed if any
         */

    const EmbedConfig = new EmbedStructure(RawEmbed, this.options.Default);
    let Embed = null;
    let EmbedOptions = this.options;
    if (Options) {
      EmbedOptions = {
        type: (EmbedTypes.includes(`${Options.type.toLowerCase().trim()}`) ? Options.type.toLowerCase().trim() : 'null'),
        Webhook: Options.Webhook ? Options.Webhook : !!this.options.Webhook,
        Compilation: typeof Options.Compilation === 'boolean' ? Options.Compilation : this.options.Compilation,
        WebhookID: Options.Webhook ? Options.Webhook.ID : this.options.Webhook.ID,
        WebhookToken: Options.Webhook.Token ? Options.Webhook.Token : this.options.Webhook.Token,
      };
    }

    /**
         * @param {string} Types Embed Type | Differ in Embed Execution Type
         * Class Execution from Embed_Structure and with Respective Method of Selected Embed Type
         */

    if (EmbedOptions.type.toLowerCase().trim() === 'error') Embed = EmbedConfig.ErrorEmbed();
    else if (EmbedOptions.type.toLowerCase().trim() === 'show') Embed = EmbedConfig.ShowValueEmbed();
    else if (EmbedOptions.type.toLowerCase().trim() === 'return') Embed = EmbedConfig.ReturnValueEmbed();
    else Embed = EmbedConfig.CustomValueEmbed();

    /**
         * @property {boolean} Compilation Package will execute the Embed in the way
         * @property {Object.<string>} Webhook Package will execute the Embed in a Discord Webhook
         * @return {Promise || Object} Depends on the Type Requested Package will Return
         */

    if (!EmbedOptions.Compilation && !EmbedOptions.Webhook) return Embed;
    if (EmbedOptions.Webhook) return WebhookFunction(this.client, Embed, EmbedOptions);
    if (typeof EmbedOptions.Compilation === 'boolean' && EmbedOptions.Compilation) return message.channel.send({ embeds: [Embed] }).then(() => true).catch((error) => error);
    if (!Number.isNaN(EmbedOptions.Compilation)) return this.client.channels.fetch(`${EmbedOptions.Compilation}`).then((channel) => { channel.send({ embeds: [Embed] }).then(() => true).catch((error) => error); }).catch((error) => error);
    throw SyntaxError('Invalid Options for Compilation or Webhook');
  }
}
module.exports = { EmbedGen };
