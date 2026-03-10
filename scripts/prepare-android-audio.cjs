const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const SOURCE_DIR = path.join(__dirname, '../public/assets/audio');
const DEST_DIR = path.join(__dirname, '../android/app/src/main/res/raw');

const internetTones = [
    "https://www.islamcan.com/audio/adhan/azan1.mp3",
    "https://www.islamcan.com/audio/adhan/azan2.mp3",
    "https://www.islamcan.com/audio/adhan/azan3.mp3",
    "https://www.islamcan.com/audio/adhan/azan4.mp3",
    "https://www.islamcan.com/audio/adhan/azan5.mp3",
    "https://www.islamcan.com/audio/adhan/azan6.mp3",
    "https://www.islamcan.com/audio/adhan/azan7.mp3",
    "https://www.islamcan.com/audio/adhan/azan8.mp3",
    "https://www.islamcan.com/audio/adhan/azan9.mp3",
    "https://www.islamcan.com/audio/adhan/azan10.mp3"
];

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)) {
            resolve();
            return;
        }
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

async function prepareAudio() {
    console.log('--- Starting Audio Preparation ---');
    
    if (!fs.existsSync(SOURCE_DIR)) {
        console.log(`Creating directory: ${SOURCE_DIR}`);
        fs.mkdirSync(SOURCE_DIR, { recursive: true });
    }

    console.log('Downloading missing audio files (this may take a moment)...');
    for (const url of internetTones) {
        const filename = url.split('/').pop();
        const dest = path.join(SOURCE_DIR, filename);
        try {
            await downloadFile(url, dest);
            console.log(`Ready: ${filename}`);
        } catch (e) {
            console.error(`Failed to download ${filename}:`, e);
        }
    }

    try {
        if (!fs.existsSync(DEST_DIR)) {
            fs.mkdirSync(DEST_DIR, { recursive: true });
        }
        
        const files = fs.readdirSync(SOURCE_DIR);
        files.forEach(file => {
            if (file.endsWith('.mp3') || file.endsWith('.wav')) {
                const sourcePath = path.join(SOURCE_DIR, file);
                let destFilename = file.toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_.]/g, '');
                    
                if (/^\d/.test(destFilename)) {
                    destFilename = 'sound_' + destFilename;
                }

                const destPath = path.join(DEST_DIR, destFilename);
                fs.copyFileSync(sourcePath, destPath);
                console.log(`Copied: ${file} -> res/raw/${destFilename}`);
            }
        });
    } catch (e) {
        console.warn(`Warning: Could not copy to Android dir. This is normal if the Android platform is not added yet.`);
    }
    
    console.log('--- Audio Preparation Complete ---');
}

prepareAudio();
