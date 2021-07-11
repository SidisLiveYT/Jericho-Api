const { MessageEmbed } = require('discord.js');
const UrlChecker = require('valid-url');

class EmbedStructure {
  /**
    * Class to Give a Defination to Raw Embed at ../distributions/embedgen.js
    * @property {Object.<any>} Structure Raw Embed Structure
    */

  constructor(Structure, Default) {
    /**
     * @property {Structure} Structure Raw Message Embed Structure
     * @param {Object.<string>} Author Embed Author
     * @param {Object.<string>} Title Embed Title
     * @param {string} Description Embed Description
     * @param {string} Image Image Url for Embed Publishing
     * @param {string} Thumbnail Thumbnail Image for Embed
     * @param {string} Footer Embed Footer
     * @param {boolean} Timestamp Embed Creation Timestamp
     * @param {array[Object.<string>]} Fields Embed Fields in <array> | Inline feature if
     * @param {string} Color Embed Color <Hex-Code>
     */

    /**
     * @property {Object.<any>} Default Embed Generator Default Values for new Embed Gen Class
     * @param {Object.<any>} Object Values from Class <Options>.Default
     */

    this.Author = Structure && Structure.Author && Structure.Author.Text && typeof Structure.Author.Text === 'string' ? Structure.Author.Text : Default.Author.Text;
    this.Author_Url = Structure && Structure.Author && Structure.Author && Structure.Author.Url && typeof Structure.Author.Url === 'string' ? Structure.Author.Url : Default.Author.Url;
    this.Author_Image = Structure && Structure.Author && Structure.Author.Image && typeof Structure.Author.Image === 'string' ? Structure.Author.Image : Default.Author.Image;
    this.Title = Structure && Structure.Title && Structure.Title.Text && typeof Structure.Title.Text === 'string' ? Structure.Title.Text : Default.Title.Text;
    this.Title_Url = Structure && Structure.Title && Structure.Title.Url && typeof Structure.Title.Url === 'string' ? Structure.Title.Url : Default.Title.Url;
    this.Description = Structure && Structure.Description && typeof Structure.Description === 'string' ? Structure.Description : Default.Description;
    this.Image = Structure && Structure.Image && typeof Structure.Image === 'string' ? Structure.Image : Default.Image;
    this.Thumbnail = Structure && Structure.Thumbnail && typeof Structure.Thumbnail === 'string' ? Structure.Thumbnail : Default.Thumbnail;
    this.Footer = Structure && Structure.Footer && Structure.Footer.Text && typeof Structure.Footer.Text === 'string' ? Structure.Footer.Text : Default.Footer.Text;
    this.Footer_Image = Structure && Structure.Footer.Url && typeof Structure.Footer.Url === 'string' ? Structure.Footer.Url : Default.Footer.Url;
    this.timestamp = Structure && Structure.Timestamp && typeof Structure.Timestamp === 'boolean' ? Structure.Timestamp : Default.Timestamp;
    this.Fields = Structure && Structure.Fields ? Structure.Fields : Default.Fields;
    this.Color = Structure && Structure.Color && typeof Structure.Color === 'string' ? Structure.Color : Default.Color;
  }

  ErrorEmbed() {
    const Fieldsarray = [];
    let Field = { name: null, value: null, inline: false };

    if (this.Author_Image && !UrlChecker.isUri(this.Author_Image)) throw TypeError('Invalid Url is Detected on <Variable>.Author.Image');
    if (this.Author_Url && !UrlChecker.isUri(this.Author_Url)) throw TypeError('Invalid Url is Detected on <Variable>.Author.Url');
    if (this.Thumbnail && !UrlChecker.isUri(this.Thumbnail)) throw TypeError('Invalid Url is Detected on <Variable>.Thumbnail');
    if (this.Footer_Image && !UrlChecker.isUri(this.Footer_Image)) throw TypeError('Invalid Url is Detected on <Variable>.Footer.Url');

    const Emboid = new MessageEmbed()
      .setAuthor({ name: this.Author, iconURL: this.Author_Image, url: this.Author_Url })
      .setTitle({ title: this.Title })
      .setUrl({ url: this.Title_Url })
      .setDescription({ description: this.Description })
      .setFooter({ text: this.Footer ? this.Footer : 'Error has been Detected!', iconURL: this.Footer_Image })
      .setColor({ color: this.Color ? this.Color : 'ff0000' })
      .setTimestamp();

    if (this.Image) Emboid.setImage({ url: this.Image });
    if (this.Thumbnail) Emboid.setThumbnail({ url: this.Thumbnail });
    if (this.Fields && this.Fields.length >= 1) {
      this.Fields.forEach((field) => {
        Field = {
          name: typeof field.name === 'string' ? field.name : '** **',
          value: typeof field.value === 'string' ? field.value : '** **',
          inline: typeof field.inline === 'boolean' ? field.inline : false,
        };
        Fieldsarray.push(Field);
      });
      Emboid.addFields(Fieldsarray);
    }
    return { Embed: Emboid, Json: Emboid.toJSON };
  }

