const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Paths to watch
const foldersToWatch = [
  path.join(__dirname, '../src/assets/images/Partners White Text Without Background'),
  path.join(__dirname, '../src/assets/images/Amyal PNG Partners')
];

console.log('👀 Watching partner image folders for changes...');
console.log('📁 Folders monitored:');
foldersToWatch.forEach(folder => console.log(`   - ${path.basename(folder)}`));
console.log('');

let timeoutId = null;

// Function to regenerate the constant file with debounce
function regenerateWithDebounce() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  
  timeoutId = setTimeout(() => {
    console.log('🔄 Changes detected! Regenerating partner images...');
    exec('node scripts/generate-partner-images.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`⚠️  ${stderr}`);
        return;
      }
      console.log(stdout);
      console.log('👀 Watching for more changes...\n');
    });
  }, 1000); // Wait 1 second after last change
}

// Watch each folder
foldersToWatch.forEach(folder => {
  if (fs.existsSync(folder)) {
    fs.watch(folder, { recursive: false }, (eventType, filename) => {
      if (filename && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(filename)) {
        console.log(`📝 ${eventType}: ${filename}`);
        regenerateWithDebounce();
      }
    });
  } else {
    console.warn(`⚠️  Warning: Folder does not exist: ${folder}`);
  }
});

// Keep the script running
process.on('SIGINT', () => {
  console.log('\n👋 Stopped watching partner images.');
  process.exit(0);
});
