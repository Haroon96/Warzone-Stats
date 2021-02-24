import { Db, MongoClient } from "mongodb";
import { Player, Guild, GameMode } from "../common/types";


class MongoDAL {
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

    async getModeIds(mode: GameMode): Promise<Array<string>> {
        const { modeIds } = await this.db.collection('modes').findOne({ mode });
        return modeIds;
    }

    async isPlayerRegisteredInGuild(player: Player, guildId: string) {
        const { playerId, platformId } = player;
        const p = await this.db.collection('guilds')
            .findOne({ guildId, players: { $elemMatch:{ playerId, platformId } } })
        return p != null;
    }

    constructor() {
        const self = this;
        MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(client => {
                self.db = client.db(process.env.MONGO_DBNAME);
                console.log("DB Connected!");
            });
    }

    db: Db = null;
}

export const DAL = new MongoDAL();