  ShowValueEmbed() {
    const Fieldsarray = [];
    let Field = { name: null, value: null, inline: false };

    if (this.Author_Image && !UrlChecker.isUri(this.Author_Image)) throw TypeError('Invalid Url is Detected on <Variable>.Author.Image');
    if (this.Author_Url && !UrlChecker.isUri(this.Author_Url)) throw TypeError('Invalid Url is Detected on <Variable>.Author.Url');
    if (this.Thumbnail && !UrlChecker.isUri(this.Thumbnail)) throw TypeError('Invalid Url is Detected on <Variable>.Thumbnail');
    if (this.Footer_Image && !UrlChecker.isUri(this.Footer_Image)) throw TypeError('Invalid Url is Detected on <Variable>.Footer.Url');

    const Emboid = new MessageEmbed()
      .setAuthor({ name: this.Author, iconURL: this.Author_Image, url: this.Author_Url })
      .setTitle({ title: this.Title })
      .setUrl({ url: this.Title_Url })
      .setDescription({ description: this.Description })
      .setFooter({ text: this.Footer ? this.Footer : 'Showing Valuable Data!', iconURL: this.Footer_Image })
      .setColor({ color: this.Color ? this.Color : '00FF00' })
      .setTimestamp();

    if (this.Image) Emboid.setImage({ url: this.Image });
    if (this.Thumbnail) Emboid.setThumbnail({ url: this.Thumbnail });
    if (this.Fields && this.Fields.length >= 1) {
      this.Fields.forEach((field) => {
        Field = {
          name: typeof field.name === 'string' ? field.name : '** **',
          value: typeof field.value === 'string' ? field.value : '** **',
          inline: typeof field.inline === 'boolean' ? field.inline : false,
        };
        Fieldsarray.push(Field);
      });
      Emboid.addFields(Fieldsarray);
    }
    return { Embed: Emboid, Json: Emboid.toJSON };
  }

  ReturnValueEmbed() {
    const Fieldsarray = [];
    let Field = { name: null, value: null, inline: false };

    if (this.Author_Image && !UrlChecker.isUri(this.Author_Image)) throw TypeError('Invalid Url is Detected on <Variable>.Author.Image');
    if (this.Author_Url && !UrlChecker.isUri(this.Author_Url)) throw TypeError('Invalid Url is Detected on <Variable>.Author.Url');
    if (this.Thumbnail && !UrlChecker.isUri(this.Thumbnail)) throw TypeError('Invalid Url is Detected on <Variable>.Thumbnail');
    if (this.Footer_Image && !UrlChecker.isUri(this.Footer_Image)) throw TypeError('Invalid Url is Detected on <Variable>.Footer.Url');

    const Emboid = new MessageEmbed()
      .setAuthor({ name: this.Author, iconURL: this.Author_Image, url: this.Author_Url })
      .setTitle({ title: this.Title })
      .setUrl({ url: this.Title_Url })
      .setDescription({ description: this.Description })
      .setFooter({ text: this.Footer ? this.Footer : 'Data has been Retrieved!', iconURL: this.Footer_Image })
      .setColor({ color: this.Color ? this.Color : '00FF00' })
      .setTimestamp();

    if (this.Image) Emboid.setImage({ url: this.Image });
    if (this.Thumbnail) Emboid.setThumbnail({ url: this.Thumbnail });
    if (this.Fields && this.Fields.length >= 1) {
      this.Fields.forEach((field) => {
        Field = {
          name: typeof field.name === 'string' ? field.name : '** **',
          value: typeof field.value === 'string' ? field.value : '** **',
          inline: typeof field.inline === 'boolean' ? field.inline : false,
        };
        Fieldsarray.push(Field);
      });
    }
    return { Embed: Emboid, Json: Emboid.toJSON };
  }

  CustomValueEmbed() {
    const Fieldsarray = [];
    let Field = { name: null, value: null, inline: false };

    if (this.Author_Image && !UrlChecker.isUri(this.Author_Image)) throw TypeError('Invalid Url is Detected on <Variable>.Author.Image');
    if (this.Author_Url && !UrlChecker.isUri(this.Author_Url)) throw TypeError('Invalid Url is Detected on <Variable>.Author.Url');
    if (this.Thumbnail && !UrlChecker.isUri(this.Thumbnail)) throw TypeError('Invalid Url is Detected on <Variable>.Thumbnail');
    if (this.Footer_Image && !UrlChecker.isUri(this.Footer_Image)) throw TypeError('Invalid Url is Detected on <Variable>.Footer.Url');

    const Emboid = new MessageEmbed()
      .setAuthor({ name: this.Author, iconURL: this.Author_Image, url: this.Author_Url })
      .setTitle({ title: this.Title })
      .setUrl({ url: this.Title_Url })
      .setDescription({ description: this.Description })
      .setFooter({ text: this.Footer ? this.Footer : 'Data has been Retrieved!', iconURL: this.Footer_Image })
      .setColor({ color: this.Color ? this.Color : '00FF00' })
      .setTimestamp();

    if (this.Image) Emboid.setImage({ url: this.Image });
    if (this.Thumbnail) Emboid.setThumbnail({ url: this.Thumbnail });
    if (this.Fields && this.Fields.length >= 1) {
      this.Fields.forEach((field) => {
        Field = {
          name: typeof field.name === 'string' ? field.name : '** **',
          value: typeof field.value === 'string' ? field.value : '** **',
          inline: typeof field.inline === 'boolean' ? field.inline : false,
        };
        Fieldsarray.push(Field);
      });
      Emboid.addFields(Fieldsarray);
    }
    return { Embed: Emboid, Json: Emboid.toJSON };
  }
}
module.exports = EmbedStructure;
