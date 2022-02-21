import mongodb from "mongodb"
const { MongoClient } = mongodb
import { Player, Guild, GameMode, Schedule, Platform } from "../common/types.js"
import { parseDuration } from "../utilities/utils.js"


class MongoDAL {

    // migration related
    // Adds 'active: true' field to player with 'active: none'.
    async migrate(): Promise<void> {
        console.log("Migrating...")
        const result = await this.db.collection('guilds').updateMany({}, {
            $set: { "players.$[player].active": true }
        }, {
            arrayFilters: [
                { "player.active": null }
            ]
        })

        console.log("Modified:", result.modifiedCount)
    }

    // registration related
    async activatePlayerInGuild(player: Player, guildId: string) {
        // try to update the players 'active' field to true
        const updateRes = await this.db.collection('guilds').updateOne({
            guildId,
            "players.playerId": new RegExp(player.playerId, 'i')
        }, {
            $set: {
                "players.$": player,
            },
        })

        // if no player was found, insert new
        if (!updateRes.matchedCount) {
            await this.db.collection('guilds').updateOne({ guildId }, {
                $addToSet: {
                    players: player,
                },
            })
        }
    }

    async deactivatePlayerInGuild(player: Player, guildId: string) {
        await this.db.collection('guilds').updateOne({
            guildId,
            "players.playerId": new RegExp(player.playerId, 'i')
        }, {
            $set: {
                "players.$.active": false
            }
        })
    }

    // reading related

    // Get a whole guild, with all players
    async getGuild(guildId: string): Promise<Guild> {
        let guild = await this.db.collection('guilds').findOne<Guild>({ guildId })

        // if guild not found in db, create it
        if (guild == null) {
            guild = { guildId, players: [] }
            await this.db.collection('guilds').insertOne(guild)
        }

        return guild
    }

    // Get a filtered view onto the guilds players
    async getFilteredPlayers(guildId: string, platform: Platform | null = null, active: boolean = true): Promise<Array<Player>> {
        // always filter players for 'active' (true/false)
        var filterCondition: Object = { $eq: ["$$this.active", active] }

        // if requested, also filter players for platform
        if (platform) {
            filterCondition = { $and: [{ $eq: ["$$this.platformId", platform] }, filterCondition] }
        }

        let guild = await this.db.collection('guilds').findOne<Guild>({
            guildId
        }, {
            projection: {
                _id: false,
                guildId: true,
                players: {
                    $filter: {
                        input: "$players",
                        cond: filterCondition
                    }
                }
            }
        })

        // if guild not found in db, create it
        if (guild == null) {
            guild = { guildId, players: [] }
            await this.db.collection('guilds').insertOne(guild)
        }

        return guild.players
    }

    // Get a specific player in a guild
    async getPlayer(guildId: string, platformId: Platform, playerId: string, active: boolean = true): Promise<Player> {
        const q = await this.db.collection('guilds').findOne({
            guildId,
            players: {
                $elemMatch: {
                    playerId: new RegExp(playerId, 'i'),
                    platformId,
                    active: active
                }
            }
        }, {
            // only select matching user
            projection: { 'players.$': 1 }
        })
        return q ? q.players[0] : null
    }

    async isPlayerRegisteredInGuild(player: Player, guildId: string): Promise<boolean> {
        const { platformId, playerId } = player
        return await this.getPlayer(guildId, platformId, playerId) != null
    }

    // helpers

    async getModeIds(mode: GameMode): Promise<Array<string>> {
        const { modeIds } = await this.db.collection('modes').findOne({ mode }) as any
        return modeIds
    }

    // scheduling related

    async unschedule(schedule: Schedule) {
        const { channelId } = schedule
        await this.db.collection('schedules').deleteOne({ channelId })
    }

    async schedule(schedule: Schedule) {
        const { channelId, cron, duration, modeId } = schedule
        await this.db.collection('schedules').updateOne({ channelId }, {
            $set: { cron, duration, modeId }
        }, {
            upsert: true
        })
    }

    async getSchedule(channelId: string): Promise<Schedule | null> {
        const doc = await this.db.collection('schedules').findOne({ channelId })
        console.log(doc)

        return { channelId: channelId, cron: "blub", duration: parseDuration(null, '24h')!, modeId: 'br' }
    }

    async getAllSchedules(): Promise<Array<Schedule>> {
        return this.db.collection('schedules').find<Schedule>({}).toArray()
    }

    async init() {
        const client = await MongoClient.connect(process.env.MONGO_URI!)
        this.db = client.db(process.env.MONGO_DBNAME)
        console.info("DB connected!")
    }

    db: mongodb.Db
}

export const DAL = new MongoDAL()