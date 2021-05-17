# Warzone Stats
Discord bot for calculating aggregate player stats for Call of Duty Warzone.

## Features
- Register players for combined stats
- Scheduled stats posting using cronjob syntax
- View single player stats
- Supports `[mode]` parameter to show stats for different game modes.
  - Battle Royale: `br`
  - Warzone Rumble: `rmbl`
  - Plunder: `plndr`
  - Resurgence: `rsg`
- Supports PlayStation Network (`psn`), Xbox Live (`xbl`) and Activision (`atvi`) platforms
- Supports `[time]` parameter to only show stats from specific times, e.g., last 8 hours (`8h`) or past 3 days (`3d`). Default value: `24h`
  - Hours: `h`
  - Days: `d`
  - Weeks: `w`
  - Months: `m`
- Supports random team splits into groups

## Guide
- [Invite the bot to your server](https://discord.com/api/oauth2/authorize?client_id=711383069160112128&permissions=346112&scope=bot).
- Send `!wz stats <modeId> [platformId] [playerId] [time]` to fetch stats for a specific player.
- Send `!wz stats <mode> [time]` to get stats for all registered users.
  - Register users using `!wz register <platformId> <playerId>`
  - Unregister users using `!wz unregister <platformId> <playerId>`
  - Enclose `<playerId>` in double-quotes (like `"<playerId>"`) if it contains spaces.
- For scheduling stats posting, send `!wz schedule "<cronjob>" 8h`. For example, `!wz schedule "30 19 * * *" 8h` posts stats everyday at 19:30 UTC.
- For team splits, send `!wz teams <teamSize>` to get a random list of teams from registered users.

## Example
- To fetch stats for the player _m_haroon2305_ playing with a PlayStation for the last two weeks, send `!wz stats br psn m_haroon2305 2w`.
- Example response from the bot on Discord

<p align="center">
 <img src="https://github.com/Haroon96/warzone-stats/raw/gh-pages/img/response-example.png" width="500" alt="Example bot response">
</p>

## Issues
- If you encounter issues with your profile not loading, check if you can access it on the [COD Warzone Stats Tracker Site](https://cod.tracker.gg/warzone) whose awesome API is used by the bot. Yours might be set to private.
- Allow the bot permission to use external emojis so it can use icons for platforms instead.
- For Activision, it may be necessary to suffix the hash for your profile when requesting stats (e.g., `username#12345`).
- Feel free to open a GitHub issue if you face any problems.

## Credits
- [COD Warzone Stats Tracker API](https://cod.tracker.gg/warzone)
