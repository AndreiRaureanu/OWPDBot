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
        const battletagsUser = sql.prepare(`SELECT * FROM leaderboard WHERE user = ${msg.author.id};`).all();
        const updateNickname = sql.prepare(`UPDATE leaderboard SET nickname = ? WHERE battletag = ?;`);
        if(!battletagsUser) {
            return sendErrorResponse(msg, `No battletags exist for user <@${msg.author.id}>`)
        }

        for (const data of battletagsUser) {
            updateNickname.run(nickname, data.battletag);
        }
        return successResponse(msg, "Succesfull!");

        function sendErrorResponse(msg, text) {
            msg.channel.send({
                embed: {
                    color: 12663868,
                    title: "An error occured!",
                    description: text
                }
            })
        }

        function successResponse(msg, btag) {
            const embed = new RichEmbed()
                .setTitle("Sucess!")
                .setDescription(`Successfully updated <@${msg.author.id}> with new nickname ${nickname}. :wave:`)
                .setColor(0x00AE86);
            msg.channel.send({embed})
        }
    }
}