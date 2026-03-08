const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, '../public/assets/audio');
// We assume the android project structure is standard
const DEST_DIR = path.join(__dirname, '../android/app/src/main/res/raw');

console.log('--- Starting Audio Preparation for Android ---');

// 1. Check if Source Exists
if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Error: Source directory not found at ${SOURCE_DIR}`);
    process.exit(1);
}

// 2. Create Destination Directory if it doesn't exist
// Note: The 'android' folder might not exist if 'npx cap add android' hasn't been run yet.
// We will try to create the path recursively.
try {
    if (!fs.existsSync(DEST_DIR)) {
        console.log(`Creating directory: ${DEST_DIR}`);
        fs.mkdirSync(DEST_DIR, { recursive: true });
    }
} catch (e) {
    console.warn(`Warning: Could not create ${DEST_DIR}. This is normal if the Android platform is not added yet.`);
    console.log('Skipping audio copy for now.');
    process.exit(0);
}

// 3. Copy and Rename Files
const files = fs.readdirSync(SOURCE_DIR);

files.forEach(file => {
    if (file.endsWith('.mp3') || file.endsWith('.wav')) {
        const sourcePath = path.join(SOURCE_DIR, file);
        
        // Android resources MUST be lowercase, numbers, and underscores only.
        // No spaces, no uppercase, no special chars.
        let destFilename = file.toLowerCase()
            .replace(/\s+/g, '_')       // Replace spaces with underscores
            .replace(/[^a-z0-9_.]/g, ''); // Remove non-alphanumeric chars (except dot)
            
        // Ensure it doesn't start with a number (Android rule)
        if (/^\d/.test(destFilename)) {
            destFilename = 'sound_' + destFilename;
        }

        const destPath = path.join(DEST_DIR, destFilename);

        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied: ${file} -> res/raw/${destFilename}`);
    }
});

console.log('--- Audio Preparation Complete ---');
