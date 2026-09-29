import { cleanFieldValue, normalizeIndicNumerals, isUrduText } from '../src/services/fieldExtractor';

const rawOcrText = `Ir
| JE Jit ‏کی‎
‎12,005 fire, 58 2 : ‏ساموال‎ 2
; ‏ےم فرر زمین سہ‎
|

|
2

|

. ۱
12/08/2025 |

۱ ارشی نقشہ ‎nN‏ |
ہے و وت = 45/1 ‎i‏ 1
: 2 رد زین صرف ملومات کے لے ے۔ ٰ
‎of‏ 3 کی بھی تید بی کی صورت میں ضلق روورڈ | ‎fa‏ :
‎Heb SF ٦‏ :
‎ie‏ =
‎dirt |‏ 8 نز

نام2 فاقل اعد _٭ ‎iy‏

7 i

— ہے سے سڈ ‎ee‏ وی و کش شش ںہ — ‎ENE‏`;

console.log('Testing pattern matches on real Urdu OCR text:');

// 1. Owner Name
const ownerMatch = rawOcrText.match(/(?:نام\s*مالک|مالک\s*کا\s*نام|نام\s*کاشتکار|نام2?|نام)\s*[:\-\|\.0-9]*\s*([\u0600-\u06FF\s]+)/i);
console.log('Owner match:', ownerMatch ? ownerMatch[1].trim() : 'NONE');

// 2. Khasra Number
const khasraMatch = rawOcrText.match(/(?:خسرہ\s*نمبر|خسرہ|Khasra)[^\n\r]*?([0-9]+\/[0-9]+)/i) ||
                    rawOcrText.match(/(?:[=\s\|\:]|^)([0-9]{1,5}\/[0-9]{1,5})(?:[\s\|\:]|$)/m);
console.log('Khasra match:', khasraMatch ? khasraMatch[1].trim() : 'NONE');

// 3. Tehsil
const tehsilMatch = rawOcrText.match(/(?:تحصیل|سیل|سہیل)\s*[:\-\|\.0-9]*\s*([\u0600-\u06FF\s]+)/i) ||
                    rawOcrText.match(/(?:ساہیوال|ساموال|Sahiwal)/i);
console.log('Tehsil match:', tehsilMatch ? tehsilMatch[0].trim() : 'NONE');

// 4. Land Category / Type
const categoryMatch = rawOcrText.match(/(?:فرر\s*زمین|فرد\s*زمین|اراضی\s*نقشہ|ارشی\s*نقشہ|زرعی|سکنی|تجاری|Fard\s*Zameen)/i);
console.log('Category match:', categoryMatch ? categoryMatch[0].trim() : 'NONE');

// 5. Date / Record Year
const dateMatch = rawOcrText.match(/([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-](20[0-9]{2}|19[0-9]{2}))/i) ||
                  rawOcrText.match(/(20[0-9]{2}|19[0-9]{2})/);
console.log('Date/Year match:', dateMatch ? dateMatch[1].trim() : 'NONE');
