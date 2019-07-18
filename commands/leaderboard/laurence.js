const { Command } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'laurence',
            group: 'leaderboard',
            memberName: 'laurence',
            description: 'Posts a random Laurence picture',
            guildOnly: true,
            examples: ['laurence'],
        });
    }

    run(msg) {
        const files = fs.readdirSync(path.join(__dirname, 'images'));
        return msg.channel.send({
            files: [{
                attachment: 'commands/leaderboard/images/' + files[Math.floor(Math.random() * files.length)],
                name: files[Math.floor(Math.random() * files.length)]
            }]
        });
    }
}
