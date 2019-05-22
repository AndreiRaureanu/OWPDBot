const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const request = require('request');
const sql = SQLite('./leaderboard.sqlite');

module.exports = class UpdateDBCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'showdb',
            group: 'db',
            memberName: 'show db',
            description: 'Show db',
            guildOnly: true,
            examples: ['showdb']
        });
    }

    run(msg) {
        if (msg.author.id === '265926378690576384') {
            const table = sql.prepare('SELECT * FROM leaderboard;').all();
            
        } else {
            return msg.say('Invalid permissions');
        }
    }
}
