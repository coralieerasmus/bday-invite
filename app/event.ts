// Party details shared by the page (buttons) and the /calendar route (the .ics file).
export const EVENT = {
  title: "Coralie's Bday Party",
  place: 'Philitelaan 67-47, Eindhoven',
  details: 'Coralie themed bday. Food and drinks included. Dress code: ur coolest fit.',
  startUtc: '20261117T180000Z', // 19:00 Amsterdam
  endUtc: '20261117T220000Z', // 23:00 Amsterdam
};

const escape = (text: string) => text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');

export function buildIcs() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Coralie//Bday Invite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:coralie-bday-2026@coralieerasmus.com',
    `DTSTAMP:${stamp}`,
    `DTSTART:${EVENT.startUtc}`,
    `DTEND:${EVENT.endUtc}`,
    `SUMMARY:${escape(EVENT.title)}`,
    `LOCATION:${escape(EVENT.place)}`,
    `DESCRIPTION:${escape(EVENT.details)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(EVENT.title)} is tomorrow`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}