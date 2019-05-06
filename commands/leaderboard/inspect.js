const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');

module.exports = class InspectCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'inspect',
            group: 'leaderboard',
            memberName: 'inspect',
            description: 'Displays all the battletags associated to a user',
            guildOnly: true,
            examples: ['inspect @User'],
            args: [
                {
                    key: 'member',
                    prompt: 'Which user do you want to set a flag?',
                    type: 'member',
                    default: 'myself'
                }
            ]
        });
    }

    run(msg, { member }) {
        if (member === 'myself') {
            member = msg.author;
        }
        const battletagsUser = sql.prepare(`SELECT * FROM leaderboard WHERE user = ${member.id};`).all();

        var embed = new RichEmbed()
            .addField("Inspecting :spy:", `**<@${member.id}>'s profile(s)**`)
            .setColor(0x00AE86);
        var i = 1;
        var tempBody = "";
        var characterCount = 0;

        for (const data of battletagsUser) {
            var nextLine = `#${i}. ${data.flag} **${data.battletag}** [${data.sr}] (${data.nickname})` + '\n';
            characterCount += nextLine.length;
            if (tempBody.length + nextLine.length >= 1000) {
                embed.addField(" ឵឵ ឵឵", tempBody)
                tempBody = "";
            } else {
                tempBody += nextLine;
            }
            if (characterCount > 5700) {
                msg.channel.send({ embed });
                characterCount = 0;
                embed = new RichEmbed()
                    .setColor(0x00AE86);
            }
            i++;
        }
        if (tempBody === "") {
            var embed = new RichEmbed()
                .setDescription("This user does not have any battletags added to the leaderboard. Add some with `ow!add`")
                .setColor(0xff0000);
        } else {
            embed.addField(" ឵឵ ឵឵", tempBody);
        }
        i = 0;
        return msg.channel.send({ embed });
    }
}