import * as fs from "fs";
import * as path from "path";
import { REST, Routes } from "discord.js";

import { config } from "dotenv";

config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;

if (!DISCORD_BOT_TOKEN || !GUILD_ID || !CLIENT_ID) {
  throw new Error("Missing environment variables");
}

(async () => {
  const commands: string[] = [];

  const commandsPath = path.join(__dirname, "commands");

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    const command = (await import(filePath)).default;

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`The command ${filePath} has missing properties`);
    }
  }
  console.log({ commands });

  const rest = new REST().setToken(DISCORD_BOT_TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    console.log("Finished refreshing application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
