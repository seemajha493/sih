import { transliterateToEnglish, normalizeIndicNumerals, normalizeRevenueTermToEnglish } from '../src/services/transliterationEngine';

function cleanBengaliValue(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\([^\)]*\)/g, '') // remove parenthetical annotations
    .replace(/(?:মৌজা|গ্রাম|থানা|জেলা|তারিখ|খতিয়ান|দাগ|জমির).*$/i, '') // remove adjacent inline labels
    .replace(/[\|\\\/:\-\.\,]+$/, '') // remove trailing punctuation
    .replace(/^[\|\\\/:\-\.\,]+/, '') // remove leading punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

const testText = `
সা 5 Br CT ১ So
ফর্মনং-৬ pil (খতিয়ান/জমির নথি)
3 পশ্চিমবঙ্গ সরকার
4 ভূমি ও ভূমি সংস্কার দপ্তর
জমির খতিয়ান
জেলা : নদীয়া (রাজস্ব রেকর্ডের অনুলিপি) মৌজা : বেলপুকুর
থানা : কোতোয়ালী গ্রাম : বেলপুকুর
খতিয়ান নং i ১২৩৪ তারিখ : ১৪/০৩/২০২৫
দ্বানা নং : ৫৬৭, ৫৬৮
মালিকের নাম : মহেশ চন্দ্র দাস
পিতার নাম : শ্রী হরিদাস দাস
ঠিকানা : বেলপুকুর, কৃষ্ণনগর, নদীয়া
জমির শ্রেণী : কৃষি জমি (ধান চাষের উপযোগী)
মোট জমির পরিমাণ: ১.২৫ একর (এক একর পঁচিশ শতক)
বর্তমান দখলদার : মহেশ চন্দ্র দাস
নথি নং: ৪৫/২০২৫
`;

const normalized = normalizeIndicNumerals(testText);

console.log('Normalized text:\n', normalized);

// 1. Owner Name
const ownerMatch = normalized.match(/(?:মালিকের\s*নাম|স্বত্বাধিকারীর\s*নাম|রৈयत|काश्तकार)\s*[:\-\|\.]*\s*([^\n\r\|\:]+)/i);
console.log('Owner:', ownerMatch ? transliterateToEnglish(cleanBengaliValue(ownerMatch[1])) : 'None');

// 2. Father Name
const fatherMatch = normalized.match(/(?:পিতার\s*নাম|পিতা\s*\/?\s*স্বামীর\s*নাম|Father)\s*[:\-\|\.]*\s*([^\n\r\|\:]+)/i);
console.log('Father:', fatherMatch ? transliterateToEnglish(cleanBengaliValue(fatherMatch[1])) : 'None');

// 3. Khatian
const khatianMatch = normalized.match(/(?:খতিয়ান\s*নং|খতিয়ান\s*নম্বর|Khatian)\s*[:\-\|\.i]*\s*([0-9\/\-]+)/i);
console.log('Khatian:', khatianMatch ? khatianMatch[1] : 'None');

// 4. Dag / Khasra
const dagMatch = normalized.match(/(?:দাগ\s*নং|দ্বানা\s*নং|দাগ\s*নম্বর|Khasra|Dag)\s*[:\-\|\.]*\s*([0-9\/\-,\s]+)/i);
console.log('Dag/Khasra:', dagMatch ? cleanBengaliValue(dagMatch[1]) : 'None');

// 5. Total Area
const areaMatch = normalized.match(/(?:মোট\s*জমির\s*পরিমাণ|জমির\s*পরিমাণ|আয়তন|Total\s*Area)\s*[:\-\|\.]*\s*([0-9\.]+\s*(?:একর|শতক|বিঘা|Acres|Decimal)?)/i);
console.log('Area:', areaMatch ? areaMatch[1] : 'None');

// 6. District
const distMatch = normalized.match(/(?:জেলা|District)\s*[:\-\|\.]*\s*([^\n\r\|\:]+)/i);
console.log('District:', distMatch ? transliterateToEnglish(cleanBengaliValue(distMatch[1])) : 'None');

// 7. Village / Mauza
const mauzaMatch = normalized.match(/(?:মৌজা|Mauza)\s*[:\-\|\.]*\s*([^\n\r\|\:]+)/i);
console.log('Mauza:', mauzaMatch ? transliterateToEnglish(cleanBengaliValue(mauzaMatch[1])) : 'None');

// 8. Police Station
const thanaMatch = normalized.match(/(?:থানা|Police\s*Station)\s*[:\-\|\.]*\s*([^\n\r\|\:]+)/i);
console.log('Police Station:', thanaMatch ? transliterateToEnglish(cleanBengaliValue(thanaMatch[1])) : 'None');

// 9. Registration / File No
const fileMatch = normalized.match(/(?:নথি\s*নং|দলিল\s*নং|রেজিস্ট্রেশন\s*নং)\s*[:\-\|\.]*\s*([0-9A-Za-z\/\-]+)/i);
console.log('File/Reg No:', fileMatch ? fileMatch[1] : 'None');

// 10. Date / Year
const dateMatch = normalized.match(/(?:তারিখ|সন|বছর|Date)\s*[:\-\|\.]*\s*([0-9]{1,2}[-\/][0-9]{1,2}[-\/](20[0-9]{2}|19[0-9]{2}))/i);
console.log('Date/Year:', dateMatch ? dateMatch[1] : 'None');

// 11. State
console.log('State:', /পশ্চিমবঙ্গ/i.test(normalized) ? 'West Bengal' : 'None');

// 12. Land Category
const catMatch = normalized.match(/(?:জমির\s*শ্রেণী|শ্রেণী|Land\s*Type)\s*[:\-\|\.]*\s*([^\n\r\|\:]+)/i);
console.log('Category:', catMatch ? normalizeRevenueTermToEnglish(cleanBengaliValue(catMatch[1])) : 'None');
