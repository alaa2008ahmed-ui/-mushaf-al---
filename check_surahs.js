
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/quran-uthmani.json', 'utf8'));

const surah95 = data.data.surahs.find(s => s.number === 95);
const surah97 = data.data.surahs.find(s => s.number === 97);

console.log('Surah 95 Ayah 1:', surah95.ayahs[0].text);
console.log('Surah 97 Ayah 1:', surah97.ayahs[0].text);
