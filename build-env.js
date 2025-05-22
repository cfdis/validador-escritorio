require('dotenv').config();
const { execSync } = require('child_process');

try {
    execSync('electron-builder --win --publish always', {
        stdio: 'inherit',
        env: { ...process.env }
    });
} catch (e) {
    console.error('❌ Error building:', e);
}
