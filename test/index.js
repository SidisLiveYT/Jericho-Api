const { EmbedGenerator } = require('../src/index');
const { Client, MessageEmbed } = require('discord.js'); // Disord.Client(); for Applicattion and Supports discord.js v13 and can be installed by "npm i discord.js@dev"
const client = new Client();

// Currently it Supports discord.js Library | But Soon it will be Released for Raw Discord API

client.EmbedGen = new EmbedGenerator(client);

client.on(`MessageCreate`, message => {

    //Compilation and Webhook It should be 'false' boolean for discord.js v12 | As Package is discord.js v13 Compatible so minor exceptions should be made in discord.js v12

    var options = {
        type: `show`,  //Can be [ show, return, error ]
        Webhook: false, // Can be Webhook = { ID: `WebhookID` , Token: `WebhookToken` }
        Compilation: false, //Can be true to Send Embed to the Message's Channel or 'Channel ID' in Commpilation: <boolean || string> Value
        Default: null  // Custom Options after the "client.EmbedGen = new EmbedGenerator(client,options);" for Specific Instance | Destroyed after the Work Done
    };

    var Raw_Embed = {
        Title: {
            text: `Title Should be here`,  // And Url also if
        },
        Author: {
            text: `Author Name here` // Image and Url also if
        },
        Description: `Description less than 2200`, // Or Else Discord API Error will be Thrown if it exceeds 2200 on 'Discription.length'
        TimeStamp: true,
        Footer: {
            text: `Footer Text here` // and Image also if
        },
        Fields: [{
            text: `Field name here`,
            value: `Field value here`,  //will be an Array to Give or else null will be Triggered
            inline: true
        }],
    }
    /**
     * @Important Image and Thumbnail can also be given by Image : `Image link` and Thumbnail: `Image Link`
     * @Note - Raw_Embed Style can be Given to "<Options>.Default" , So that You don't have to Give Same Values
     * @Note - Discord API Error , then Checck weather the Discord.Client has access to the Channel
     */

    var Embed = new MessageEmbed();  // MessageEmbed() is required for healthy practice but not neccessary
    Embed = client.EmbedGen.create(message, Raw_Embed, options); // options.Compilation will be not work so Embed Value will be Returned
    message.channe.send({ embeds: [Embed] }).catch(console.log); // Differ in discord.js v12 
    return void null;
});

client.login(`Application's Token should be Placed here`)
