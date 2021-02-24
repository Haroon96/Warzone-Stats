import { Db, MongoClient } from "mongodb";
import { Player, Guild, GameMode } from "../common/types";


class MongoDAL {
    
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
        return (await this.db.collection('modes').findOne({ mode })).modeIds;
    }

    constructor() {
        let self = this;
        MongoClient
        .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            self.db = client.db(process.env.MONGO_DBNAME);
        });
    }

    db: Db = null;
}

export const DAL = new MongoDAL();