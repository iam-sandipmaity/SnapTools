import fs from 'fs';
import { TIMEZONES } from '../src/data/timezones';

const outputPath = './public/timezones.json';
const data = { timezones: TIMEZONES };

fs.writeFileSync(outputPath, JSON.stringify(data));

console.log(`✅ Exported ${TIMEZONES.length} timezones to ${outputPath}`);
console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
