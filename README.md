## COD Warzone Stats
Discord bot for calculating aggregate player stats for Call of Duty Warzone Battle Royale.

### Features
- Register players for combined stats
- Scheduled stats posting using cronjob syntax
- View single player stats
- Supports PlayStation Network (`psn`), Xbox Live (`xbl`) and Activision ID (`atvi`) platforms
- Supports `[time]` parameter to only show stats from  specific times, e.g., last 8 hours (`8h`) or past 3 days (`3d`). Default value: `24h`
  - Hours: `h`
  - Days: `d`
  - Weeks: `w`
  - Months: `m`
- Supports random team splits into groups

### Guide
- Click [here](https://discordapp.com/oauth2/authorize?scope=bot&client_id=711383069160112128) to add the bot to your server.
- Send `!wz single <platform> <username> [time]` to fetch stats for a single user.
- Send `!wz stats [time]` to get stats for all registered users.
  - Register users using `!wz register <platform> <username>`
  - Unregister users using `!wz unregister <platform> <username>`
- For scheduling stats posting, send `!wz schedule '<cronjob>' 8h`. For example, `!wz schedule '30 19 * * *' 8h` posts stats everyday at 19:30 UTC.
- For team splits, send `!wz teams <people-per-team>` to get a random list of teams.

### Example
- Example response from the bot on Discord

<p align="center">
 <img src="https://github.com/Haroon96/cod-daily-stats/raw/gh-pages/img/example.png" alt="Example bot response">
</p>

### Issues
- Please note that this is an early stage project and is bound to have some issues that I will continue to work on and fix whenever I can make time for it. Meanwhile, please feel free to report or fix them and create a Pull Request.
- If you encounter issues with your profile not loading, check if you can access it on the [COD Warzone Stats Tracker Site](https://cod.tracker.gg/warzone) whose awesome API is used by the bot. Your might be set to private.
- For Activision ID, also suffix the hash for your profile (username#12345).

### Credits
- [COD Warzone Stats Tracker API](https://cod.tracker.gg/warzone)
