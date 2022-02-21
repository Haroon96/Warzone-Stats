import { Embed } from '@discordjs/builders'
import { Client, MessageEmbed, TextBasedChannel, TextChannel } from 'discord.js'
import { Job, scheduleJob } from 'node-schedule'
import { fetchTask, generateStatsEmbed } from '../api/stats.js'
import { Schedule } from '../common/types.js'
import { DAL } from "../dal/mongo-dal.js"
import TaskRepeater from './task-repeater.js'
import { formatPlayername, generateEmbed } from './utils.js'

class StatsScheduler {

    async init(client: Client) {
        this.client = client
        this.jobs = new Map<string, Job>()
        const schedules = await DAL.getAllSchedules()
        for (const schedule of schedules) {
            this.createJob(schedule)
        }
        console.info('Scheduler initialized!')
    }

    private createJob(schedule: Schedule) {
        const job = scheduleJob(schedule.cron, () => {
            const channel = this.client.channels.cache.get(schedule.channelId)
            if (channel && channel.isText()) {
                this.postStats(channel, schedule)
            }
        })
        this.jobs.set(schedule.channelId, job)
    }

    private cancelJob(channelId: string) {
        const job = this.jobs.get(channelId)
        if (job) {
            job.cancel()
        }
    }

    async schedule(schedule: Schedule) {
        await DAL.schedule(schedule)
        this.cancelJob(schedule.channelId)
        this.createJob(schedule)
    }

    async unschedule(channelId: string) {
        await DAL.unschedule(channelId)
        this.cancelJob(channelId)
    }

    async postStats(channel: TextBasedChannel, schedule: Schedule) {
        const message = "Scheduled stat posting:\n"
        const players = await DAL.getFilteredPlayers(schedule.guildId, null, true)

        // check if there are players registered in the guild
        if (!players.length) {
            await channel.send(message + "No players registered! See `/players` command.")
            return
        }

        const guildStats: ({
            matchPlayed: boolean | undefined;
            embed: MessageEmbed;
        })[] = await Promise.all(players.map(async (player) => {
            try {
                // create a `TaskRepeater` instance
                const taskRepeater = new TaskRepeater(fetchTask, [player, schedule.duration, schedule.modeId], 5000, 5)

                // run the repeater
                const playerStats = await taskRepeater.run()

                return { matchPlayed: playerStats !== null, embed: generateStatsEmbed(player, playerStats, schedule.duration, channel.client) }
            } catch (e) {
                console.error(e)
                return { matchPlayed: true, embed: generateEmbed(`${formatPlayername(player, channel.client)}`, "Failed to fetch stats.\n", player.avatarUrl) }
            }
        }))

        if (guildStats.every(g => g.matchPlayed)) {
            channel.send({ content: message, embeds: guildStats.map(g => g.embed) })
        } else {
            channel.send(message + `No matches played during the last ${schedule.duration.value} ${schedule.duration.unit}(s)! Skipping...`)
        }
    }

    jobs: Map<string, Job>
    client: Client
}

export const Scheduler = new StatsScheduler()