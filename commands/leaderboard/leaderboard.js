const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');

module.exports = class LeaderboardCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'leaderboard',
            group: 'leaderboard',
            memberName: 'leaderboard',
            description: 'Display the current leaderboard',
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            examples: ['leaderboard'],
        });
    }

    run(msg) {
        const leaderboardChannel = msg.guild.channels.find(channel => channel.name === 'leaderboard');

        const leaderboard = sql.prepare("SELECT * FROM leaderboard ORDER BY sr DESC;").all();
        var embed = new RichEmbed()
            .setTitle("Leaderboard")
            .setDescription("OWPD Leaderboard")
            .setColor(0x00AE86);
        var i = 1;
        var tempBody = "";
        var characterCount = 0;

        for (const data of leaderboard) {
            var nextLine = `#${i}. ${data.flag} **${data.battletag}** [${data.sr}] (${data.nickname})` + '\n';
            characterCount += nextLine.length;
            if (tempBody.length + nextLine.length>= 1000) {
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
            embed.setDescription("The leaderboard is empty! Add some battletags with `ow!add`");
        } else {
            embed.addField(" ឵឵ ឵឵", tempBody);
        }
        i = 0;
        if (leaderboardChannel) {
            leaderboardChannel.bulkDelete(5).then(messages => console.log(`Bulk deleted ${messages.size} messages`)).catch(console.error);
            return leaderboardChannel.send({ embed });
        }
    }
}