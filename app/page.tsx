'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

/* ---------- edit the invite here ---------- */
const INVITE = {
  intro: "YOU'RE INVITED",
  tagline: 'ONE NIGHT ONLY',
  address: 'Philitelaan 67-47, Eindhoven',
  headline: ["CORALIE'S", 'BDAY PARTY'],
  meta: [
    ['DATE', '17/11/26'],
    ['TIME', '19:00'],
    ['RECEIPT', '#171126'],
    ['HOST', 'CORALIE'],
    ['GUEST', 'YOU'],
    ['ENTRY', 'FREE'],
  ],
  items: [
    ['1', 'CORALIE THEME', '0,00'],
    ['∞', 'FOOD', '0,00'],
    ['∞', 'DRINKS', '0,00'],
    ['1', 'DANCEFLOOR', '0,00'],
    ['1', 'GOOD MEMORIES', '0,00'],
  ],
  subtotal: '0,00',
  tax: '0,00',
  total: '€0,00',
  paid: 'PAID: GOOD VIBES ONLY',
  highlight: '17 NOV · 7PM – 11PM',
  note: 'Dress code: ur coolest fit.',
  stamp: '17/11/26',
  serial: '1711 2026 CORA 0019',
  thanks: 'THANK YOU!',
  // used by the calendar + maps buttons
  event: {
    title: "Coralie's Bday Party",
    place: 'Philitelaan 67-47, Eindhoven',
    details: 'Coralie themed bday. Food and drinks included. Dress code: ur coolest fit.',
    startUtc: '20261117T180000Z', // 19:00 Amsterdam
    endUtc: '20261117T220000Z', // 23:00 Amsterdam
  },
};

/* ---------- open the right app on each phone ---------- */
type Platform = 'ios' | 'android' | 'other';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPads report themselves as Macs, so also check for a touch screen
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

function links(platform: Platform) {
  const { title, place, details, startUtc, endUtc } = INVITE.event;
  const q = encodeURIComponent(place);

  // iPhone: the .ics opens Apple's "Add to Calendar" sheet.
  // Android: Google Calendar's event screen (opens the app if installed).
  // Desktop: the .ics downloads and opens in Outlook / Calendar.
  const calendar =
    platform === 'android'
      ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startUtc}/${endUtc}&location=${q}&details=${encodeURIComponent(details)}`
      : '/party.ics';

  // iPhone: Apple Maps. Android + desktop: Google Maps (opens the app on Android).
  const maps =
    platform === 'ios'
      ? `https://maps.apple.com/?q=${q}`
      : `https://www.google.com/maps/search/?api=1&query=${q}`;

  return { calendar, maps };
}

const PAPER = '#f8f7f3';
const INK = '#1f1f1f';
const LIME = '#d1fb53';

/* ---------- styles that are too fiddly for class names ---------- */
const noise = (opacity: number) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${opacity} 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const bg: CSSProperties = {
  background: 'radial-gradient(80% 55% at 50% 28%, #1c1c1c 0%, #0d0d0d 60%, #050505 100%) #0a0a0a',
};

// light chrome housing, like the Studio V27 reference
const housing: CSSProperties = {
  background: 'linear-gradient(180deg, #fafafa 0%, #e2e2e2 20%, #c4c4c4 55%, #a5a5a5 85%, #8a8a8a 100%)',
  boxShadow: [
    'inset 0 2px 1px rgba(255,255,255,.95)',
    'inset 0 -3px 5px rgba(0,0,0,.25)',
    'inset 8px 0 10px -8px rgba(0,0,0,.35)',
    'inset -8px 0 10px -8px rgba(0,0,0,.35)',
    '0 22px 30px -12px rgba(0,0,0,.9)',
  ].join(', '),
};
const slit: CSSProperties = {
  background: 'linear-gradient(180deg, #000 0%, #262626 100%)',
  boxShadow: '0 1px 0 rgba(255,255,255,.8), inset 0 2px 3px rgba(0,0,0,.8)',
};

