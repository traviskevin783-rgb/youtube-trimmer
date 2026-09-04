const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

app.post('/trim-video', async (req, res) => {
    const videoId = req.body.videoId;
    if (!videoId) return res.status(400).send('Missing videoId');

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const outputPath = path.join(__dirname, `output_${videoId}.mp4`);

    const command = `yt-dlp -f "best[ext=mp4]" -o - "${videoUrl}" | ffmpeg -i pipe:0 -ss 00:00:00 -t 00:05:00 -c copy "${outputPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution error: ${error}`);
            return res.status(500).send(error.message);
        }

        res.download(outputPath, 'trimmed_clip.mp4', (err) => {
            if (!err) {
                fs.unlinkSync(outputPath);
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));