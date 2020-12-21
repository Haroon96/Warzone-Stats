module.exports = {
    addUserToGuild,
    removeUserFromGuild,
    getUserFromGuild,
    schedule,
    unschedule,
    getAllUsers,
    getAllSchedules,
    getModeIds,
    init
};

const MongoClient = require('mongodb').MongoClient;

let _db = null;

async function init() {
    const client = await MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    _db = client.db(process.env.MONGO_DBNAME);
}

async function findGuild(guildId) {
    let guild = await _db.collection('guilds').findOne({ guildId });
    // if guild not found in db, create it
    if (guild == null) {
        guild = { guildId, users: [] };
        await _db.collection('guilds').insertOne(guild);
    }
    return guild;
}

async function isUserAdded(guildId, username, platform) {
    let userAdded = await _db.collection('guilds').findOne({guildId, users: { $all: [{username: username, platform: platform}] }});
    return userAdded != null;
}

async function addUserToGuild(guildId, player) {

    let { username, platform, avatar } = player;

    if (await isUserAdded(guildId, username, platform)) {
        throw 'User already added!';
    }

    await _db.collection('guilds').updateOne({ guildId }, {
        $push: {
            users: { username, platform, avatar }
        }
    }, {
        upsert: true
    });
}

async function getUserFromGuild(guildId, username, platform) {
    let r = await _db.collection('guilds').findOne({ 
        guildId,
        users: {
            $elemMatch: {
                username: new RegExp(username, 'i'),
                platform: platform
            }
        }
    }, {
        // only select matching user
        projection: {'users.$': 1}
    });
    return r ? r.users[0] : null;
}

async function removeUserFromGuild(guildId, player) {
    let { username, platform } = player;
    await _db.collection('guilds').updateOne({ guildId }, {
        $pull: {
            users: { username, platform }
        }
    });
}

async function getAllUsers(guildId) {
    let guild = await findGuild(guildId);
    return guild.users;
}

async function schedule(channelId, cron, mode, time) {
    await _db.collection('schedules').updateOne({ channelId }, {
        $set: {
            cron: cron,
            time: time,
            mode: mode
        }
    }, {
        upsert: true
    });
}

async function unschedule(channelId) {
    await _db.collection('schedules').deleteOne({ channelId });
}

async function getAllSchedules() {
    return await _db.collection('schedules').find({});
}

async function getModeIds(mode) {
    return (await _db.collection('modes').findOne({ mode })).modeIds;
}