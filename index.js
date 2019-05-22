//const Discord = require('discord.js');
const { CommandoClient } = require('discord.js-commando');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./leaderboard.sqlite');
const path = require('path');
const request = require('request');
const { RichEmbed } = require('discord.js');
const fetch = require('node-fetch');
const $ = require('cheerio');

const token = process.env.owpdToken;
const client = new CommandoClient({
    commandPrefix: 'ow!',
    owner: '265926378690576384',
    disableEveryone: true,
    unknownCommandResponse: false
})

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['leaderboard', 'Leaderboard Related Command Group'],
        ['db', 'Db Related Command Group']
    ])
    // .registerDefaultGroups()
    // .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='leaderboard';").get();
    if (!table['count(*)']) {
        // no table exists, create one and setup the database properly
        sql.prepare("CREATE TABLE leaderboard (id TEXT PRIMARY KEY, user TEXT, battletag TEXT, sr INTEGER, flag TEXT, nickname TEXT, privateCounter INTEGER);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_leaderboard_id ON leaderboard (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }

    setInterval(() => {
        updateOnTimeout();
        postUpdateToLeaderboardChannel();
    }, 1800000);

    async function updateOnTimeout() {
        const allRows = sql.prepare(`SELECT * FROM leaderboard;`).all();
        const updateThisRow = sql.prepare(`UPDATE leaderboard SET sr = ? WHERE battletag = ?;`);
        const incrementInactivity = sql.prepare(`UPDATE leaderboard SET privateCounter = ? WHERE battletag = ?;`);
        const removeBattletag = sql.prepare(`DELETE FROM leaderboard WHERE battletag = ?;`);


        for (const data of allRows) {
            var reqBattletag = data.battletag.replace(/#/g, "-");
            var uri = `https://playoverwatch.com/en-us/career/pc/${reqBattletag}`;
            uri = encodeURI(uri);
            const response = await fetch(uri).then(res => res.text());
            if ($('.masthead-permission-level-text', response).text() !== 'Private Profile' && $('.competitive-rank', response).text().substring(0, 4)) {
                console.log(`Updated battletag ${body.name} to sr ${body.rating}`)
                updateThisRow.run(body.rating, body.name);
            } else {
                data.privateCounter++;
                incrementInactivity.run(data.privateCounter, data.battletag);
            }
            if (data.privateCounter == 48) {
                removeBattletag.run(data.battletag);
                console.log(`Removed ${data.battletag} for being private/unplaced for too long!`);
            }
        }

    }
    async function postUpdateToLeaderboardChannel() {
        const leaderboardChannel = client.guilds.get("483622481375002644").channels.find(channel => channel.name === 'leaderboard');

        const leaderboard = sql.prepare("SELECT * FROM leaderboard WHERE sr >= 4000 ORDER BY sr DESC;").all();
        var embed = new RichEmbed()
            .setTitle("OWPD Leaderboard")
            .setDescription("Leaderboard updates every half an hour, private profiles will be automatically removed after 24 hours.\nUse the command `ow!help` to get a list of commands for the leaderboard bot.\nIf you run into any problems please DM ElDonte#0002 or SlimShadyIAm#9999 on Discord.")
            .setColor(0x00AE86);
        var i = 1;
        var tempBody = "";
        var characterCount = 0;

        for (const data of leaderboard) {
            var nextLine = `#${i}. ${data.flag} **${data.battletag}** [${data.sr}] (${data.nickname})` + '\n';
            characterCount += nextLine.length;
            if (tempBody.length + nextLine.length >= 1000) {
                embed.addField(" ឵឵ ឵឵", tempBody)
                tempBody = nextLine;
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
            embed.setDescription("The leaderboard is empty! Add some battletags with `ow!add`");
        } else {
            embed.addField(" ឵឵ ឵឵", tempBody);
        }
        i = 0;
        if (leaderboardChannel) {
            leaderboardChannel.bulkDelete(5).then(messages => console.log(`Bulk deleted ${messages.size} messages`)).catch(console.error);
            return leaderboardChannel.send({ embed });
        }
    }
    // eslint-disable-next-line no-console
    console.log("Logged in!");
})

client.on('error', console.error);

client.login(token);
