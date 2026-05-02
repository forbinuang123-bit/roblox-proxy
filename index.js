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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
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
