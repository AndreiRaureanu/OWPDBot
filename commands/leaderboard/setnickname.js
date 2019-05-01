const {Command} = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');

module.exports = class SetNicknameCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setnickname',
            group: 'leaderboard',
            memberName: 'setnickname',
            description: 'Sets a nickname for a user',
            guildOnly: true,
            examples: ['setnickname nickname'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'What is the nickname you want to set?',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, {nickname}) {
        const battletagsUser = sql.prepare(`SELECT COUNT(*) FROM leaderboard WHERE user = ${msg.author.id};`).all();
        const updateNickname = sql.prepare(`UPDATE leaderboard SET nickname = ? WHERE user = ${msg.author.id};`);
    console.log(battletagsUser)
            if (battletagsUser[0]['COUNT(*)'] == 0) {
                return sendErrorResponse(msg);
            } else {
                updateNickname.run(nickname);
                return successResponse(msg);
            }
        

        function sendErrorResponse(msg, text) {
            msg.channel.send({
                embed: {
                    color: 12663868,
                    title: "An error occured!",
                    description: text
                }
            })
        }

        function successResponse(msg) {
            const embed = new RichEmbed()
                .setTitle("Sucess!")
                .setDescription(`Successfully updated <@${msg.author.id}> with new nickname ${nickname}. :wave:`)
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