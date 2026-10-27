import { buildIcs } from '../event';

// Serves the invite as a calendar file at /calendar.
// The text/calendar type is what makes iPhones show the "Add to Calendar" screen.
export function GET() {
  return new Response(buildIcs(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="coralie-bday.ics"',
      'Cache-Control': 'no-store',
    },
  });
}