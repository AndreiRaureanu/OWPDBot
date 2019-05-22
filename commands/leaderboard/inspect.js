const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');

module.exports = class InspectCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'inspect',
            group: 'leaderboard',
            memberName: 'inspect',
            description: 'Displays all the battletags associated to a user',
            guildOnly: true,
            examples: ['inspect @User'],
            args: [
                {
                    key: 'member',
                    prompt: 'Which user do you want to set a flag?',
                    type: 'member',
                    default: 'myself'
                }
            ]
        });const scraper = require('./utils');
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');

module.exports = class SetNicknameCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'testing',
            group: 'leaderboard',
            memberName: 'testing',
            description: 'Testing command',
            guildOnly: true,
            examples: ['testing battletag'],
            args: [
                {
                    key: 'battletag',
                    prompt: 'What is the battletag you want to test?',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, { battletag }) {

        var reqBattletag = battletag.replace(/#/g, "-");
        var options = {
            url: `https://owapi.slim.ovh/stats/pc/eu/${reqBattletag}`,
            headers: {
                'User-Agent': 'OWPDRequest'
            }
        };
        options.url = encodeURI(options.url);
        function callback(error, response, body) {
            if (error) {
                if (error.code == 'ENOTFOUND') {
                    msg.channel.stopTyping();
                    return sendErrorResponse(msg, "Looks like the API is down. Please try again later.")
                }
            } else {
                body = JSON.parse(body);
                if (body.message == "Player not found") {
                    return sendErrorResponse(msg, "No profile found with specified Battletag!");
                } else if (body.private) {
                    return sendErrorResponse(msg, "Private profile, please make your career profile public, wait a few minutes and try again.");
                } else if (body.rating == 0) {
                    return sendErrorResponse(msg, "Your account is unplaced. Please finish your placements and then try again.");
                }
            }
        }
        request(options, callback);

        //return scraper.getBtagID(battletag);
    }
}
    }

    run(msg, { member }) {
        if (member === 'myself') {
            member = msg.author;
        }
        const battletagsUser = sql.prepare(`SELECT * FROM leaderboard WHERE user = ${member.id};`).all();

        var embed = new RichEmbed()
            .addField("Inspecting :spy:", `**<@${member.id}>'s profile(s)**`)
            .setColor(0x00AE86);
        var i = 1;
        var tempBody = "";
        var characterCount = 0;

        for (const data of battletagsUser) {
            var nextLine = `#${i}. ${data.flag} **${data.battletag}** [${data.sr}] (${data.nickname})` + '\n';
            characterCount += nextLine.length;
            if (tempBody.length + nextLine.length >= 1000) {
                embed.addField(" ឵឵ ឵឵", tempBody)
                tempBody = "";
            } else {
                tempBody += nextLine;
            }
            if (characterCount > 5700) {
                msg.channel.send({ embed });
                characterCount = 0;
                embed = new RichEmbed()
                    .setColor(0x00AE86);
            }
            i++;
        }
        if (tempBody === "") {
            var embed = new RichEmbed()
                .setDescription("This user does not have any battletags added to the leaderboard. Add some with `ow!add`")
                .setColor(0xff0000);
        } else {
            embed.addField(" ឵឵ ឵឵", tempBody);
        }
        i = 0;
        return msg.channel.send({ embed });
    }
}