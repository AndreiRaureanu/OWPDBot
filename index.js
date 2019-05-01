//const Discord = require('discord.js');
const { CommandoClient } = require('discord.js-commando');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./leaderboard.sqlite');
const path = require('path');
const request = require('request');

const client = new CommandoClient({
    commandPrefix: 'ow!',
    owner: '265926378690576384',
    disableEveryone: true,
    unknownCommandResponse: false
})

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['leaderboard', 'Leaderboard Related Command Group']
    ])
    // .registerDefaultGroups()
    // .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands')); 

client.on('ready', () =>{
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='leaderboard';").get();
    if(!table['count(*)']) {
        // no table exists, create one and setup the database properly
        sql.prepare("CREATE TABLE leaderboard (id TEXT PRIMARY KEY, user TEXT, battletag TEXT, sr INTEGER, flag TEXT, nickname TEXT, privateCounter INTEGER);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_leaderboard_id ON leaderboard (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }

    setInterval(() => {
        updateOnTimeout();
    }, 30000);

    function updateOnTimeout() {
        const allRows = sql.prepare(`SELECT * FROM leaderboard;`).all();
        const updateThisRow = sql.prepare(`UPDATE leaderboard SET sr = ? WHERE battletag = ?;`);
        const incrementInactivity = sql.prepare(`UPDATE leaderboard SET privateCounter = ? WHERE battletag = ?;`);
        const removeBattletag = sql.prepare(`DELETE FROM leaderboard WHERE battletag = ?;`);
        
        for (const data of allRows) {
            var reqBattletag = data.battletag.replace(/#/g, "-");
            var options = {
                url: `https://owapi.slim.ovh/stats/pc/eu/${reqBattletag}`,
                headers: {
                    'User-Agent': 'OWPDrequest'
                }
            };
            console.log(reqBattletag)
            request(options, callback);
            function callback(error, response, body) {
                if (error.code == 'ENOTFOUND') {
                    msg.channel.stopTyping();
                    return sendErrorResponse(msg, "Looks like the API is down. Please try again later.")
                } else {
                    body = JSON.parse(body);
                    console.log(body)
                    if (!body.private || body.rating != 0) {
                        console.log(`Updated battletag ${body.name} to sr ${body.rating}`)
                        updateThisRow.run(body.rating, body.name);
                    } else {
                        data.privateCounter++;
                        incrementInactivity.run(data.privateCounter, data.battletag);
                    }
                    if (data.privateCounter == 2) {
                        removeBattletag.run(data.battletag);
                        console.log(`Removed ${data.battletag} for being private/unplaced for too long!`)
                    }
                }
            }
        }
    }
    // eslint-disable-next-line no-console
    console.log("Logged in!");
})

client.on('error', console.error);

client.login('NDY3MDY4NTkwNzIyNjQ2MDM2.DioXwA.RkSTbXEQ-Vi8sGb5RWKcUc60psU');
