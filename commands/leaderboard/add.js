const {
    Command
} = require('discord.js-commando');
const {
    RichEmbed
} = require('discord.js');
const SQLite = require("better-sqlite3");
const request = require('request');
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

    run(msg, {
        member,
        battletag
    }) {
        //first check if its valid battletag through regex
        var test4Characters = RegExp('/.*#[0-9]{4}');
        var test5Characters = RegExp('/.*#[0-9]{5}');
        if (test4Characters.test(battletag) || test5Characters.test(battletag)) {
            return msg.say(`Invalid battletag, please adhere to the format: Example#12345`);
        }

        //get the required information from OWAPI (sr)
        var reqBattletag = battletag.replace(/#/g, "-");
        var options = {
            url: `https://owapi.net/api/v3/u/${reqBattletag}/blob`,
            headers: {
                'User-Agent': 'request'
            }
        };

        function callback(error, response, body) {
                body = JSON.parse(body);
                console.log(body);
                // when its invalid profile
                console.log(body.msg == "profile not found");
                //when its a private profile
                console.log(body.error == "Private");
                //when its unplaced
                console.log(body.eu.stats.competitive.overall_stats.comprank === null)
                console.log(body.eu.stats.competitive.overall_stats.comprank)

        }
        request(options, callback);
        // need to return something btw
        return msg.say(`shit works i guess`);
        //client.setLeaderboard = sql.prepare("INSERT OR REPLACE INTO leaderboard")
    }
}