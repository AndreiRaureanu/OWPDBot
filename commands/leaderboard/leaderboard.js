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
        const leaderboard = sql.prepare("SELECT * FROM leaderboard ORDER BY sr DESC;").all();
        const embed = new RichEmbed()
            .setTitle("Leaderboard")
            .setDescription("OWPD Leaderboard")
            .setColor(0x00AE86);
        var i = 1;
        leaderboard.iterate
        for (const data of leaderboard) {
            embed.addField(`${i}  ${data.user}`, `${data.battletag}, ${data.sr}, ${data.nickname}`);
            i++;
        }
        i = 0;
        return msg.channel.send({ embed });
    }
}