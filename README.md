## COD Warzone Daily Stats
Discord bot for calculating aggregate player stats for Call of Duty Warzone Battle Royale.

### Features
- Register players for combined stats
- Scheduled stats posting using cronjob syntax
- View single player stats
- Supports PlayStation Network (`psn`) and Activision ID (`atvi`) platforms
- Supports `[time]` parameter to only show stats from  specific times, e.g., last 8 hours (`8h`) or past 3 days (`3d`). Default value: `24h`
  - Hours: `h`
  - Days: `d`
  - Weeks: `w`
  - Months: `m`

### Instructions
- Click [here](https://discordapp.com/oauth2/authorize?scope=bot&client_id=711383069160112128) to add the bot to your server.
- Send `!cds single <platform> <username> [time]` to fetch stats for a single user
- Send `!cds stats [time]` to get stats for all registered users
  - Register users using `!cds register <platform> <username>`
  - Unregister users using `!cds unregister <platform> <username>`
- For scheduling stats posting, send `!cds schedule '<cronjob>' 8h`. For example, `!cds schedule '30 19 * * *' 8h` posts stats everyday at 19:30 UTC time.
