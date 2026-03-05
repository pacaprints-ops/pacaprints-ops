// app/seasonal/page.tsx
// Seasonal planner (UK) with “prep by” dates + Ideas column.
// Lead time is used internally (leadDays) but NOT shown as a column.

type SeasonalEvent = {
  name: string;
  dateISO?: string; // exact date if known
  approxLabel?: string; // for variable dates
  leadDays: number; // used to calculate prep-by date (not shown)
  ideas?: string; // ✅ products/content ideas
  notes?: string;
  tags?: string[];
};

function formatUKDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysUntil(fromISO: string, toISO: string) {
  const a = new Date(fromISO + "T00:00:00").getTime();
  const b = new Date(toISO + "T00:00:00").getTime();
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function SeasonalPage() {
  const today = new Date();
  const todayISO = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    .toISOString()
    .slice(0, 10);

  // ✅ Edit this list whenever you want
  const events: SeasonalEvent[] = [
    {
      name: "Mother’s Day (UK)",
      dateISO: "2026-03-15",
      leadDays: 28,
      ideas: "Mum cards (funny + cute), personalised family prints, bundles with crochet bouquet.",
      notes: "Aim for drafts live + shipping cutoffs in place.",
      tags: ["cards", "prints"],
    },
    {
      name: "Easter (Good Friday bank holiday)",
      dateISO: "2026-04-03",
      leadDays: 42,
      ideas: "Easter activity packs, kids gift bundles, personalised prints for nursery/kids rooms.",
      notes: "Treat as the start of Easter buying window.",
      tags: ["kids", "gifts"],
    },
    {
      name: "Easter Monday (bank holiday)",
      dateISO: "2026-04-06",
      leadDays: 42,
      ideas: "Same as Easter weekend—use this as a last shipping ‘deadline’ marker.",
      tags: ["kids", "gifts"],
    },
    {
      name: "Father’s Day (UK)",
      dateISO: "2026-06-21",
      leadDays: 42,
      ideas: "Dad/Grandad cards, funny ‘dad’ prints, personalised family prints incl. pets.",
      notes: "Start teasers earlier if you’re doing personalisation.",
      tags: ["cards", "prints"],
    },
    {
      name: "End of School Year / Teacher Gifts",
      approxLabel: "Late Jul (varies by area)",
      leadDays: 35,
      ideas: "Teacher cards, vinyl decals (name/label sets), small gift bundles, classroom prints.",
      notes: "Term dates vary — keep stock ready and designs templated.",
      tags: ["teacher", "gifts"],
    },
    {
      name: "Back to School",
      approxLabel: "Early Sep (varies by area)",
      leadDays: 28,
      ideas: "Lunchbox labels, name decals, planner/organisation prints, first-day boards.",
      notes: "Great for vinyl + personalised sets.",
      tags: ["vinyl", "labels"],
    },
    {
      name: "Halloween",
      dateISO: "2026-10-31",
      leadDays: 45,
      ideas: "Halloween cards, spooky prints, party signage, kids ‘boo basket’ labels.",
      notes: "List early—people buy in Sept/Oct.",
      tags: ["seasonal"],
    },
    {
      name: "Bonfire Night (Guy Fawkes Night)",
      dateISO: "2026-11-05",
      leadDays: 21,
      ideas: "Cozy/autumn prints, party labels, funny seasonal cards (low effort quick wins).",
      tags: ["seasonal"],
    },
    {
      name: "Black Friday",
      dateISO: "2026-11-27",
      leadDays: 30,
      ideas: "Bundles, best-seller discounts, ‘gift-ready’ framed prints, stock clearance promos.",
      notes: "Plan bundles + shipping messaging.",
      tags: ["promo"],
    },
    {
      name: "Cyber Monday",
      dateISO: "2026-11-30",
      leadDays: 30,
      ideas: "Digital downloads, last-chance bundles, ‘personalised in 24h’ push if possible.",
      tags: ["promo"],
    },
    {
      name: "Christmas Day",
      dateISO: "2026-12-25",
      leadDays: 60,
      ideas: "Christmas cards, family prints, pet ornaments/labels, gift bundles + wrapping inserts.",
      notes: "Start listings earlier (Oct).",
      tags: ["q4"],
    },
    {
      name: "Valentine’s Day",
      dateISO: "2027-02-14",
      leadDays: 45,
      ideas: "Cheeky cards, LGBTQ+ cards, couple prints, ‘Galentine’s’ cards.",
      notes: "Prep in Dec/Jan so you’re not scrambling.",
      tags: ["cards"],
    },
  ];

  const dated = events
    .filter((e) => !!e.dateISO)
    .map((e) => {
      const prepISO = addDays(e.dateISO!, -e.leadDays);
      const untilHoliday = daysUntil(todayISO, e.dateISO!);
      const untilPrep = daysUntil(todayISO, prepISO);
      return { ...e, prepISO, untilHoliday, untilPrep };
    })
    .sort((a, b) => (a.dateISO! < b.dateISO! ? -1 : 1));

  const approx = events.filter((e) => !e.dateISO);

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="pp-card p-5">
        <h1 className="text-2xl font-extrabold text-slate-900">Seasonal Planner</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upcoming key dates + when to be prepared. Today:{" "}
          <span className="font-semibold text-slate-800">{formatUKDate(todayISO)}</span>
        </p>
      </div>

      <div className="pp-card p-5">
        <div className="text-sm font-extrabold text-slate-900 mb-3">Dated events</div>

        <div className="-mx-5 overflow-x-auto px-5" style={{ WebkitOverflowScrolling: "touch" }}>
          <table className="min-w-[1050px] w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-slate-50">
                <th className="px-3 py-2 font-semibold">Event</th>
                <th className="px-3 py-2 font-semibold">Holiday date</th>
                <th className="px-3 py-2 font-semibold">Be ready by</th>
                <th className="px-3 py-2 font-semibold">Countdown</th>
                <th className="px-3 py-2 font-semibold">Ideas</th>
                <th className="px-3 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {dated.map((e) => {
                const prepPassed = e.untilPrep < 0;
                const holidayPassed = e.untilHoliday < 0;

                return (
                  <tr key={e.name} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-semibold text-slate-900">{e.name}</td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatUKDate(e.dateISO!)}
                      {holidayPassed ? (
                        <span className="ml-2 text-xs font-semibold text-slate-500">(passed)</span>
                      ) : null}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={prepPassed ? "text-red-700 font-semibold" : "text-slate-900"}>
                        {formatUKDate(e.prepISO)}
                      </span>
                      {prepPassed ? (
                        <span className="ml-2 text-xs font-semibold text-red-700">OVERDUE</span>
                      ) : null}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {holidayPassed ? "—" : `${e.untilHoliday} days`}
                    </td>

                    <td className="px-3 py-2 text-slate-700">{e.ideas ?? "—"}</td>

                    <td className="px-3 py-2 text-slate-700">{e.notes ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          The “Be ready by” date is calculated automatically. (Lead time is still used internally, just hidden.)
        </p>
      </div>

      <div className="pp-card p-5">
        <div className="text-sm font-extrabold text-slate-900 mb-2">Variable date events (manual)</div>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
          {approx.map((e) => (
            <li key={e.name}>
              <span className="font-semibold text-slate-900">{e.name}:</span>{" "}
              {e.approxLabel ?? "—"}
              {e.ideas ? <div className="text-slate-700 mt-1"><span className="font-semibold">Ideas:</span> {e.ideas}</div> : null}
              {e.notes ? <div className="text-slate-600"><span className="font-semibold">Notes:</span> {e.notes}</div> : null}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}