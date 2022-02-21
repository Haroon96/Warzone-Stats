import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

const clientId = "939233932837257296"
const guildId = "693881501464395846"

function modeOption(required: boolean): Omit<SlashCommandStringOption, "setAutocomplete"> {
    return new SlashCommandStringOption()
        .setName('mode')
        .setDescription('The selected Gamemode')
        .setRequired(required)
        .addChoice('Battle Royale', 'br')
        .addChoice('Plunder', 'plndr')
        .addChoice('Rumble', 'rmbl')
        .addChoice('Resurgence', 'rsg')
}

function platformOption(required: boolean): Omit<SlashCommandStringOption, "setAutocomplete"> {
    return new SlashCommandStringOption()
        .setName('platform')
        .setDescription('Filter by platform')
        .setRequired(required)
        .addChoice('Activision', 'atvi')
        .addChoice("PlayStation", 'psn')
        .addChoice('Xbox', 'xbl')
}

const stats = new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Display stats of a single player or all registered players')
    .addStringOption(modeOption(true))
    .addStringOption(option =>
        option.setName('duration')
            .setDescription('duration: `h` hours, `d` days, `w` weeks, `m` months. Defaults to `24h`')
            .setRequired(false)
            .setAutocomplete(true))
    .addStringOption(platformOption(false))
    .addStringOption(option => option.setName("player").setDescription('Filter by player').setAutocomplete(true))

const players = new SlashCommandBuilder()
    .setName('players')
    .setDescription('Handle registered players')
    .addSubcommand(cmd => cmd.setName('list').setDescription('List all registered players'))
    .addSubcommand(cmd =>
        cmd.setName('register')
            .setDescription('Register a new player')
            .addStringOption(platformOption(true))
            .addStringOption(option => option.setName('id').setDescription('The ID of the player').setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(cmd =>
        cmd.setName('remove')
            .setDescription('Remove a player')
            .addStringOption(platformOption(true))
            .addStringOption(option => option.setName('id').setDescription('The ID of the player').setRequired(true).setAutocomplete(true))
    )

const schedule = new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Schedule automated stats posting')
    .addSubcommand(cmd => cmd.setName('list').setDescription('List all scheduled stats postings'))
    .addSubcommand(cmd => cmd.setName('set')
        .setDescription('Schedule new automated stats posting')
        .addStringOption(modeOption(true))
        .addStringOption(option => option.setName('cronjob')
            .setDescription('The cronjob for repeated postings')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('duration: `h` hours, `d` days, `w` weeks, `m` months. Defaults to `24h`')
                .setRequired(false)
                .setAutocomplete(true)
        )
    )
    .addSubcommand(cmd => cmd.setName('remove').setDescription('Unschedule automated stats posting'))

const teams = new SlashCommandBuilder()
    .setName('teams')
    .setDescription('Randomly split registered players into teams')
    .addIntegerOption(option => option.setName('size').setDescription('Team Size'))

const commands = [
    stats,
    players,
    schedule,
    teams
]
    .map(cmd => cmd.toJSON())

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN!)

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error)