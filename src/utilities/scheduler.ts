import { Client } from 'discord.js';
import { Job, scheduleJob } from 'node-schedule';
import { Schedule } from '../common/types';
import { DAL } from "../dal/mongo-dal";


export default class Scheduler {

    constructor(client) {
        this.client = client;
        DAL.getAllSchedules()
            .then(schedules => {
                for (let schedule of schedules) {
                    this.createJob(schedule);
                }
            });
    }

    createJob(schedule) {
        let job = scheduleJob(schedule.cron, () => {
            const channel = this.client.channels.cache.get(schedule.channelId);
            if (channel) {
                // @ts-ignore
                channel.send(`!wz stats ${mode ? mode : 'br'} ${time ? time : '1d'}`);
            }
        });
        this.jobs.set(schedule.channelId, job);
    }

    cancelJob(channelId) {
        const job = this.jobs.get(channelId);
        if (job) {
            job.cancel();
        }
    }

    async schedule(schedule: Schedule) {
        await DAL.schedule(schedule);
        this.cancelJob(schedule.channelId);
        this.createJob(schedule);
    }

    async unschedule(schedule: Schedule) {
        await DAL.unschedule(schedule);
        this.cancelJob(schedule.channelId);
    }
    
    jobs: Map<string, Job>;
    client: Client;
}
