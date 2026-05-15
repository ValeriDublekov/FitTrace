import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const soundsDir = path.resolve(process.cwd(), 'public/sounds');
const outputFile = path.resolve(process.cwd(), 'public/sounds.json');

try {
  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
  }

  const files = fs.readdirSync(soundsDir);
  const soundFiles = files.filter(file => {
    const lower = file.toLowerCase();
    return (lower.endsWith('.mp3') || lower.endsWith('.wav')) && !file.startsWith('.');
  });

  fs.writeFileSync(outputFile, JSON.stringify(soundFiles, null, 2));
  console.log(`✅ Generated sounds manifest: ${soundFiles.length} files found.`);
} catch (error) {
  console.error('❌ Failed to generate sounds manifest:', error);
  process.exit(1);
}
