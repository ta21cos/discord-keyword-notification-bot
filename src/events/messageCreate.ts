import { Events, Message } from "discord.js";
import { TARGET_CHANNEL_ID } from "..";
import GitHubToDiscordMap from "../../github-to-discord-map.json";

const event = {
  name: Events.MessageCreate,
  execute(message: Message) {
    console.log(`messageCreate event fired, ${message.content}`);
    if (message.channelId !== TARGET_CHANNEL_ID) {
      // not target channel
      return;
    }
    console.log(message.embeds?.[0]?.toJSON());
    const authorName = message.embeds?.[0]?.author?.name;
    console.log({ authorName });
    if (!authorName) {
      // not a github message
      return;
    }

    const discordUserId =
      GitHubToDiscordMap[authorName as keyof typeof GitHubToDiscordMap];
    console.log({ discordUserId });

    if (!discordUserId) {
      // unknown github user
      return;
    }

    message.channel.send({
      content: `<@${discordUserId}>`,
    });
  },
};

export default event;
