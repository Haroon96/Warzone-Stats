module.exports = {
    getRecentMatches
};

const moment = require('moment');
const fetch = require('node-fetch');

async function getRecentMatches(platform, username, duration) {
    let now = moment();
    let recentMatches = [];

    let next = 'null';

    // fetch all matches during specified duration
    while (true) {

        // get matches from tracker.gg api
        let url = `https://api.tracker.gg/api/v1/warzone/matches/${platform}/${encodeURIComponent(username)}?type=wz&next=${next}`;
        let res = await fetch(url, {
            "credentials": "include",
            "headers": {
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en"
            },
            "method": "GET",
            "mode": "cors"
        }).then(res => res.json());

        if (res.errors) {
            // return recentMatches if previous calls were successful
            // an error probably indicates end of matches for this user
            if (recentMatches.length > 0) {
                return recentMatches;
            }
            // if there are no matches saved from previous calls,
            // throw the error
            throw {msg: res.errors[0].message, code: res.errors[0].code};
        }

        let matches = res.data.matches;

        // only select battle royale
        matches = matches.filter(x => ['br_89', 'br_25'].includes(x.attributes.modeId));

        // filter to only today's matches
        let filteredMatches = matches.filter(x => now.diff(x.metadata.timestamp, duration.unit) < duration.value);
        
        // append filtered matches to todays list
        recentMatches.push(...filteredMatches);

        // stop if reached duration limit or all matches
        if (filteredMatches.length < matches.length) {
            break;
        }

        // setup for next query
        next = res.data.metadata.next;
    }

    return recentMatches;
}