// thermal paper: warm off-white, soft curl bands, a faint crease, grain on top
const paper: CSSProperties = {
  backgroundColor: PAPER,
  backgroundImage: [
    noise(0.22),
    'linear-gradient(90deg, rgba(0,0,0,.06), transparent 4%, transparent 96%, rgba(0,0,0,.06))',
    'linear-gradient(180deg, transparent 61.8%, rgba(0,0,0,.035) 62%, rgba(255,255,255,.6) 62.4%, transparent 63%)',
    `linear-gradient(180deg, #e4e3df 0%, ${PAPER} 7%, #fdfdfb 28%, #f1f0ec 52%, #fdfdfb 78%, ${PAPER} 100%)`,
  ].join(', '),
};
// serrated tear-off edge
const teeth: CSSProperties = {
  background: `conic-gradient(from -45deg at 50% 100%, ${PAPER} 90deg, transparent 0) 0 0 / 12px 100% repeat-x`,
};
// shadow where the paper comes out from under the slot
const exitShade: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.1) 35%, transparent 100%)',
};
const dashed: CSSProperties = {
  background: `repeating-linear-gradient(90deg, ${INK} 0 4px, transparent 4px 7px)`,
};
// highlighter swipe
const marker: CSSProperties = {
  background: `linear-gradient(100deg, transparent 1%, ${LIME} 3%, ${LIME} 96%, transparent 99%)`,
  boxDecorationBreak: 'clone',
  WebkitBoxDecorationBreak: 'clone',
};

/* ---------- small pieces ---------- */
function Rule({ className = 'my-4' }: { className?: string }) {
  return <div className={`h-px opacity-80 ${className}`} style={dashed} />;
}

function Logo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 91.46" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M21.56 4.39 L19.65 5.47 L16.75 7.71 L10.95 13.52 L8.71 16.50 L7.21 18.99 L5.89 20.81 L3.73 25.21 L2.99 27.53 L2.07 29.52 L1.49 32.34 L0.83 34.33 L0.17 39.88 L0.00 44.61 L0.17 47.60 L0.91 53.32 L1.74 55.80 L2.24 58.04 L2.90 59.54 L3.48 61.53 L6.22 67.00 L8.96 71.14 L12.44 75.37 L15.09 78.11 L19.90 82.01 L25.62 85.66 L27.20 86.32 L28.94 87.31 L30.60 87.81 L32.17 88.56 L33.67 88.89 L35.99 89.80 L39.55 90.46 L42.37 91.21 L44.86 91.46 L55.39 91.46 L58.46 91.13 L63.85 89.97 L66.25 89.05 L68.08 88.64 L71.14 87.40 L77.03 84.41 L81.84 81.01 L85.57 77.86 L87.48 75.95 L90.55 72.39 L94.11 67.16 L97.01 61.36 L97.60 59.45 L98.34 57.88 L98.84 55.39 L99.92 51.49 L100.00 36.90 L99.50 33.91 L99.00 32.50 L98.42 29.77 L97.60 27.86 L97.10 25.95 L94.36 20.48 L90.38 14.68 L88.39 12.27 L84.41 8.29 L81.09 5.64 L79.02 4.23 L76.70 3.07 L75.62 2.74 L70.65 1.66 L67.33 1.33 L65.17 0.83 L61.77 0.83 L59.20 0.17 L57.88 0.00 L44.20 0.08 L42.37 0.41 L40.13 0.50 L37.81 1.08 L33.42 1.49 L30.02 2.32 L26.78 2.82 L24.46 3.65ZM81.01 11.11 L81.43 11.69 L81.51 12.19 L81.26 20.40 L80.93 23.63 L81.01 24.46 L81.26 24.96 L81.67 25.37 L83.00 26.12 L85.49 26.70 L88.23 27.78 L89.80 28.11 L91.46 28.77 L93.12 29.19 L93.62 29.52 L93.70 30.10 L92.95 30.76 L91.54 31.51 L89.80 31.92 L87.98 32.75 L85.90 33.25 L84.00 34.08 L82.17 34.58 L81.43 34.91 L80.76 35.49 L80.35 36.40 L80.18 37.31 L80.18 40.13 L79.77 48.18 L79.60 48.84 L79.19 49.34 L78.28 49.17 L77.61 48.51 L71.81 39.72 L71.31 39.22 L70.56 38.89 L69.40 39.05 L65.09 40.80 L62.85 41.38 L60.70 42.29 L58.37 42.95 L57.63 42.95 L57.38 42.70 L57.38 42.29 L57.96 40.96 L63.85 33.25 L65.26 31.09 L65.26 30.27 L65.01 29.68 L58.79 20.56 L58.29 19.65 L58.37 18.99 L59.12 18.66 L59.95 18.74 L62.27 19.65 L64.26 20.07 L66.00 20.81 L68.41 21.39 L70.23 22.14 L71.64 22.14 L73.22 20.73 L79.68 11.86 L80.43 11.11Z"
      />
    </svg>
  );
}

