module.exports = {
    addUserToChannel: addUserToChannel,
    removeUserFromChannel: removeUserFromChannel,
    schedule: schedule,
    unschedule: unschedule,
    getAllUsers: getAllUsers,
    getAllSchedules: getAllSchedules,
    init: init
};

const MongoClient = require('mongodb').MongoClient;

let _db = null;

async function init() {
    const client = await MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    _db = client.db('cod-daily-stats');
}

async function findChannel(channelId) {
    let channel = await _db.collection('channels').findOne({ channelId: channelId });
    // if channel not found in db, create it
    if (channel == null) {
        channel = { channelId: channelId, users: [] };
        await _db.collection('channels').insertOne(channel);
    }
    return channel;
}

async function isUserAdded(channelId, username, platform) {
    let userAdded = await _db.collection('channels').findOne({channelId: channelId, users: { $all: [{username: username, platform: platform}] }});
    return userAdded != null;
}

async function addUserToChannel(channelId, username, platform) {

    if (await isUserAdded(channelId, username, platform)) {
        throw 'User already added!';
    }

    await _db.collection('channels').updateOne({ channelId: channelId }, {
        $push: {
            users: { username: username, platform: platform }
        }
    }, {
        upsert: true
    });
}

async function removeUserFromChannel(channelId, username, platform) {
    await _db.collection('channels').updateOne({ channelId: channelId }, {
        $pull: {
            users: { username: username, platform: platform }
        }
    });
}

async function getAllUsers(channelId) {
    let channel = await findChannel(channelId);
    return channel.users;
}

async function schedule(channelId, cron, time) {
    await _db.collection('schedules').updateOne({ channelId: channelId }, {
        $set: {
            cron: cron,
            time: time
        }
    }, {
        upsert: true
    });
}

async function unschedule(channelId) {
    await _db.collection('schedules').deleteOne({ channelId: channelId });
}

async function getAllSchedules() {
    return await _db.collection('schedules').find({});
}