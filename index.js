const express = require('express');
const axios = require('axios');
const app = express();

app.get('/gamepasses/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Step 1: Get all games by this user
        const gamesRes = await axios.get(
            `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50&sortOrder=Asc`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Referer': 'https://www.roblox.com/',
                    'User-Agent': 'Mozilla/5.0'
                },
                timeout: 10000
            }
        );

        const games = gamesRes.data.data || [];
        console.log(`Found ${games.length} games for user ${userId}`);

        // Step 2: For each game, fetch its gamepasses
        const allGamepasses = [];

        for (const game of games) {
            const universeId = game.id;
            try {
                const gpRes = await axios.get(
                    `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100&sortOrder=Asc`,
                    {
                        headers: {
                            'Accept': 'application/json',
                            'Referer': 'https://www.roblox.com/',
                            'User-Agent': 'Mozilla/5.0'
                        },
                        timeout: 10000
                    }
                );

                const passes = gpRes.data.data || [];
                console.log(`Game ${universeId} has ${passes.length} gamepasses`);

                for (const pass of passes) {
                    allGamepasses.push({
                        id: pass.id,
                        name: pass.name,
                        itemType: 'GamePass'
                    });
                }
            } catch (gpErr) {
                console.error(`Failed to fetch passes for game ${universeId}:`, gpErr.message);
            }
        }

        console.log(`Total gamepasses found: ${allGamepasses.length}`);
        res.json({ data: allGamepasses, nextPageCursor: null });

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data));
        }
        res.status(500).json({
            error: error.message,
            status: error.response ? error.response.status : 'no response'
        });
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Proxy running!'));
