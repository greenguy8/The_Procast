import {
    SlashCommandBuilder,
    MessageFlags,
    PermissionFlagsBits,
} from 'discord.js';

import {
    successEmbed,
    errorEmbed,
} from '../../utils/embeds.js';

import { logger } from '../../utils/logger.js';
import { handleInteractionError } from '../../utils/errorHandler.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('message')
        .setDescription('Send a custom message through the bot')

        .addStringOption(option =>
            option.setName('content')
                .setDescription('Message content')
                .setRequired(true)
        )

        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the message in')
                .setRequired(false)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        const deferSuccess =
            await InteractionHelper.safeDefer(
                interaction,
                {
                    flags: MessageFlags.Ephemeral
                }
            );

        if (!deferSuccess) {
            logger.warn(`Message interaction defer failed`, {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                commandName: 'message'
            });

            return;
        }

        try {

            const content =
                interaction.options.getString('content');

            const channel =
                interaction.options.getChannel('channel')
                || interaction.channel;

            await channel.send({
                content,
                allowedMentions: {
                    parse: [],
                },
            });

            await InteractionHelper.safeEditReply(
                interaction,
                {
                    content: '✅ Message sent successfully!',
                }
            );

        } catch (error) {

            await handleInteractionError(
                interaction,
                error,
                {
                    type: 'command',
                    commandName: 'message'
                }
            );
        }
    },
};
