import {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from "discord.js";

import botConfig from "../config/botConfig.js";

export default {
  data: new SlashCommandBuilder()
    .setName("message")
    .setDescription("Send a custom message through the bot")

    .addStringOption(option =>
      option
        .setName("content")
        .setDescription("Message content")
        .setRequired(true)
    )

    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("Channel to send message in")
        .setRequired(false)
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    ),

  async execute(interaction) {

    // Optional owner-only check
    if (
      !botConfig.commands.owners.includes(
        interaction.user.id
      )
    ) {
      return interaction.reply({
        content: "You cannot use this command.",
        ephemeral: true,
      });
    }

    const content =
      interaction.options.getString("content");

    const channel =
      interaction.options.getChannel("channel") ||
      interaction.channel;

    try {

      await channel.send({
        content,
        allowedMentions: {
          parse: [],
        },
      });

      await interaction.reply({
        content: `✅ Message sent in ${channel}`,
        ephemeral: true,
      });

    } catch (error) {

      console.error(error);

      await interaction.reply({
        content: "❌ Failed to send message.",
        ephemeral: true,
      });
    }
  },
};
