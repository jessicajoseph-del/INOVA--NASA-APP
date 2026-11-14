"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Entry = {
  id: string;
  date: string;
  mood: number;
  stress: number;
  energy: number;
  sleepHours: number;
  sleepQuality: number;
  reflectionType: "journal" | "poem";
  reflection: string;
};

type Tab = "dashboard" | "checkin" | "reflections";

const STORAGE_KEY = "crewmind-entries-v1";

function today() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function isEntry(value: unknown): value is Entry {
  if (!value || typeof value !== "object") return false;

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.id === "string" &&
    typeof entry.date === "string" &&
    typeof entry.mood === "number" &&
    typeof entry.stress === "number" &&
    typeof entry.energy === "number" &&
    typeof entry.sleepHours === "number" &&
    typeof entry.sleepQuality === "number" &&
    (entry.reflectionType === "journal" ||
      entry.reflectionType === "poem") &&
    typeof entry.reflection === "string"
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  const [date, setDate] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [reflectionType, setReflectionType] =
    useState<"journal" | "poem">("journal");
  const [reflection, setReflection] = useState("");

  useEffect(() => {
  const browserToday = today();
  setDate(browserToday);
  setCurrentDate(browserToday);

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (!Array.isArray(parsed) || !parsed.every(isEntry)) {
          throw new Error("Invalid stored data");
        }

        setEntries(
          parsed.sort((a, b) => b.date.localeCompare(a.date))
        );
      }
    } catch {
      setMessage(
        "Saved entries could not be read. Nothing has been overwritten."
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  function persist(nextEntries: Entry[]) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextEntries)
      );
      setEntries(nextEntries);
      return true;
    } catch {
      setMessage(
        "Could not save to this browser. Storage may be blocked or full."
      );
      return false;
    }
  }

  function saveCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || date > today()) {
      setMessage("Choose today or a past date.");
      return;
    }

    const existing = entries.find((entry) => entry.date === date);

    if (
      existing &&
      !window.confirm(
        "A check-in already exists for this date. Replace it?"
      )
    ) {
      return;
    }

    const entry: Entry = {
      id: existing?.id ?? crypto.randomUUID(),
      date,
      mood,
      stress,
      energy,
      sleepHours,
      sleepQuality,
      reflectionType,
      reflection: reflection.trim(),
    };

    const nextEntries = [
      entry,
      ...entries.filter((item) => item.date !== date),
    ].sort((a, b) => b.date.localeCompare(a.date));

    if (persist(nextEntries)) {
      setMessage("Your check-in has been saved.");
      setReflection("");
      setTab("dashboard");
    }
  }

  function editEntry(entry: Entry) {
    setDate(entry.date);
    setMood(entry.mood);
    setStress(entry.stress);
    setEnergy(entry.energy);
    setSleepHours(entry.sleepHours);
    setSleepQuality(entry.sleepQuality);
    setReflectionType(entry.reflectionType);
    setReflection(entry.reflection);
    setMessage("");
    setTab("checkin");
  }

  function deleteEntry(id: string) {
    if (!window.confirm("Delete this check-in and reflection?")) {
      return;
    }

    if (persist(entries.filter((entry) => entry.id !== id))) {
      setMessage("Entry deleted.");
    }
  }

  function clearData() {
    if (
      !window.confirm(
        "Delete all CrewMind check-ins and reflections from this browser?"
      )
    ) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      setEntries([]);
      setMessage("All saved entries have been deleted.");
    } catch {
      setMessage("Could not delete browser data.");
    }
  }

  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            app: "CrewMind",
            exportedAt: new Date().toISOString(),
            dataType: "personal-self-reports",
            entries,
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crewmind-${today()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const latest = entries[0];
  const reflections = entries.filter((entry) => entry.reflection);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Loading CrewMind...
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-slate-950 font-sans text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-800 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-300">
              Mission well-being companion
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              CrewMind
            </h1>
          </div>

          <span className="rounded-full border border-teal-800 bg-teal-950 px-4 py-2 text-sm text-teal-200">
            Local prototype · No cloud sync
          </span>
        </header>

        <nav
          aria-label="Main navigation"
          className="my-7 flex flex-wrap gap-2"
        >
        <a
          href="/pvt"
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-teal-300 hover:bg-slate-800"
            >
          Attention activity
        </a>
          {(
            [
              ["dashboard", "Dashboard"],
              ["checkin", "Daily check-in"],
              ["reflections", "Journal & poetry"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTab(value);
                setMessage("");
              }}
              aria-pressed={tab === value}
              className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                tab === value
                  ? "bg-teal-300 text-slate-950"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <aside className="mb-6 rounded-2xl border border-amber-900 bg-amber-950/40 p-4 text-sm leading-6 text-amber-100">
          Prototype for reflection, not diagnosis or emergency monitoring.
          Entries stay in this browser, but are not encrypted or protected
          by a login. Use fictional data on shared devices. This version
          contains no NASA dataset or validated clinical risk score.
        </aside>

        {message && (
          <p
            role="status"
            className="mb-6 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm"
          >
            {message}
          </p>
        )}

        {tab === "dashboard" && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                Your well-being overview
              </h2>
              <p className="mt-2 text-slate-400">
                Notice patterns without turning feelings into a diagnosis.
              </p>
            </div>

            {latest ? (
              <>
                <p className="mb-4 text-sm text-slate-400">
                  Latest check-in: {latest.date}
                </p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric
                    label="Mood"
                    value={`${latest.mood}/10`}
                    detail="Higher = more positive"
                  />
                  <Metric
                    label="Stress"
                    value={`${latest.stress}/10`}
                    detail="Higher = more stressed"
                  />
                  <Metric
                    label="Energy"
                    value={`${latest.energy}/10`}
                    detail="Higher = more energetic"
                  />
                  <Metric
                    label="Sleep"
                    value={`${latest.sleepHours} h`}
                    detail={`Restfulness: ${latest.sleepQuality}/10`}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="text-lg font-semibold">
                    Recent check-ins
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    These are your reported values, not predicted scores.
                  </p>

                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-slate-400">
                        <tr>
                          {[
                            "Date",
                            "Mood",
                            "Stress",
                            "Energy",
                            "Sleep",
                            "Actions",
                          ].map((heading) => (
                            <th
                              key={heading}
                              scope="col"
                              className="px-3 py-3 font-medium"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {entries.slice(0, 14).map((entry) => (
                          <tr
                            key={entry.id}
                            className="border-t border-slate-800"
                          >
                            <td className="whitespace-nowrap px-3 py-4">
                              {entry.date}
                            </td>
                            <td className="px-3 py-4">{entry.mood}/10</td>
                            <td className="px-3 py-4">{entry.stress}/10</td>
                            <td className="px-3 py-4">{entry.energy}/10</td>
                            <td className="px-3 py-4">
                              {entry.sleepHours} h
                            </td>
                            <td className="px-3 py-4">
                              <button
                                onClick={() => editEntry(entry)}
                                className="mr-4 text-teal-300 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteEntry(entry.id)}
                                className="text-rose-300 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">
                <h3 className="text-xl font-medium">
                  Your first check-in starts here
                </h3>
                <p className="mt-3 text-slate-400">
                  Record how you feel, then write a journal entry or poem
                  if you want to.
                </p>
                <button
                  onClick={() => setTab("checkin")}
                  className="mt-6 rounded-xl bg-teal-300 px-6 py-3 font-semibold text-slate-950"
                >
                  Start check-in
                </button>
              </div>
            )}

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                [
                  "Pause",
                  "Take a moment to notice what you are feeling, without judging it.",
                ],
                [
                  "Express",
                  "Write plainly or use poetry. Your words do not have to be polished.",
                ],
                [
                  "Connect",
                  "If you want support, consider speaking with someone you trust.",
                ],
              ].map(([title, text]) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <h3 className="font-semibold text-teal-200">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {text}
                  </p>
                </article>
              ))}
            </section>
          </section>
        )}

        {tab === "checkin" && (
          <section className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold">Daily check-in</h2>
            <p className="mt-2 text-slate-400">
              There are no right answers. Reflection is optional.
            </p>

            <form onSubmit={saveCheckIn} className="mt-6 space-y-6">
              <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <label className="block text-sm font-medium">
                  Check-in date
                  <input
                    type="date"
                    required
                    max={currentDate}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="mt-2 block rounded-lg border border-slate-700 bg-slate-950 p-3 text-white [color-scheme:dark]"
                  />
                </label>

                <Rating
                  label="Mood"
                  value={mood}
                  onChange={setMood}
                  low="Very low"
                  high="Very positive"
                />
                <Rating
                  label="Stress"
                  value={stress}
                  onChange={setStress}
                  low="Not stressed"
                  high="Extremely stressed"
                />
                <Rating
                  label="Energy"
                  value={energy}
                  onChange={setEnergy}
                  low="No energy"
                  high="Very energetic"
                />

                <label className="block text-sm font-medium">
                  Hours slept
                  <input
                    type="number"
                    min={0}
                    max={24}
                    step={0.5}
                    required
                    value={sleepHours}
                    onChange={(event) =>
                      setSleepHours(Number(event.target.value))
                    }
                    className="mt-2 block w-32 rounded-lg border border-slate-700 bg-slate-950 p-3"
                  />
                </label>

                <Rating
                  label="Sleep restfulness"
                  value={sleepQuality}
                  onChange={setSleepQuality}
                  low="Not restful"
                  high="Very restful"
                />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-lg font-semibold">
                  Your words, your way
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Choose a journal entry or poem. We do not analyze your
                  writing or use it to assign a mental-health label.
                </p>

                <div className="mt-4 flex gap-3">
                  {(["journal", "poem"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={reflectionType === type}
                      onClick={() => setReflectionType(type)}
                      className={`rounded-lg px-5 py-2 capitalize ${
                        reflectionType === type
                          ? "bg-teal-300 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <label
                  htmlFor="reflection"
                  className="mt-5 block text-sm text-slate-300"
                >
                  {reflectionType === "journal"
                    ? "What did today feel like?"
                    : "If your feelings were a landscape, what would it look like?"}
                </label>

                <textarea
                  id="reflection"
                  rows={8}
                  maxLength={10000}
                  value={reflection}
                  onChange={(event) => setReflection(event.target.value)}
                  placeholder={
                    reflectionType === "journal"
                      ? "Something that stayed with me today..."
                      : "Between the quiet stars..."
                  }
                  className={`mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 leading-7 outline-none focus:border-teal-300 ${
                    reflectionType === "poem" ? "font-serif" : ""
                  }`}
                />
                <p className="mt-2 text-right text-xs text-slate-500">
                  {reflection.length}/10,000 characters
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-teal-300 px-6 py-4 font-semibold text-slate-950 hover:bg-teal-200"
              >
                Save check-in
              </button>
            </form>
          </section>
        )}

        {tab === "reflections" && (
          <section>
            <h2 className="text-2xl font-semibold">Journal & poetry</h2>
            <p className="mt-2 text-slate-400">
              Your reflections, preserved as you wrote them.
            </p>

            {reflections.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-8 text-slate-400">
                No reflections yet. Add an optional journal entry or poem
                during your daily check-in.
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {reflections.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-teal-300">
                        {entry.reflectionType}
                      </span>
                      <time className="text-slate-400">
                        {entry.date}
                      </time>
                    </div>

                    <p
                      className={`mt-5 whitespace-pre-wrap break-words leading-8 text-slate-200 ${
                        entry.reflectionType === "poem"
                          ? "font-serif text-lg"
                          : ""
                      }`}
                    >
                      {entry.reflection}
                    </p>

                    <button
                      onClick={() => editEntry(entry)}
                      className="mt-5 text-sm text-teal-300 hover:underline"
                    >
                      Edit check-in
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="mt-12 border-t border-slate-800 pt-6">
          <div className="flex flex-wrap gap-5">
            <button
              onClick={exportData}
              disabled={entries.length === 0}
              className="text-sm text-teal-300 disabled:opacity-40"
            >
              Export my data
            </button>
            <button
              onClick={clearData}
              disabled={entries.length === 0}
              className="text-sm text-rose-300 disabled:opacity-40"
            >
              Delete all data
            </button>
          </div>

          <p className="mt-4 text-xs leading-6 text-slate-500">
            Data is stored only in this browser profile and may be lost if
            browser storage is cleared. Exported files contain your writing
            and check-ins: handle them carefully. This app does not contact
            anyone automatically. If you feel unsafe or need urgent help,
            contact a trusted person, mission support, or local emergency
            services.
          </p>
        </footer>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-sm text-slate-400">{label}</h3>
      <p className="mt-3 text-3xl font-semibold text-teal-200">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function Rating({
  label,
  value,
  onChange,
  low,
  high,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  low: string;
  high: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span className="text-teal-300">{value}/10</span>
      </span>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full accent-teal-300"
      />
      <span className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{low}</span>
        <span>{high}</span>
      </span>
    </label>
  );
}