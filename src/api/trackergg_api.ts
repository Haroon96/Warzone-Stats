import moment from 'moment'
import { Duration, GameMode, Player, Platform, Guild } from "../common/types.js"
import { DAL } from "../dal/mongo-dal.js"
import { request } from "../utilities/utils.js"

// https://my.callofduty.com/content/atvi/callofduty/mycod/web/en/data/json/iq-content-xweb.js
const modeIds = {
    br: [
        "br_br_real",
        "br_brthquad",
        "br_brquads",
        "br_jugg_brtriojugr",
        "br_brtrios",
        "br_brduos",
        "br_brsolos",
        "br_brsolo",
        "br_brtriostim_name2",
        "br_truckwar_trwarsquads",
        "br_brhwntrios",
        "br_jugg_jugpmpkn",
        "br_brhwnquad",
        "br_zxp_zmbroy",
        "br_mini_miniroyale",
        "br_brz_brquads",
        "br_brz_brtrios",
        "br_brz_brduos",
        "br_brbbsolo",
        "br_brbbduo",
        "br_brbbtrio",
        "br_brbbquad",
        "br_rumble_clash",
        "br_dbd_dbd",
        "br_gxp_gov",
        "br_dbd_iron_trials_duos",
        "br_vov_op_flash",
        "br_vg_royale_trios",
        "br_br_quads",
        "br_vg_royale_duos",
        "br_vg_royale_quads",
        "br_vg_royale_solo",
        "br_lep_br_lep_event/ltm_gamemode",
        "br_buy_back_solos",
        "br_buy_back_duos",
        "br_buy_back_trios",
        "br_buy_back_quads",
        "br_vg_royale_solos",
        "br_vg_royale_duos",
        "br_vg_royale_trios",
        "br_vg_royale_quads",
    ],
    rmbl: [
        "brtdm_rmbl",
        "br_rumble_lua_menu_mp/clash"
    ],
    plndr: [
        "br_dmz_plunquad",
        "br_dmz_plnbld",
        "br_dmz_plndtrios",
        "br_dmz_plnduo",
        "br_dmz_plntrios",
        "br_dmz_vg_pln_trios"
    ],
    rsg: [
        "br_rebirth_rbrthquad",
        "br_rebirth_rbrthtrios",
        "br_rebirth_rbrthduos",
        "br_rebirth_shsnp_name3",
        "br_rebirth_vg_res_44",
        "br_rebirth_cal_res_royale"
    ]
}

export async function getPlayerProfile(platformId: Platform, playerId: string): Promise<Player | null> {
    let url = `https://api.tracker.gg/api/v2/warzone/standard/profile/${platformId}/${encodeURIComponent(playerId)}`
    let res = await request(url)
    return res.errors ? null : {
        playerId: res.data.platformInfo.platformUserIdentifier,
        platformId: res.data.platformInfo.platformSlug,
        avatarUrl: res.data.platformInfo.avatarUrl,
        active: true
    }
}

export async function getMatchDetails(matchId: string): Promise<Array<Object>> {
    let url = `https://www.callofduty.com/api/papi-client/crm/cod/v2/title/mw/platform/battle/fullMatch/wz/${matchId}/it`
    const res = await request(url)
    return res.status ? res.data.allPlayers : null
}

export async function getRecentMatches(player: Player, duration: Duration, modeId: GameMode) {
    let now = moment()
    let recentMatches: any[] = []

    let next = 'null'

    // check if modeIds loaded, else load from db
    if (!modeIds[modeId]) modeIds[modeId] = await DAL.getModeIds(modeId)

    // fetch all matches during specified duration
    while (true) {

        // get matches from tracker.gg api
        let url = `https://api.tracker.gg/api/v2/warzone/standard/matches/${player.platformId}/${encodeURIComponent(player.playerId)}?type=wz&next=${next}`
        let res = await request(url)

        if (res.errors) {
            throw res.errors[0]
        }

        let matches = res.data.matches

        // filter out matches of other types
        matches = matches.filter(x => modeIds[modeId].includes(x.attributes.modeId))

        // filter to only today's matches
        let filteredMatches = matches.filter(x => now.diff(x.metadata.timestamp, duration.unit) < duration.value)

        // append filtered matches to todays list
        recentMatches.push(...filteredMatches)

        // stop if reached duration limit or all matches
        if (filteredMatches.length < matches.length) {
            break
        }

        // setup for next query
        next = res.data.metadata.next
    }

    return recentMatches
}