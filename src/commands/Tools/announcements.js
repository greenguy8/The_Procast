import {
    SlashCommandBuilder,
    MessageFlags,
    PermissionFlagsBits,
    EmbedBuilder,
} from 'discord.js';

import { InteractionHelper } from '../../utils/interactionHelper.js';
import { handleInteractionError } from '../../utils/errorHandler.js';
import { logger } from '../../utils/logger.js';
import { getColor } from '../../config/bot.js';

export default {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Create a server announcement')

        .addStringOption(option =>
            option.setName('title')
                .setDescription('Announcement title')
                .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('message')
                .setDescription('Announcement message')
                .setRequired(true)
        )

        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to post announcement in')
                .setRequired(false)
        )

        .addBooleanOption(option =>
            option.setName('ping_everyone')
                .setDescription('Ping everyone?')
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
            logger.warn(`Announce interaction defer failed`, {
                userId: interaction.user.id,
                guildId: interaction.guildId,
            });

            return;
        }

        try {

            const title =
                interaction.options.getString('title');

            const message =
                interaction.options.getString('message');

            const channel =
                interaction.options.getChannel('channel')
                || interaction.channel;

            const pingEveryone =
                interaction.options.getBoolean('ping_everyone')
                || false;

            const embed = new EmbedBuilder()
                .setColor(getColor('primary'))
                .setTitle(`📢 ${title}`)
                .setDescription(message)
                .setTimestamp();

            await channel.send({
                content: pingEveryone ? '@everyone' : null,
                embeds: [embed],
                allowedMentions: {
                    parse: pingEveryone ? ['everyone'] : [],
                },
            });

            await InteractionHelper.safeEditReply(
                interaction,
                {
                    content: '✅ Announcement posted successfully!',
                }
            );

        } catch (error) {

            await handleInteractionError(
                interaction,
                error,
                {
                    type: 'command',
                    commandName: 'announce'
                }
            );
        }
    },
};
