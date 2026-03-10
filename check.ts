import https from 'https';

const urls = [
    "https://www.islamcan.com/audio/adhan/azan4.mp3",
    "https://www.islamcan.com/audio/adhan/azan5.mp3",
    "https://www.islamcan.com/audio/adhan/azan6.mp3",
    "https://www.islamcan.com/audio/adhan/azan7.mp3",
    "https://www.islamcan.com/audio/adhan/azan8.mp3",
    "https://www.islamcan.com/audio/adhan/azan9.mp3",
    "https://www.islamcan.com/audio/adhan/azan10.mp3",
    "https://www.islamcan.com/audio/adhan/azan-makkah.mp3",
    "https://www.islamcan.com/audio/adhan/azan-madina.mp3",
    "https://www.islamcan.com/audio/adhan/azan-fajr.mp3",
    "https://www.islamcan.com/audio/adhan/azan-abdul-basit.mp3"
];

urls.forEach(url => {
    https.get(url, (res) => {
        console.log(`${url}: ${res.statusCode}`);
    }).on('error', (e) => {
        console.error(`${url}: ERROR ${e.message}`);
    });
});
