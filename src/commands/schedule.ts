import { isValidCron } from "cron-validator"
import { AutocompleteInteraction, CommandInteraction } from "discord.js"
import { Command, GameMode, Schedule } from "../common/types.js"
import { DAL } from "../dal/mongo-dal.js"
import { Scheduler } from "../utilities/scheduler.js"
import { formatSchedule, parseDuration } from "../utilities/utils.js"
import cronstrue from 'cronstrue';

const command: Command = { name: 'schedule', execute, autocomplete }
export default command

async function execute(interaction: CommandInteraction) {
    const cmd = interaction.options.getSubcommand(true)

    if (cmd == 'list') {
        await listSchedule(interaction)
    } else if (cmd == 'set') {
        await scheduleStats(interaction)
    } else if (cmd == 'remove') {
        await unscheduleStats(interaction)
    } else {
        await interaction.reply('Unknown command provided!')
    }
}

async function autocomplete(interaction: AutocompleteInteraction) {

}

async function listSchedule(interaction: CommandInteraction) {
    const schedules = await DAL.getSchedules(interaction.channelId)

    if (schedules.length == 0)
        await interaction.reply("No schedule set for this channel!")
    else {
        const descriptions = schedules.map(formatSchedule)
        await interaction.reply(`Schedules for this channel:\n${descriptions.join("\n")}\nAt least one player must have played a game in that time for stats to show up!`)
    }
}

async function scheduleStats(interaction: CommandInteraction) {
    // get schedule args
    const cron = interaction.options.getString('cronjob', true)
    const modeId = interaction.options.getString('mode', true) as GameMode
    const duration = parseDuration(interaction.options.getString('duration'))

    if (!duration) {
        interaction.reply("\`\`\`fix\nInvalid duration entered: ${interaction.options.getString('duration')}! Use h (hours), d (days), w (weeks) or m (months).\n\`\`\`")
        return
    }

    // check if cron is valid
    if (!isValidCron(cron)) {
        interaction.reply("\`\`\`fix\nInvalid cron syntax! See https://crontab.guru/ for help.\n\`\`\`")
        return
    }

    // schedule stats
    const schedule: Schedule = { cron, modeId, duration: duration!, channelId: interaction.channelId, guildId: interaction.guildId! }
    await Scheduler.schedule(schedule)

    await interaction.reply(`Stats scheduled!\n${formatSchedule(schedule)}`)
}

async function unscheduleStats(interaction: CommandInteraction) {
    await Scheduler.unschedule(interaction.channelId)
    await interaction.reply("Stats unscheduled for this channel!")
}


