module.exports = {
    getTodaysMatches: getTodaysMatches
};

const moment = require('moment');
const fetch = require('node-fetch');

async function getTodaysMatches(platform, username) {
    let now = moment();
    let last24h = false;
    let todaysMatches = [];

    let next = 'null';

    // fetch all matches from last 24hrs
    while (!last24h) {

        // get matches from tracker.gg api
        let url = `https://api.tracker.gg/api/v1/warzone/matches/${platform}/${encodeURIComponent(username)}?type=wz&next=${next}`;
        let res = await fetch(url, {
            "credentials": "include",
            "headers": {
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en"
            },
            "method": "GET",
        }).then(res => res.json());

        if (res.errors) {
            throw res.errors[0].message;
        }

        let matches = res.data.matches;

        // filter to only today's matches
        let filteredMatches = matches.filter(x => moment(x.metadata.timestamp).diff(now, 'day') == 0);
        
        // append filtered matches to todays list
        todaysMatches.push(...filteredMatches);
        if (filteredMatches.length < matches.length) {
            last24h = true;   
        }

        // setup for next query
        next = res.data.metadata.next;
    }

    return todaysMatches;
}