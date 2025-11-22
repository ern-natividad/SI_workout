const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const root = process.cwd();
    const dist = path.resolve(root, 'dist');
    const serverDist = path.resolve(root, 'server', 'dist');

    if (!fs.existsSync(dist)) {
      console.warn('No dist folder found at', dist, '- run `npm run build` first');
      process.exit(0);
    }

    // Ensure server/dist exists
    fs.mkdirSync(serverDist, { recursive: true });

    // Copy files recursively (simple implementation)
    const copyRecursive = (src, dest) => {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };

    copyRecursive(dist, serverDist);

    console.log('Copied dist ->', serverDist);
  } catch (err) {
    console.error('Failed to copy dist to server/dist', err);
    process.exit(1);
  }
})();
