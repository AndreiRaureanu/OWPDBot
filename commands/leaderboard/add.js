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
            userPermissions: ['MANAGE_MESSAGES'],
            examples: ['add @User battletag'],
            args: [{
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

    async run(msg, { member, battletag }) {
        var setLeaderboard = sql.prepare("INSERT OR REPLACE INTO leaderboard (id, user, battletag, sr, flag, nickname) VALUES (@id, @user, @battletag, @sr, @flag, @nickname);");
        var getLeaderboard = sql.prepare("SELECT * FROM leaderboard WHERE user = ?")
        //first check if its valid battletag format through regex
        var test4Characters = RegExp('/.*#[0-9]{4}');
        var test5Characters = RegExp('/.*#[0-9]{5}');
        if (test4Characters.test(battletag) || test5Characters.test(battletag)) {
            return msg.say(`Invalid battletag, please adhere to the format: Example#12345`);
        }

        //prepare the request from the API for the sr
        var reqBattletag = battletag.replace(/#/g, "-");
        var options = {
            url: `https://owapi.slim.ovh/api/v3/u/${reqBattletag}/blob`,
            headers: {
                'User-Agent': 'OWPDrequest'
            }
        };

        function callback(error, response, body) {
            body = JSON.parse(body);
            if (body.mgs == "profile not found") {
                sendErrorResponse(msg, "No profile found with specified battletag.");
            }
            if (body.error == "Private") {
                return msg.say("Private profile, please make your career profile public, wait a few minutes and try again.")
            }
            if(body.eu.stats.competitive.overall_stats.comprank === null) {
                return msg.say("Your account is unplaced. Please finish your placements and then try again.");
            }
            console.log(body);
            console.log(body.eu.stats.competitive.overall_stats.comprank)


            var leaderboard = getLeaderboard.get(member.user.id);
            if(!leaderboard) {
                leaderboard = {id: member.user.id, user: member.user.id, battletag: battletag, sr: 0, flag: `:map:`, nickname: `default`}
            }
    
            leaderboard.sr = body.eu.stats.competitive.overall_stats.comprank;
            setLeaderboard.run(leaderboard);
            // need to return something btw
            return msg.say(`shit works i guess`);
        }
        request(options, callback);
        
        // var leaderboard = getLeaderboard.get(member.user.id);
        // if(!leaderboard) {
        //     leaderboard = {id: member.user.id, user: member.user.id, battletag: battletag, sr: 0, flag: `:map:`, nickname: `default`}
        // }

        // leaderboard.sr = body.eu.stats.competitive.overall_stats.comprank;
        // setLeaderboard.run(leaderboard);
        // // need to return something btw
        // return msg.say(`shit works i guess`);
        function sendErrorResponse(msg, text) {
            msg.channel.send({embed: {
                color: 3447003,
                title: "An error occured!",
                description: text
            }
        }
    }
}