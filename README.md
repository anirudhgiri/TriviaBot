![TriviaBot](https://i.imgur.com/qJryQ71.png)
# TriviaBot
Wrestling Trivia Discord Bot for Internet Wrestling Discord

## Introudction
TriviaBot is a Discord bot built using Javascript (with [NodeJS](https://nodejs.org/)) using the [Discord.js library](https://discord.js.org) for the [Profesional Wrestling](https://en.wikipedia.org/wiki/Professional_wrestling) community server, [Internet Wrestling Discord](https://wrestlingdiscord.com/)  that randomly spawns "trivia events", spontaneous trivia sessions where users have 10 seconds to answer a multiple choice wrestling related question for the chance to win the "24/7 Champion" prize.

## Trivia Defending
TriviaBot tracks the messages the Hardcore Champion makes in IWD's wrestling channels and has an adjustable % chance of spawning a trivia defense each message. Each trivia defense will ping the champion role and ask a piece of wrestling related trivia. All users in the channel will have 10 seconds to correctly answer the piece of trivia (multiple choice A/B/C/D). The role is randomly raffled between all those who answered correctly.

## Trivia Bank
Trivia questions and answers are stored on a Google Sheets spreadsheet. A Google Form is set up allowing staff members and community contributors to submit trivia which will be manually moved to the spreadsheet when approved.

## Manual Trivia Switch
The Administrators can manually enable and disable trivia defending. This will be used when IWD ocassionaly offers the belt for Indie predictions.

## Manual Defense
The Administrators can manually force a title defence if the current champion is actively avoiding talk in wrestling channels or is inactive for an extended period of time.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
