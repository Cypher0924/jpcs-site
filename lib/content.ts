// Placeholder content for the draft. Replace every value marked TODO with
// JPCS-TSU's real wording and figures before submitting (wireframe notes 03, 04).

export const navLinks = [
  { id: "about", label: "About" },
  { id: "officers", label: "Officers" },
  { id: "events", label: "Events" },
  { id: "programs", label: "Programs" },
  { id: "gallery", label: "Gallery" },
  { id: "faq", label: "FAQ" },
] as const;

export const about = {
  // TODO: official wording
  who: "The Junior Philippine Computer Society, TSU Chapter, is the home of the Orange CS Community: BS Computer Science students at the College of Computer Studies who learn, build and compete together.",
  mission: "[Official JPCS-TSU mission statement goes here, word for word.]",
  vision: "[Official JPCS-TSU vision statement goes here, word for word.]",
};

// TODO: real figures only. null renders as "000".
export const stats: { value: number | null; unit?: string; label: string }[] = [
  { value: null, label: "Members" },
  { value: null, label: "Events this year" },
  { value: null, unit: "yrs", label: "Years active" },
  { value: null, label: "Partner orgs" },
];

export const officers = Array.from({ length: 8 }, (_, i) => ({
  number: String(i + 1).padStart(2, "0"),
  code: "XXX", // three-letter driver code, e.g. BOR
  name: "Officer name",
  role: i === 0 ? "President" : "Position",
  year: "BSCS 3",
  quote: "A short quote from the officer.",
}));

export const nextEvent = {
  round: "R5",
  title: "Event title",
  date: "2026-11-14T09:00:00+08:00", // TODO
  venue: "Venue",
  blurb: "One or two lines about the event and who it is for.",
};

export const rounds = [
  { round: "R1", month: "OCT", day: "12", title: "Event title", venue: "Venue · time", done: true },
  { round: "R2", month: "OCT", day: "19", title: "Event title", venue: "Venue · time", done: true },
  { round: "R3", month: "OCT", day: "26", title: "Event title", venue: "Venue · time", done: false },
  { round: "R4", month: "NOV", day: "02", title: "Event title", venue: "Venue · time", done: false },
];

export const programs: { name: string; blurb: string; compound: "soft" | "medium" | "hard" }[] = [
  { name: "Program name", blurb: "What the committee or program does, in one or two lines.", compound: "soft" },
  { name: "Program name", blurb: "What the committee or program does, in one or two lines.", compound: "medium" },
  { name: "Program name", blurb: "What the committee or program does, in one or two lines.", compound: "hard" },
  { name: "Program name", blurb: "What the committee or program does, in one or two lines.", compound: "medium" },
];

export const gallery = [
  { caption: "Event photo", credit: "Photographer" },
  { caption: "Photo", credit: "Photographer" },
  { caption: "Photo", credit: "Photographer" },
  { caption: "Photo", credit: "Photographer" },
  { caption: "Photo", credit: "Photographer" },
];

export const faqs = [
  { time: "14:02", q: "Who can join?", a: "Answer placeholder." },
  { time: "14:05", q: "How much is the membership fee?", a: "Answer placeholder." },
  { time: "14:09", q: "When do events usually happen?", a: "Answer placeholder." },
  { time: "14:12", q: "How do I get my JPCS merch?", a: "Answer placeholder." },
];

export const contact = {
  email: "tsujpcs@gmail.com",
  facebook: "https://www.facebook.com/TSUJPCS",
  handle: "/TSUJPCS",
};
