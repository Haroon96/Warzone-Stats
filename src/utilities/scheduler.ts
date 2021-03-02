import { Client } from 'discord.js';
import { Job, scheduleJob } from 'node-schedule';
import { Schedule } from '../common/types';
import { DAL } from "../dal/mongo-dal";

class StatsScheduler {

    async init(client: Client) {
        this.client = client;
        this.jobs = new Map<string, Job>();
        const schedules = await DAL.getAllSchedules();
        for (const schedule of schedules) {
            this.createJob(schedule);
        }
    }

    private createJob(schedule: Schedule) {
        const job = scheduleJob(schedule.cron, () => {
            const channel = this.client.channels.cache.get(schedule.channelId);
            if (channel) {
                const duration = schedule.duration ? `${schedule.duration.value}${schedule.duration.code}` : '1d';
                // @ts-ignore
                channel.send(`!wz stats ${schedule.modeId ?? 'br'} ${duration}`);
            }
        });
        this.jobs.set(schedule.channelId, job);
    }

    private cancelJob(channelId: string) {
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

export const Scheduler = new StatsScheduler();