const { Command } = require('discord.js-commando');
const SQLite = require("better-sqlite3");
const sql = SQLite('./leaderboard.sqlite');
const fetch = require('node-fetch');
const $ = require('cheerio');


module.exports = class AddCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'add',
            group: 'leaderboard',
            memberName: 'add',
            description: 'Add a user to the leaderboards',
            guildOnly: true,
            examples: ['add battletag'],
            args: [
                {
                    key: 'battletag',
                    prompt: 'What is the battletag of the user',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { battletag }) {

        msg.channel.startTyping();

        //prepared statements 
        const setLeaderboardMultiple = sql.prepare("INSERT OR REPLACE INTO leaderboard (id, user, battletag, sr, flag, nickname, privateCounter) VALUES (@id, @user, @battletag, @sr, @flag, @nickname, @privateCounter);");
        const getLeaderboard = sql.prepare("SELECT * FROM leaderboard WHERE battletag = ?")

        //first check if its valid battletag format through regex
        const test4Characters = RegExp('/.*#[0-9]{4}');
        const test5Characters = RegExp('/.*#[0-9]{5}');
        const test6Characters = RegExp('/.*#[0-9]{6}');

        if (test4Characters.test(battletag) || test5Characters.test(battletag) || test6Characters.test(battletag)) {
            return msg.say(`Invalid battletag, please adhere to the format: Example#12345`);
        }
        
        var reqBattletag = battletag.replace(/#/g, "-");
        var uri = `https://playoverwatch.com/en-us/career/pc/${reqBattletag}`;
        uri = encodeURI(uri);
        const response = await fetch(uri).then(res => res.text());
        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
        }

        if ($('.content-box h1', response).text() === "Profile Not Found") {
            msg.channel.stopTyping();
            return sendErrorResponse(msg, "No profile found with specified Battletag!");
        } else if ($('.masthead-permission-level-text', response).text() === 'Private Profile') {
            msg.channel.stopTyping();
            return sendErrorResponse(msg, "Private profile, please make your career profile public, wait a few minutes and try again.");
        } else if (!$('.competitive-rank', response).text().substring(0, 4)) {
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
                    flag: ":map:",
                    nickname: msg.author.username,
                    privateCounter: 0
                }
                leaderboard.sr = parseInt($('.competitive-rank', response).text().substring(0, 4));
                setLeaderboardMultiple.run(leaderboard);
                // need to return something btw
                msg.channel.stopTyping();
                return sendSuccessResponse(msg, leaderboard);
            } else {
                msg.channel.stopTyping();
                return sendErrorResponse(msg, "Battletag already added to the leaderboard.");
            }
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

        function sendSuccessResponse(msg, leaderboard) {
            console.log(`Added battletag ${leaderboard.battletag} to the leaderboard`);
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
                            "value": "Please set your region using `ow!setflag <flag emoji>`",
                            "inline": true
                        }
                    ]
                }
            })
        }
    }
}