const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');

module.exports = class SetNicknameCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setnick',
            group: 'leaderboard',
            memberName: 'setnick',
            description: 'Sets a nickname for a user',
            guildOnly: true,
            examples: ['setnick nickname'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'What is the nickname you want to set?',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, { nickname }) {
        const sanitizeText = RegExp('^[a-zA-Z0-9_]*$');
        if (!sanitizeText.test(nickname)) {
            return msg.say('Invalid nickname, please specify another name');
        }

        const battletagsUser = sql.prepare(`SELECT COUNT(*) FROM leaderboard WHERE user = ${msg.author.id};`).all();
        const updateNickname = sql.prepare(`UPDATE leaderboard SET nickname = ? WHERE user = ${msg.author.id};`);
        if (battletagsUser[0]['COUNT(*)'] == 0) {
            return sendErrorResponse(msg);
        } else {
            updateNickname.run(nickname);
            return successResponse(msg);
        }

        function successResponse(msg) {
            const embed = new RichEmbed()
                .setTitle("Sucess!")
                .setDescription(`Successfully updated <@${msg.author.id}> with new nickname ${nickname}. :wave:`)
                .setColor(0x00AE86);
            msg.channel.send({ embed })
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