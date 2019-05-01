const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const request = require('request');
const sql = SQLite('./leaderboard.sqlite');

module.exports = class AddCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'add',
            group: 'leaderboard',
            memberName: 'add',
            description: 'Add a user to the leaderboards',
            guildOnly: true,
            examples: ['add battletag flag nickname'],
            args: [
            {
                key: 'battletag',
                prompt: 'What is the battletag of the user',
                type: 'string'
            },
            {
                key: 'flag',
                prompt: 'What is your country flag',
                type: 'string',
                default: ':map:'
            },
            {
                key: 'nickname',
                prompt: 'What is your nickname',
                type: 'string',
                default: ''
            }
            ]
        });
    }

    run(msg, { battletag, flag, nickname }) {
        msg.channel.startTyping();

        //prepared statements 
        const setLeaderboard = sql.prepare("INSERT OR REPLACE INTO leaderboard (id, user, battletag, sr, flag, nickname) VALUES (@id, @user, @battletag, @sr, @flag, @nickname);");
        const setLeaderboardMultiple = sql.prepare("INSERT OR REPLACE INTO leaderboard (id, user, battletag, sr, flag, nickname, privateCounter) VALUES (@id, @user, @battletag, @sr, @flag, @nickname, @privateCounter);");
        const getLeaderboard = sql.prepare("SELECT * FROM leaderboard WHERE battletag = ?")

        //first check if its valid battletag format through regex
        const test4Characters = RegExp('/.*#[0-9]{4}');
        const test5Characters = RegExp('/.*#[0-9]{5}');
        if (test4Characters.test(battletag) || test5Characters.test(battletag)) {
            return msg.say(`Invalid battletag, please adhere to the format: Example#12345`);
        }

        //prepare the request from the API for the sr
        var reqBattletag = battletag.replace(/#/g, "-");
        var options = {
            url: `https://owapi.slim.ovh/stats/pc/eu/${reqBattletag}`,
            headers: {
                'User-Agent': 'OWPDrequest'
            }
        };

        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
          }

        //parse the response
        function callback(error, response, body) { 
            if (error.code == 'ENOTFOUND') {
                msg.channel.stopTyping();
                return sendErrorResponse(msg, "Looks like the API is down. Please try again later.")
            } else {
                body = JSON.parse(body);
                if (body.message == "Player not found") {
                    msg.channel.stopTyping();
                    return sendErrorResponse(msg, "No profile found with specified Battletag!");
                } else if (body.private) {
                    msg.channel.stopTyping();
                    return sendErrorResponse(msg, "Private profile, please make your career profile public, wait a few minutes and try again.");
                } else if (body.rating == 0) {
                    msg.channel.stopTyping();
                    return sendErrorResponse(msg, "Your account is unplaced. Please finish your placements and then try again.");
                } else {
                    var leaderboard = getLeaderboard.get(battletag);
                    if (!leaderboard) {
                        leaderboard = {
                            id: getRandomInt(Number.MAX_SAFE_INTEGER),
                            user: msg.author.id,
                            battletag: battletag,
                            sr: 0,
                            flag: flag,
                            nickname: nickname,
                            privateCounter: 0
                        }
                        leaderboard.sr = body.rating;
                        setLeaderboardMultiple.run(leaderboard);
                        // need to return something btw
                        msg.channel.stopTyping();
                        return sendSuccessResponse(msg, leaderboard);
                    } else {
                        msg.channel.stopTyping();
                        return sendErrorResponse(msg, "Battletag already added to the leaderboard.");
                    }
                }
            }
        }
        request(options, callback);

        function sendErrorResponse(msg, text) {
            msg.channel.send({
                embed: {
                    color: 12663868,
                    title: "An error occured!",
                    description: text
                }
            })
        }

        function sendSuccessResponse(msg, leaderboard) {
            msg.channel.send({
                embed: {
                    color: 4159791,
                    title: `Successfully added ${leaderboard.battletag} to the leaderboard`,
                    fields: [
                        {
                            "name": "Battletag",
                            "value": leaderboard.battletag,
                            "inline": true
                        },
                        {
                            "name": "User",
                            "value": `<@${leaderboard.user}>`,
                            "inline": true
                        },
                        {
                            "name": "SR",
                            "value": leaderboard.sr,
                            "inline": true
                        },
                        {
                            "name": "Region",
                            "value": leaderboard.flag,
                            "inline": true
                        }
                    ]
                }
            })
        }
    }
}