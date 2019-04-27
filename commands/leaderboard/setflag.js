const {Command} = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');

module.exports = class SetFlagCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setflag',
            group: 'leaderboard',
            memberName: 'setflag',
            description: 'Sets a country flag for a user',
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            examples: ['add @User flag'],
            args: [
                {
                    key: 'member',
                    prompt: 'Which user do you want to set a flag?',
                    type: 'member'
                },
                {
                    key: 'flag',
                    prompt: 'What flag do you want to set to the user',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, {member, flag}) {
        // need to return something btw
        
    }
}