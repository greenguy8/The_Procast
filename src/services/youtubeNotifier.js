import Parser from 'rss-parser';

const parser = new Parser();

const channels = [
    {
        channelId: 'UCAJOhO0NXlgV84WTZ9MxdhQ',
        discordChannelId: '1294402455731310602',
    },
    {
        channelId: 'UCYegilo_M5VOsc6Sy9vk91w',
        discordChannelId: '1294402455731310602',
    },
];

const latestVideos = new Map();

export async function startYouTubeNotifier(client) {

    console.log('YouTube notifier started');

    // Prevent announcing old videos
    for (const ytChannel of channels) {

        try {

            const feed = await parser.parseURL(
                `https://www.youtube.com/feeds/videos.xml?channel_id=${ytChannel.channelId}`
            );

            if (feed.items[0]) {

                latestVideos.set(
                    ytChannel.channelId,
                    feed.items[0].id
                );
            }

        } catch (error) {

            console.error(
                'Initial YouTube fetch failed:',
                error
            );
        }
    }

    setInterval(async () => {

        for (const ytChannel of channels) {

            try {

                const feed = await parser.parseURL(
                    `https://www.youtube.com/feeds/videos.xml?channel_id=${ytChannel.channelId}`
                );

                const latestVideo = feed.items[0];

                if (!latestVideo) continue;

                const savedVideo =
                    latestVideos.get(
                        ytChannel.channelId
                    );

                if (savedVideo === latestVideo.id) {
                    continue;
                }

                latestVideos.set(
                    ytChannel.channelId,
                    latestVideo.id
                );

                const discordChannel =
                    await client.channels.fetch(
                        ytChannel.discordChannelId
                    );

                if (!discordChannel) continue;

                await discordChannel.send({
                    content:
`📢 YOOOOO! Come check out the new video drop!!

**${latestVideo.title}**

${latestVideo.link}`
                });

            } catch (error) {

                console.error(
                    'YouTube notifier error:',
                    error
                );
            }
        }

    }, 300000);
}
