const express = require('express');
const axios = require('axios');
const app = express();

app.get('/gamepasses/:userId', async (req, res) => {
    const userId = req.params.userId;
    const cursor = req.query.cursor || '';
    try {
        let url = `https://catalog.roblox.com/v1/search/items?category=GamePass&creatorTargetId=${userId}&limit=30&sortOrder=Asc`;
        if (cursor) url += `&cursor=${cursor}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Proxy running!'));
