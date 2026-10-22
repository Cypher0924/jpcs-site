// Content that stays in code: nav, About and FAQ. Everything else is edited in /admin and read from lib/data.ts.

export const navLinks = [
  { id: "about", label: "About" },
  { id: "officers", label: "Officers" },
  { id: "events", label: "Events" },
  { id: "gallery", label: "Gallery" },
  { id: "merch", label: "Merch" },
  { id: "faq", label: "FAQ" },
] as const;

// word for word from "JPCS Description_Mission_Vision.docx"
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

// shirt size chart from the merch pubmat. no unit printed, probably inches
export const merchSizes = [
  ["XS", 18.5, 24],
  ["S", 19.5, 25],
  ["M", 20.5, 26],
  ["L", 21.5, 27],
  ["XL", 22.5, 28],
  ["2XL", 23.5, 29],
  ["3XL", 24.5, 30],
] as const;

export const peso = (n: number) => `PHP ${n}`;

export const faqs = [
  {
    time: "14:02",
    q: "Who can join?",
    a: "BS Computer Science students of Tarlac State University. First years can also apply to the Apprenticeship Program.",
  },
  {
    time: "14:05",
    q: "Is there a membership fee?",
    a: "No, it's free. Just fill out the membership form.",
  },
  {
    time: "14:09",
    q: "When do events usually happen?",
    a: "There's no fixed schedule. Every event is announced on our Facebook page, fb.com/TSUJPCS.",
  },
  {
    time: "14:12",
    q: "How do I get my JPCS merch?",
    a: "Through the pre-order form we post on Facebook. The 2026-2027 collection was open from September 8 to 25, and the Merch section shows what was on sale.",
  },
];
