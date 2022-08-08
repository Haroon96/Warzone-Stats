import moment from 'moment';
import { Duration, GameMode, Player, Platform } from "../common/types.js";
import { DAL } from "../dal/mongo-dal.js";
import { request } from "../utilities/util.js";

const modeIds = await DAL.getModeIds();

export async function getPlayerProfile(platformId: Platform, playerId: string): Promise<Player> {
    let url = `https://api.tracker.gg/api/v2/warzone/standard/profile/${platformId}/${encodeURIComponent(playerId)}`;
    let res = await request(url);
    return res.errors ? null : {
        playerId: res.data.platformInfo.platformUserIdentifier,
        platformId: res.data.platformInfo.platformSlug,
        avatarUrl: res.data.platformInfo.avatarUrl
    }
}

export async function getRecentMatches(player: Player, duration: Duration, mode: GameMode) {
    let now = moment();
    let recentMatches = [];

    let next = null;

    // fetch all matches during specified duration
    while (true) {

        // get matches from tracker.gg api
        let url = `https://api.tracker.gg/api/v2/warzone/standard/matches/${player.platformId}/${encodeURIComponent(player.playerId)}?type=wz&next=${next}`;
        let res = await request(url);

        if (res.errors) {
            throw res.errors[0];
        }

        let matches = res.data.matches;

        // filter out matches of other types
        matches = matches.filter(x => modeIds[mode].includes(x.metadata.modeName));

        // filter to only today's matches
        let filteredMatches = matches.filter(x => now.diff(x.metadata.timestamp, duration.unit) < duration.value);

        // append filtered matches to todays list
        recentMatches.push(...filteredMatches);

        // stop if reached duration limit or all matches or no next
        let nextDate = new Date(res.data.metadata.next).toISOString();
        if (filteredMatches.length < matches.length || next == nextDate) {
            break;
        }

        // setup for next query
        next = nextDate;
    }

    return recentMatches;
}