const express = require('express');
const axios = require('axios');
const app = express();

app.get('/gamepasses/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Step 1: Get all experiences created by this user
        const gamesRes = await axios.get(
            `https://games.roblox.com/v2/users/${userId}/games?accessFilter=All&limit=50&sortOrder=Asc`,
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
        console.log('Games:', JSON.stringify(games.map(g => ({ id: g.id, name: g.name }))));

        const allGamepasses = [];

        // Step 2: For each experience, get its gamepasses
        for (const game of games) {
            try {
                const gpRes = await axios.get(
                    `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100&sortOrder=Asc`,
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
                console.log(`Game "${game.name}" (${game.id}): ${passes.length} gamepasses`);

                for (const pass of passes) {
                    console.log(`  - ${pass.name} R$${pass.price}`);
                    allGamepasses.push({
                        id: pass.id,
                        name: pass.name,
                        price: pass.price || 0,
                        itemType: 'GamePass'
                    });
                }
            } catch (gpErr) {
                console.error(`Failed passes for game ${game.id}:`, gpErr.message);
            }
        }

        console.log(`Total gamepasses: ${allGamepasses.length}`);
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
