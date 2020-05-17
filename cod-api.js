module.exports = {
    getRecentMatches: getRecentMatches
};

const moment = require('moment');
const fetch = require('node-fetch');

async function getRecentMatches(platform, username, duration) {
    let now = moment();
    let todaysMatches = [];

    let next = 'null';

    // fetch all matches during specified duration
    while (true) {

        // get matches from tracker.gg api
        let url = `https://api.tracker.gg/api/v1/warzone/matches/${platform}/${encodeURIComponent(username)}?type=wz&next=${next}`;
        let res = await fetch(url, {
            "credentials": "include",
            "headers": {
                "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:76.0) Gecko/20100101 Firefox/76.0",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en",        "Pragma": "no-cache",
                "Cache-Control": "no-cache"
        
            },
            "referrer": "https://cod.tracker.gg/warzone/profile/psn/botmun_/matches",
            "method": "GET",
            "mode": "cors"
        }).then(res => res.json());

        if (res.errors) {
            throw res.errors[0].message;
        }

        let matches = res.data.matches;

        // stop if no matches left
        if (matches.length == 0) {
            break;
        }

        // filter to only today's matches
        let filteredMatches = matches.filter(x => now.diff(x.metadata.timestamp, duration.unit) < duration.value);
        
        // append filtered matches to todays list
        todaysMatches.push(...filteredMatches);

        // stop if reached duration limit
        if (filteredMatches.length < matches.length) {
            break;
        }

        // setup for next query
        next = res.data.metadata.next;
    }

    return todaysMatches;
}