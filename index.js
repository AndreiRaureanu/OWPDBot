//const Discord = require('discord.js');
const { CommandoClient } = require('discord.js-commando');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./leaderboard.sqlite');
const path = require('path');
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
        sql.prepare("CREATE TABLE leaderboard (id TEXT PRIMARY KEY, user TEXT, battletag TEXT, sr INTEGER, flag TEXT, nickname TEXT);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_leaderboard_id ON leaderboard (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }
    // eslint-disable-next-line no-console
    console.log("Logged in!");
})

client.on('error', console.error);

client.login('NDY3MDY4NTkwNzIyNjQ2MDM2.DioXwA.RkSTbXEQ-Vi8sGb5RWKcUc60psU');
