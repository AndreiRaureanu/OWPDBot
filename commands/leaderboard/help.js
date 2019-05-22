const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'leaderboard',
            memberName: 'help',
            description: 'Displays all the commands of the bot',
            guildOnly: true,
            examples: ['help'],
        });
    }

    run(msg) {
        const embed = new RichEmbed()
            .setTitle("Ranky McRankface's Command List")
            .addField("ow!add", "Add a user to the leaderboard.\nUsage: `ow!add SlimShadyIAm#9999`")
            .addField("ow!inspect", "Displays all the battletags associated to a user.\nUsage: `ow!inspect @SlimShadyIAm#9999`")
            // .addField("ow!remove", "Remove a battletag from the database. ***Requires MANAGE MESSAGES permission.***\nUsage: `ow!remove SlimShadyIAm#9999`")
            .addField("ow!setflag", "Sets a country flag for your profile.\nUsage: `ow!setflag :flag_us:`")
            // .addField("ow!setnick", "Sets a nickname for your profile.\nUsage: `ow!setnick SlimShady!`")
            .setFooter("Created with ❤️ by SlimShadyIAm#9999 and ElDonte#0002 :)")
            .setColor(0xFA9C1D);
        return msg.channel.send({ embed });
    }

}