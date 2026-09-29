import { cleanFieldValue } from '../src/services/fieldExtractor';

const line = 'ہے و وت = 45/1 i 1';
const pat = /(?:[=\s\|\:]|^)([0-9]{1,5}\/[0-9]{1,5})(?:[\s\|\:]|$)/m;
const match = line.match(pat);
console.log('Match on line:', match);
if (match) {
  console.log('cleanFieldValue(match[1]):', cleanFieldValue(match[1]));
}

const line2 = '12/08/2025 |';
const patYear = /(?:[0-9]{1,2}[\/-][0-9]{1,2}[\/-])(20[0-9]{2}|19[0-9]{2})/i;
const matchYear = line2.match(patYear);
console.log('Match year on line2:', matchYear);
