import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export type Command<I extends CommandInteraction = CommandInteraction> = {
  data: SlashCommandBuilder;
  execute: (interaction: I) => Promise<void>;
};

const pingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    console.log({ interaction });
    await interaction.reply("Pong!");
  },
};

export default pingCommand;
