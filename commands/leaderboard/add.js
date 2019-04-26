const {Command} = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./scores.sqlite');

module.exports = class AddCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'add',
            group: 'leaderboard',
            memberName: 'add',
            description: 'Add a user to the leaderboards',
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            examples: ['add @User battletag'],
            args: [
                {
                    key: 'member',
                    prompt: 'Which user do you want to add?',
                    type: 'member'
                },
                {
                    key: 'battletag',
                    prompt: 'What is the battletag of the user',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, {member, battletag}) {
        // need to return something btw
        
    }
}