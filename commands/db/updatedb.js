const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const request = require('request');
const sql = SQLite('./leaderboard.sqlite');

module.exports = class UpdateDBCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'updatedb',
            group: 'db',
            memberName: 'updatedb',
            description: 'Update db',
            guildOnly: true,
            examples: ['updatedb']
        });
    }

    run(msg) {
        if(msg.author.id === '265926378690576384') {
            sql.prepare("ALTER TABLE leaderboard ADD btagID INT DEFAULT 0;").run();
        } else {
            return msg.say('Invalid permissions');
        }
    }
}
