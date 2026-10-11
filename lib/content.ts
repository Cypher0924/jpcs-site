// Site content. About, events and gallery come from the "JPCS Competition Materials" folder; everything
// else is still placeholder. Replace every value marked TODO before submitting (wireframe notes 03, 04).

export const navLinks = [
  { id: "about", label: "About" },
  { id: "officers", label: "Officers" },
  { id: "events", label: "Events" },
  { id: "programs", label: "Programs" },
  { id: "gallery", label: "Gallery" },
  { id: "faq", label: "FAQ" },
] as const;

// From "JPCS Description_Mission_Vision.docx", word for word.
export const about = {
  who: "The Junior Philippine Computer Society (JPCS) is an organization of students in the field of Information and Communications Technology. JPCS aims to provide its members with experiences that complement the knowledge they acquire in their respective schools, thus better preparing them for their future roles as world-class ICT professionals.",
  whoMore:
    "Through learning opportunities and collaborative activities, JPCS encourages students to enhance their technical knowledge, develop their skills, and prepare for the continuous advancements in the field of technology.",
  mission:
    "To promote learning and active involvement in the field of Information and Communications Technology by providing opportunities for students to expand their knowledge and gain experiences beyond the classroom.",
  vision:
    "A progressive and recognized student organization that promotes excellence in ICT education and contributes to the development of competent and responsible future ICT professionals.",
  photo: "/photos/general-assembly-group.webp",
  photoAlt: "JPCS-TSU members and officers at the General Assembly",
};

// TODO: real figures only. null renders as "000".
export const stats: { value: number | null; unit?: string; label: string }[] = [
  { value: null, label: "Members" },
  { value: null, label: "Events this year" },
  { value: null, unit: "yrs", label: "Years active" },
  { value: null, label: "Partner orgs" },
];

// From the "Newly elected officer 2026-2027" pubmats in the Officers folder; photos are cropped from them.
// Codes are the first three letters of the surname. TODO: add a short quote per officer (optional).
const officerList: { name: string; role: string; slug: string; quote?: string }[] = [
  { name: "Charles Guevarra", role: "President", slug: "charles-guevarra" },
  { name: "Justin Tiamzon", role: "Vice President", slug: "justin-tiamzon" },
  { name: "Nicole Bartolome", role: "Secretary", slug: "nicole-bartolome" },
  { name: "Sabeena Estabillo", role: "Treasurer", slug: "sabeena-estabillo" },
  { name: "Jaydeen Gerangaya", role: "Auditor", slug: "jaydeen-gerangaya" },
  { name: "Fritz Noche", role: "Director on Records", slug: "fritz-noche" },
  { name: "Roxanne Facun", role: "Director on Projects", slug: "roxanne-facun" },
  { name: "Kaede Isip", role: "Director on Public Relations", slug: "kaede-isip" },
  { name: "Cashlyn Florentino", role: "Multimedia Officer", slug: "cashlyn-florentino" },
  { name: "Jhurena Bautista", role: "Associate Multimedia Officer", slug: "jhurena-bautista" },
  { name: "Victor Bermudez", role: "First Year Representative", slug: "victor-bermudez" },
  { name: "Aldrian Valdez", role: "Second Year Representative", slug: "aldrian-valdez" },
  { name: "Shantrelle Reinoso", role: "Third Year Representative", slug: "shantrelle-reinoso" },
  { name: "Allen Torres", role: "Fourth Year Representative", slug: "allen-torres" },
  { name: "John Cedric Asprer", role: "Adviser", slug: "john-cedric-asprer" },
];

export const officers = officerList.map((o, i) => ({
  ...o,
  number: String(i + 1).padStart(2, "0"),
  code: o.name.split(" ").at(-1)!.slice(0, 3).toUpperCase(),
  year: o.role === "Adviser" ? "Chapter adviser · 2026-2027" : "Newly elected · 2026-2027",
}));

export const nextEvent = {
  round: "R5",
  title: "Event title",
  date: "2026-11-14T09:00:00+08:00", // TODO
  venue: "Venue",
  blurb: "One or two lines about the event and who it is for.",
};

// Past activities from the competition materials. TODO: real dates and venues (the photos carry none),
// and confirm the order, which is a guess.
export const rounds = [
  { round: "R1", month: "TBA", day: "--", title: "Ready, Set, Join: Become a JPCS Member", venue: "Membership sign-ups for BSCS students", done: true },
  { round: "R2", month: "TBA", day: "--", title: "JPCS-TSU General Assembly", venue: "Agenda and officer responsibilities", done: true },
  { round: "R3", month: "TBA", day: "--", title: "Meet & Greet Booth", venue: "The CS Booth, games and performances", done: true },
  { round: "R4", month: "TBA", day: "--", title: "Project CCS C.A.R.E.S", venue: "Clean-up drive around the CCS building", done: true },
];

export const programs: { name: string; blurb: string; compound: "soft" | "medium" | "hard" }[] = [
  { name: "Program name", blurb: "What the committee or program does, in one or two lines.", compound: "soft" },
  { name: "Program name", blurb: "What the committee or program does, in one or two lines.", compound: "medium" },
  { name: "Program name", blurb: "What the committee or program does, in one or two lines.", compound: "hard" },
  { name: "Program name", blurb: "What the committee or program does, in one or two lines.", compound: "medium" },
];

// TODO: credit the actual photographers. "JPCS-TSU" is used because the photos carry the chapter's frame.
export const gallery = [
  { src: "/photos/meet-and-greet-group.webp", caption: "Meet & Greet Booth", credit: "JPCS-TSU" },
  { src: "/photos/ready-set-join.webp", caption: "Ready, Set, Join", credit: "JPCS-TSU" },
  { src: "/photos/ccs-cares.webp", caption: "Project CCS C.A.R.E.S", credit: "JPCS-TSU" },
  { src: "/photos/meet-and-greet-booth.webp", caption: "The CS Booth", credit: "JPCS-TSU" },
  { src: "/photos/general-assembly-members.webp", caption: "General Assembly", credit: "JPCS-TSU" },
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
