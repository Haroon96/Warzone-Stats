module.exports = {
    init,
    schedule,
    unschedule
};

const { scheduleJob } = require('node-schedule');

const db = require('./db');
const jobs = {};

var client = null;

async function init(_client) {
    client = _client;
    let schedules = await db.getAllSchedules();
    schedules.forEach(sch => {
        createJob(sch.channelId, sch.cron, sch.mode, sch.time);
    });
}

async function schedule(channelId, mode, cron, time) {
    await db.schedule(channelId, cron, mode, time);
    cancelJob(channelId);
    createJob(channelId, cron, mode, time);
}

async function unschedule(channelId) {
    await db.unschedule(channelId);
    cancelJob(channelId);
}

function createJob(channelId, cron, mode, time) {
    let job = scheduleJob(cron, () => {
        let channel = client.channels.cache.get(channelId);
        if (channel) {
            channel.send(`!wz stats ${mode ? mode : 'br'} ${time ? time : '1d'}`);
        }
    });
    jobs[channelId] = job;
}

function cancelJob(channelId) {
    let job = jobs[channelId];
    if (job) {
        job.cancel();
    }
}