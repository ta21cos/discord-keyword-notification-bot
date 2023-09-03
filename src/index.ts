import * as fs from "node:fs";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import { Command } from "./commands/ping";
import path from "path";

config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;

(async () => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
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
    }
  });

  client.once(Events.ClientReady, (c) => {
    console.log(`Ready, logged in as ${c.user.tag} `);
  });

  client.login(TOKEN);

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
})();
