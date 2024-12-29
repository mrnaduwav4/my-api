const express = require('express');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');
const TikTokScraper = require('tiktok-scraper');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Base Route
app.get('/', (req, res) => {
    res.send('Welcome to the Media Downloader API! Use /youtube, /tiktok, or /facebook routes.');
});

// --- YouTube Downloader ---
app.get('/youtube', async (req, res) => {
    const { url, format } = req.query; // Pass `url` and `format` (mp3/mp4) as query parameters
    if (!url) return res.status(400).send('YouTube URL is required.');

    try {
        if (format === 'mp3') {
            const info = await ytdl.getInfo(url);
            const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            res.json({
                title: info.videoDetails.title,
                download: audioFormats[0].url,
            });
        } else {
            const videoStream = ytdl(url, { quality: 'highest' });
            res.setHeader('Content-Disposition', `attachment; filename="video.mp4"`);
            videoStream.pipe(res);
        }
    } catch (error) {
        res.status(500).send('Error downloading YouTube video: ' + error.message);
    }
});

// --- TikTok Downloader ---
app.get('/tiktok', async (req, res) => {
    const { url } = req.query; // Pass `url` as a query parameter
    if (!url) return res.status(400).send('TikTok URL is required.');

    try {
        const videoMeta = await TikTokScraper.getVideoMeta(url);
        res.json({
            title: videoMeta.collector[0].text,
            download: videoMeta.collector[0].videoUrl,
        });
    } catch (error) {
        res.status(500).send('Error downloading TikTok video: ' + error.message);
    }
});

// --- Facebook Downloader ---
app.get('/facebook', async (req, res) => {
    const { url } = req.query; // Pass `url` as a query parameter
    if (!url) return res.status(400).send('Facebook URL is required.');

    try {
        // Example using a public API (replace with your API or library)
        const apiUrl = `https://api.example.com/facebook?url=${encodeURIComponent(url)}`; // Replace with a real API
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.error) return res.status(400).send(data.error);
        res.json({
            title: data.title || 'Facebook Video',
            download: data.downloadUrl,
        });
    } catch (error) {
        res.status(500).send('Error downloading Facebook video: ' + error.message);
    }
});

// Start Server
app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});
