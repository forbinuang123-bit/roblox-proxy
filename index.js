const express = require('express');
const axios = require('axios');
const app = express();

app.get('/gamepasses/:userId', async (req, res) => {
    const userId = req.params.userId;
    const cursor = req.query.cursor || '';

    try {
        let url = `https://inventory.roblox.com/v1/users/${userId}/items/GamePass?limit=100`;
        if (cursor) url += `&cursor=${cursor}`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://www.roblox.com/',
                'Origin': 'https://www.roblox.com'
            },
            timeout: 10000
        });

        res.json(response.data);

    } catch (error) {
        console.error('Error fetching gamepasses:', error.message);
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
