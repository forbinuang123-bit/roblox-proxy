const express = require('express');
const axios = require('axios');
const app = express();

app.get('/gamepasses/:userId', async (req, res) => {
    const userId = req.params.userId;
    const cursor = req.query.cursor || '';

    try {
        let url = `https://catalog.roblox.com/v1/search/items?category=GamePass&creatorTargetId=${userId}&creatorType=User&limit=30&sortOrder=Asc`;
        if (cursor) url += `&cursor=${cursor}`;

        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'Referer': 'https://www.roblox.com/',
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 10000
        });

        const items = response.data.data || [];

        // Filter only GamePass itemType and fetch details for each
        const gamepasses = [];
        for (const item of items) {
            try {
                const detailRes = await axios.get(
                    `https://economy.roblox.com/v2/game-passes/${item.id}/product-info`,
                    {
                        headers: {
                            'Accept': 'application/json',
                            'Referer': 'https://www.roblox.com/',
                            'User-Agent': 'Mozilla/5.0'
                        },
                        timeout: 5000
                    }
                );
                const detail = detailRes.data;
                if (detail && detail.IsForSale) {
                    gamepasses.push({
                        id: item.id,
                        name: detail.Name,
                        price: detail.PriceInRobux || 0,
                        itemType: 'GamePass'
                    });
                    console.log(`Added: ${detail.Name} - R$${detail.PriceInRobux}`);
                }
            } catch (detailErr) {
                console.error(`Failed detail fetch for ${item.id}:`, detailErr.message);
            }
        }

        res.json({
            data: gamepasses,
            nextPageCursor: response.data.nextPageCursor || null
        });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({
            error: error.message,
            status: error.response ? error.response.status : 'no response'
        });
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Proxy running!'));
