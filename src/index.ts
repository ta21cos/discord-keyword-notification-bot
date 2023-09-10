import * as fs from "node:fs";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import { Command } from "./commands/ping";
import path from "path";
import http from "http";

config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
export const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;

if (!TOKEN || !TARGET_CHANNEL_ID) {
  throw new Error("Missing environment variables");
}

const setup = async () => {
  console.log("Setting up discord.js client");
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    allowedMentions: { parse: ["users", "roles"] },
  });

  client.login(TOKEN);

  const commands = new Collection<string, Command>();

  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = await fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  commandFiles.map(async (file) => {
    const filePath = path.join(commandsPath, file);
    const command = (await import(filePath)).default;

    if ("data" in command && "execute" in command) {
      commands.set(command.data.name, command);
      console.log(`Loaded command ${command.data.name}`);
    }
  });

  const eventsPath = path.join(__dirname, "events");
  const eventFiles = await fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts"));

  eventFiles.map(async (file) => {
    const filePath = path.join(eventsPath, file);
    const event = (await import(filePath)).default;

    console.log(`Loaded event ${event.name}`);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  });

  client.once(Events.ClientReady, (c) => {
    console.log(`Ready, logged in as ${c.user.tag} `);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
      console.error(`No commands like ${interaction.commandName} found`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  });
};

setup();

// Required for health check of Cloud Run
// ref: https://emilwypych.com/2020/10/25/how-to-run-discord-bot-on-cloud-run/?cn-reloaded=1
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Just for testing purpose\n");
});

server.listen(process.env.PORT || 8080, () => {
  console.log("Server started");
});
