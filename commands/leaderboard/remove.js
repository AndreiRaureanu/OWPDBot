const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');

module.exports = class RemoveCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'remove',
            group: 'leaderboard',
            memberName: 'remove',
            description: 'Remove a battletag from the database',
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            examples: ['remove battletag'],
            args: [
                {
                    key: 'battletag',
                    prompt: 'What battletag do you want to remove?',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, { battletag }) {
        // need to return something btw
        const removeBattletag = sql.prepare(`DELETE FROM leaderboard WHERE battletag = '${battletag}';`);
        const getBattletag = sql.prepare(`SELECT * FROM leaderboard WHERE battletag = '${battletag}';`).get();
        if(getBattletag) {
            removeBattletag.run();
            successResponse(msg, battletag);
        } else {
            errorResponse(msg, battletag);
        }

        function successResponse(msg, btag) {
            const embed = new RichEmbed()
                .setTitle("Sucess!")
                .setDescription(`Successfully removed *${btag}* from the leaderboard. :wave:`)
                .setColor(0x00AE86);
            msg.channel.send({embed})
        }
        
        function errorResponse(msg, btag) {
            const embed = new RichEmbed()
                .setTitle("An error occurred!")
                .setDescription(`There is no battletag *${btag}* in the leaderboard!`)
                .setColor(0xff0000);
            msg.channel.send({embed})
        }
    }
}