const {Command} = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');
var emoji = require('emoji.json')

module.exports = class SetFlagCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setflag',
            group: 'leaderboard',
            memberName: 'setflag',
            description: 'Sets a country flag for a user',
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            examples: ['add flag'],
            args: [
                {
                    key: 'flag',
                    prompt: 'What flag do you want to set to the user',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, {flag}) {
        const battletagsUser = sql.prepare(`SELECT COUNT(*) FROM leaderboard WHERE user = ${msg.author.id};`).all();
        const updateFlag = sql.prepare(`UPDATE leaderboard SET flag = ? WHERE user = ${msg.author.id};`);
        console.log(flag)
        const testFlag = RegExp(`:flag_\w{2}:`);
        if (testFlag.test(flag)) {
            return msg.say(`Invalid flag!`);
        } else {
            if (battletagsUser[0]['COUNT(*)'] == 0) {
                return sendErrorResponse(msg);
            } else {
                updateFlag.run(flag);
                return successResponse(msg);
            }
    
            function successResponse(msg) {
                const embed = new RichEmbed()
                    .setTitle("Sucess!")
                    .setDescription(`Successfully updated <@${msg.author.id}> with new flag ${flag}. :wave:`)
                    .setColor(0x00AE86);
                msg.channel.send({embed})
            }
    
            function sendErrorResponse(msg) {
                msg.channel.send({
                    embed: {
                        color: 12663868,
                        title: "An error occurred!",
                        description: `<@${msg.author.id}> has no battletags assigned to him!`
                    }
                })
            }
        }


       
    }
}