/** Decorative barcode; seeded so server and client render the same bars. */
function Barcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    let s = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const rand = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
    return Array.from({ length: 84 }, () => ({
      bar: 1 + Math.floor(rand() * 3.4),
      gap: 1 + Math.floor(rand() * 2),
    }));
  }, [seed]);

  return (
    <div className="flex h-16 w-full opacity-90" aria-hidden="true">
      {bars.map((b, i) => (
        <span key={i} className="contents">
          <span className="block" style={{ flexGrow: b.bar, background: INK }} />
          {i < bars.length - 1 && <span className="block" style={{ flexGrow: b.gap }} />}
        </span>
      ))}
    </div>
  );
}

/* ---------- printer sound (plays once the browser allows audio) ---------- */
function usePrinterSound() {
  const audio = useRef<{ ctx: AudioContext; buffer: AudioBuffer } | null>(null);

  const get = useCallback(() => {
    if (audio.current) return audio.current;
    const Ctx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    audio.current = { ctx, buffer };
    return audio.current;
  }, []);

  const unlock = useCallback(() => {
    const a = get();
    if (a?.ctx.state === 'suspended') void a.ctx.resume();
  }, [get]);

  const tick = useCallback((ms: number) => {
    const a = audio.current;
    if (!a || a.ctx.state !== 'running') return;
    const { ctx, buffer } = a;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400 + Math.random() * 900;
    filter.Q.value = 1.4;
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t);
    src.stop(t + ms / 1000 + 0.02);
  }, []);

  // browsers block sound until the visitor interacts with the page
  useEffect(() => {
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, unlock, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, [unlock]);

  return { tick, unlock };
}

/* ---------- helpers ---------- */
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const tween = (from: number, to: number, ms: number, onUpdate: (v: number) => void) =>
  new Promise<void>((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      onUpdate(from + (to - from) * (1 - (1 - t) ** 2));
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });

