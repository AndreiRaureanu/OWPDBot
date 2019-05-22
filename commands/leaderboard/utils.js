const rp = require('request-promise');
const $ = require('cheerio');

module.exports = {
    getBtagInfo:function (battletag) {
        var reqBattletag = battletag.replace(/#/g, "-");
        var uri = `https://playoverwatch.com/en-us/career/pc/${reqBattletag}`;
        rp({uri: encodeURI(uri), encoding: 'utf8'})
            .then(function (html) {
                //success
                //profile doesn't exist
                if ($('.content-box h1', html).text() === "Profile Not Found") {
                    console.log($('.content-box h1', html).text());
                    const parsed = {
                        error: $('.content-box h1', html).text()
                    }
                    return parsed;
                } else {
                    //private profile
                    if($('.masthead-permission-level-text', html).text() === 'Private Profile') {
                        console.log($('.masthead-permission-level-text', html).text());
                        const parsed = {
                            profileStatus: $('.masthead-permission-level-text', html).text(),
                            rank: 0,
                            id: $('script', html)[13].children[0].data.split("(")[1].split(",")[0]
                        }
                        return parsed;
                    }
                    //public profile
                    if ($('.competitive-rank', html).text()) {
                        //public profile, has placements done
                        console.log('Placements done, current rank: ' + $('.competitive-rank', html).text().substring(0, 4));
                        // existing profile, private or public, display unique btag id
                        if ($('script', html)[13]) {
                            console.log($('script', html)[13].children[0].data.split("(")[1].split(",")[0]);
                        }
                        const parsed = {
                            profileStatus: $('.masthead-permission-level-text', html).text(),
                            rank: $('.competitive-rank', html).text().substring(0, 4),
                            id: $('script', html)[13].children[0].data.split("(")[1].split(",")[0]
                        }
                        return parsed;
                    } else {
                        //no placements done
                        console.log('Placements not done');
                        // existing profile, private or public, display unique btag id
                        if ($('script', html)[13]) {
                            console.log($('script', html)[13].children[0].data.split("(")[1].split(",")[0]);
                        }
                        const parsed = {
                            profileStatus: $('.masthead-permission-level-text', html).text(),
                            rank: 0,
                            id: $('script', html)[13].children[0].data.split("(")[1].split(",")[0]
                        }
                        return parsed;
                    }
                }
            })
            .catch(function (err) {
                console.error(err);
            });
    }
};