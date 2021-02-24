import { Db, MongoClient } from "mongodb";
import { Player, Guild, GameMode, Schedule } from "../common/types";


class MongoDAL {
    
    // registration related

    async removePlayerFromGuild(player: Player, guildId: string) {
        await this.db.collection('guilds').updateOne({ guildId }, {
            $pull: {
                players: player
            }
        });
    }

    async addPlayerToGuild(player: Player, guildId: string) {
        await this.db.collection('guilds').updateOne({ guildId }, {
            $push: {
                players: player
            }
        }, { upsert: true });
    }
    
    async getGuildPlayers(guildId: string): Promise<Array<Player>> {
        let guild: Guild = await this.db.collection('guilds').findOne({ guildId });

        // if guild not found in db, create it
        if (guild == null) {
            guild = { guildId, players: [] };
            await this.db.collection('guilds').insertOne(guild);
        }
        
        const { players } = guild;
        return players;
    }

    async isPlayerRegisteredInGuild(player: Player, guildId: string) {
        const { playerId, platformId } = player;
        const p = await this.db.collection('guilds')
            .findOne({ guildId, players: { $elemMatch:{ playerId, platformId } } })
        return p != null;
    }

    // helpers

    async getModeIds(mode: GameMode): Promise<Array<string>> {
        const { modeIds } = await this.db.collection('modes').findOne({ mode });
        return modeIds;
    }

    // scheduling related

    async unschedule(schedule: Schedule) {
        const { channelId } = schedule;
        await this.db.collection('schedules').deleteOne({ channelId });
    }

    async schedule(schedule: Schedule) {
        const { channelId, cron, time, modeId } = schedule;
        await this.db.collection('schedules').updateOne({ channelId }, {
            $set: { cron, time, modeId }
        }, {
            upsert: true
        });
    }
    
    async getAllSchedules(): Promise<Array<Schedule>> {
        const schedules: Array<Schedule> = [];
        await this.db.collection('schedules').find({}).forEach(s => schedules.push(s));
        return schedules;
    }


    constructor() {
        MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(client => {
                this.db = client.db(process.env.MONGO_DBNAME);
                console.log("DB Connected!");
            });
    }

    db: Db = null;
}

export const DAL = new MongoDAL();