/* ---------- page ---------- */
export default function Invite() {
  const receiptRef = useRef<HTMLElement>(null);
  const printerRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const printId = useRef(0);
  const [done, setDone] = useState(false);
  const [platform, setPlatform] = useState<Platform>('other');
  useEffect(() => setPlatform(detectPlatform()), []);
  const { calendar, maps } = links(platform);
  const onPhone = platform !== 'other';
  const { tick, unlock } = usePrinterSound();

  // make the headline lines fill the box width
  const fitTitle = useCallback(() => {
    const title = titleRef.current;
    if (!title) return;
    title.style.fontSize = '100px';
    const widest = Math.max(...[...title.children].map((l) => l.getBoundingClientRect().width));
    title.style.fontSize = `${(100 * title.clientWidth) / widest}px`;
  }, []);

  const print = useCallback(async () => {
    const receipt = receiptRef.current;
    const printer = printerRef.current;
    const shade = shadeRef.current;
    if (!receipt || !printer || !shade) return;

    const id = ++printId.current;
    const height = receipt.offsetHeight;
    const setPos = (fed: number) => {
      receipt.style.transform = `translateY(${fed - height}px)`;
      // only show the exit shadow once there's paper under it
      shade.style.opacity = String(Math.min(1, fed / 50));
    };

    setDone(false);
    setPos(0);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPos(height);
      setDone(true);
      return;
    }

    await wait(700); // a beat before the printer wakes up
    if (id !== printId.current) return;

    const buzz = printer.animate(
      [
        { transform: 'translate(0, 0)' },
        { transform: 'translate(.5px, -.3px)' },
        { transform: 'translate(-.5px, .3px)' },
        { transform: 'translate(0, 0)' },
      ],
      { duration: 90, iterations: Infinity },
    );

    const chunks = 42;
    let fed = 0;
    while (fed < height) {
      if (id !== printId.current) {
        buzz.cancel();
        return;
      }
      const step = Math.min(height - fed, (height / chunks) * (0.7 + Math.random() * 0.6));
      const ms = 55 + Math.random() * 35;
      tick(ms);
      await tween(fed, fed + step, ms, setPos);
      fed += step;
      // tiny stutter between feeds, sometimes a longer "thinking" pause
      await wait(Math.random() < 0.08 ? 180 + Math.random() * 160 : 18 + Math.random() * 40);
    }
    buzz.cancel();
    setPos(height);

    await wait(250);
    if (id === printId.current) setDone(true);
  }, [tick]);

  // print on load, once the fonts are in (so the headline measures correctly)
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      fitTitle();
      void print();
    });
    return () => {
      cancelled = true;
      printId.current++; // stops a print that's mid-way
    };
  }, [fitTitle, print]);

  // keep the headline fitted when the screen size changes
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fitTitle();
        if (done && receiptRef.current) receiptRef.current.style.transform = 'translateY(0)';
      }, 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [done, fitTitle]);

  const button =
    'rounded-full px-5 py-3.5 font-display text-xs font-bold uppercase leading-none tracking-[.08em] transition duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white';

  return (
    <main className="min-h-dvh overflow-x-hidden font-mono antialiased" style={{ ...bg, color: INK }}>
      <div className="flex flex-col items-center px-4 pb-16 pt-12 sm:pt-16">
        <p className="mb-8 font-display text-xs font-bold tracking-[.45em] text-white/60">{INVITE.intro}</p>

        {/* chrome printer housing with the slot */}
        <div
          ref={printerRef}
          aria-hidden="true"
          className="relative z-20 h-16 w-[440px] max-w-[94vw] rounded-2xl"
          style={housing}
        >
          <div className="absolute inset-x-8 bottom-5 h-2 rounded-full" style={slit} />
        </div>

        {/* the feed clips the receipt so it looks like it comes out of the slot;
            side and bottom padding leave room for the drop shadow */}
        <div className="relative z-10 -mt-6 overflow-hidden px-8 pb-14">
          <div
            ref={shadeRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 z-10 h-16 opacity-0"
            style={exitShade}
          />

          <article
            ref={receiptRef}
            aria-label="Birthday invitation"
            className="relative w-[360px] max-w-[82vw] will-change-transform [filter:drop-shadow(0_2px_2px_rgba(0,0,0,.4))_drop-shadow(0_20px_24px_rgba(0,0,0,.6))] [transform:translateY(-100%)]"
          >
            <div className="px-7 pb-7 pt-12 text-[12.5px] leading-[1.6] tracking-[.01em] sm:px-9" style={paper}>
              {/* store header */}
              <div className="flex flex-col items-center text-center">
                <Logo className="block w-14" />
                <p className="mt-3 font-display text-[12px] font-extrabold tracking-[.4em]">{INVITE.tagline}</p>
              </div>

              <Rule className="mb-5 mt-5" />

              {/* headline box, like the Studio V27 receipt */}
              <div className="border-2 px-4 pb-4 pt-5" style={{ borderColor: INK }}>
                <h1 ref={titleRef} className="font-headline text-[56px] font-bold uppercase leading-[.92] tracking-[-.02em]">
                  {INVITE.headline.map((line) => (
                    <span key={line} className="mx-auto block w-max whitespace-nowrap">
                      {line}
                    </span>
                  ))}
                </h1>
              </div>

              <Rule className="mb-4 mt-5" />

              {/* receipt meta in two columns */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11.5px]">
                {INVITE.meta.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <dt>{k}:</dt>
                    <dd className="font-bold">{v}</dd>
                  </div>
                ))}
              </dl>

              <Rule className="mb-3 mt-4" />

              {/* line items */}
              <div className="grid grid-cols-[2em_1fr_auto] gap-x-2 text-[11px] font-bold">
                <span>QTY</span>
                <span>ITEM</span>
                <span className="text-right">EUR</span>
              </div>
              <ul className="mt-1.5 space-y-0.5">
                {INVITE.items.map(([qty, item, price]) => (
                  <li key={item} className="grid grid-cols-[2em_1fr_auto] gap-x-2">
                    <span>{qty}</span>
                    <span>{item}</span>
                    <span className="text-right">{price}</span>
                  </li>
                ))}
              </ul>

              <Rule className="mb-3 mt-4" />

              <ul className="space-y-0.5">
                <li className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>{INVITE.subtotal}</span>
                </li>
                <li className="flex justify-between">
                  <span>BTW 21%</span>
                  <span>{INVITE.tax}</span>
                </li>
                <li className="mt-1.5 flex items-baseline justify-between font-display text-[17px] font-extrabold">
                  <span>TOTAL</span>
                  <span>{INVITE.total}</span>
                </li>
              </ul>
              <p className="mt-1.5 text-[11px]">{INVITE.paid}</p>

              {/* double rule like the Maison Chic receipt */}
              <div className="mb-5 mt-5 border-y-[1.5px] py-[2px]" style={{ borderColor: INK }} />

              <p className="text-center font-display text-[15px] font-extrabold tracking-[.04em]">
                <span className="px-1.5 py-0.5" style={marker}>
                  {INVITE.highlight}
                </span>
              </p>
              <p className="mt-2 text-center text-[11.5px]">{INVITE.address}</p>

              <p className="mt-5 text-center font-display text-[14px] font-extrabold leading-snug">{INVITE.note}</p>

              <p className="mb-3 mt-6 whitespace-pre text-center tracking-[.06em]">
                {`########  ${INVITE.stamp}  ########`}
              </p>
              <Barcode seed={`CORALIE-${INVITE.stamp}`} />
              <p className="mt-1.5 text-center text-[10.5px] tracking-[.3em]">{INVITE.serial}</p>

              <p className="mt-5 text-center font-display text-[17px] font-extrabold italic tracking-[.06em]">
                {INVITE.thanks}
              </p>
            </div>

            {/* serrated tear-off edge */}
            <div aria-hidden="true" className="h-2" style={teeth} />
          </article>
        </div>

        {/* shows once the receipt is fully printed */}
        <nav
          className={`-mt-6 flex flex-wrap justify-center gap-2.5 transition duration-500 ${
            done ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2.5 opacity-0'
          }`}
        >
          <a
            href={calendar}
            // no download attribute: on iPhone that would save the file instead of opening Calendar
            {...(platform === 'android' && { target: '_blank', rel: 'noopener noreferrer' })}
            className={`${button} text-[#111] hover:brightness-110`}
            style={{ background: LIME }}
          >
            Add to calendar
          </a>
          <a
            href={maps}
            // on phones, open straight in the maps app; on desktop, a new tab
            {...(!onPhone && { target: '_blank', rel: 'noopener noreferrer' })}
            className={`${button} text-[#111] hover:brightness-110`}
            style={{ background: LIME }}
          >
            Open in maps
          </a>
          <button
            type="button"
            onClick={() => {
              unlock();
              void print();
            }}
            className={`${button} cursor-pointer text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.7)] hover:bg-white hover:text-[#111]`}
          >
            Print again
          </button>
        </nav>
      </div>
    </main>
  );
}