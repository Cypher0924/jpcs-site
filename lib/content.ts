// Site content. About, events and gallery come from the "JPCS Competition Materials" folder; everything
// else is still placeholder. Replace every value marked TODO before submitting (wireframe notes 03, 04).

export const navLinks = [
  { id: "about", label: "About" },
  { id: "officers", label: "Officers" },
  { id: "events", label: "Events" },
  { id: "gallery", label: "Gallery" },
  { id: "merch", label: "Merch" },
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

// From the "Newly elected officer 2026-2027" pubmats in the Officers, "EA to Officers" and Apprentice folders; photos
// are cropped from them. Grouped by category in rank order. The adviser leads as team principal ("TP"),
// everyone else is numbered 01-30 across the groups. Codes are the first three letters of the surname.
// `breaks` end a row early on desktop (after those indexes), so rows follow the hierarchy: P + VP together, the
// three directors together, and each EA row matching the officers they assist.
// TODO: add a short quote per officer (optional).
type OfficerEntry = {
  name: string;
  role: string;
  slug: string;
  quote?: string;
};

const officerGroupList: {
  title: string;
  label: string;
  breaks?: number[];
  officers: OfficerEntry[];
}[] = [
  {
    title: "Chapter Adviser",
    label: "Chapter Adviser",
    officers: [
      {
        name: "John Cedric Asprer",
        role: "Adviser",
        slug: "john-cedric-asprer",
      },
    ],
  },
  {
    title: "Executive Board",
    label: "Newly elected",
    breaks: [1],
    officers: [
      { name: "Charles Guevarra", role: "President", slug: "charles-guevarra" },
      {
        name: "Justin Tiamzon",
        role: "Vice President",
        slug: "justin-tiamzon",
      },
      { name: "Nicole Bartolome", role: "Secretary", slug: "nicole-bartolome" },
      {
        name: "Sabeena Estabillo",
        role: "Treasurer",
        slug: "sabeena-estabillo",
      },
      { name: "Jaydeen Gerangaya", role: "Auditor", slug: "jaydeen-gerangaya" },
    ],
  },
  {
    title: "Directors and Multimedia",
    label: "Newly elected",
    breaks: [2],
    officers: [
      { name: "Fritz Noche", role: "Director on Records", slug: "fritz-noche" },
      {
        name: "Roxanne Facun",
        role: "Director on Projects",
        slug: "roxanne-facun",
      },
      {
        name: "Kaede Isip",
        role: "Director on Public Relations",
        slug: "kaede-isip",
      },
      {
        name: "Cashlyn Florentino",
        role: "Multimedia Officer",
        slug: "cashlyn-florentino",
      },
      {
        name: "Jhurena Bautista",
        role: "Associate Multimedia Officer",
        slug: "jhurena-bautista",
      },
    ],
  },
  {
    title: "Year Representatives",
    label: "Newly elected",
    officers: [
      {
        name: "Victor Bermudez",
        role: "First Year Representative",
        slug: "victor-bermudez",
      },
      {
        name: "Aldrian Valdez",
        role: "Second Year Representative",
        slug: "aldrian-valdez",
      },
      {
        name: "Shantrelle Reinoso",
        role: "Third Year Representative",
        slug: "shantrelle-reinoso",
      },
      {
        name: "Allen Torres",
        role: "Fourth Year Representative",
        slug: "allen-torres",
      },
    ],
  },
  {
    title: "Executive Associates",
    label: "Executive Associate",
    breaks: [3, 6],
    officers: [
      {
        name: "Kassandra Gonzales",
        role: "EA to the President",
        slug: "kassandra-gonzales",
      },
      {
        name: "Nash Supan",
        role: "EA to the Vice President",
        slug: "nash-supan",
      },
      { name: "Chenee Hita", role: "EA to the Secretary", slug: "chenee-hita" },
      { name: "Althea Tan", role: "EA to the Auditor", slug: "althea-tan" },
      {
        name: "Divina Marticio",
        role: "EA for Records",
        slug: "divina-marticio",
      },
      {
        name: "Wesley Cunanan",
        role: "EA for Projects",
        slug: "wesley-cunanan",
      },
      {
        name: "Miko Alcaraz",
        role: "EA for Public Relations",
        slug: "miko-alcaraz",
      },
      {
        name: "Ezekiel Domalanta",
        role: "EA for Second Year Affairs",
        slug: "ezekiel-domalanta",
      },
      {
        name: "Ivan Pineda",
        role: "EA for Third Year Affairs",
        slug: "ivan-pineda",
      },
      {
        name: "Reena Golingan",
        role: "EA for Fourth Year Affairs",
        slug: "reena-golingan",
      },
    ],
  },
  {
    title: "Apprentices",
    label: "Apprentice",
    breaks: [3],
    officers: [
      {
        name: "Jewel Pineda",
        role: "Apprentice to the President",
        slug: "jewel-pineda",
      },
      {
        name: "Paul Almiron",
        role: "Apprentice to the Vice President",
        slug: "paul-almiron",
      },
      {
        name: "Orlando Cunan",
        role: "Apprentice to the Treasurer",
        slug: "orlando-cunan",
      },
      {
        name: "Mica Ramos",
        role: "Apprentice to the Auditor",
        slug: "mica-ramos",
      },
      {
        name: "Nicole Feliciano",
        role: "Apprentice for Secretariat & Records",
        slug: "nicole-feliciano",
      },
      {
        name: "Aira Celerio",
        role: "Apprentice for Projects & Documentation",
        slug: "aira-celerio",
      },
    ],
  },
];

let raceNumber = 0;
export const officerGroups = officerGroupList.map(
  ({ officers, label, ...group }) => ({
    ...group,
    officers: officers.map((o) => ({
      ...o,
      number:
        o.role === "Adviser" ? "TP" : String(++raceNumber).padStart(2, "0"),
      code: o.name.split(" ").at(-1)!.slice(0, 3).toUpperCase(),
      year: `${label} · 2026-2027`,
    })),
  }),
);

// Past activities from the competition materials and the TSUJPCS Facebook page. Each one gets a page at
// /events/[slug]. Ordered by date, so rounds follow the calendar. Photos are the curated picks in
// public/events/<slug>/, named by their number in the original folder.
const eventPhotos = (slug: string, nums: number[]) =>
  nums.map((n) => `/events/${slug}/${String(n).padStart(2, "0")}.webp`);

const eventList = [
  {
    slug: "general-assembly",
    month: "JUL",
    day: "03", // July 3, 2026
    title: "JPCS-TSU General Assembly",
    venue: "General Assembly of Officers",
    done: true,
    summary:
      "The chapter's first General Assembly of Officers: it welcomed the newly elected officers, introduced the org's direction and mapped out the key initiatives for A.Y. 2026-2027.",
    credit: "JPCS-TSU",
    cover: "/photos/general-assembly-group.webp",
    photos: eventPhotos(
      "general-assembly",
      [1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 16],
    ),
  },
  {
    slug: "officers-clean-up",
    month: "JUL",
    day: "07", // July 7, 2026
    title: "Officers' Clean-up Drive",
    venue: "Sorting supplies and clearing the room",
    done: true,
    summary:
      "The newly elected officers' first job together: they sorted the org's supplies, cleared out old posters and equipment, swept up and bagged the trash.",
    credit: "JPCS-TSU",
    cover: "/photos/officers-clean-up.webp",
    photos: eventPhotos("officers-clean-up", [1, 2, 3, 4, 5, 6, 8, 9, 10]),
  },
  {
    slug: "ccs-cares",
    month: "JUL",
    day: "15", // July 15, 2026, 8:00 AM (per The Browser). JPCS posted the photos Jul 29.
    title: "Project CCS C.A.R.E.S",
    venue: "CCS Grounds, TSU San Isidro Campus",
    done: true,
    summary:
      "Cleanup, Accountability, and Regular Environmental Stewardship: a college-wide clean-up drive by the CCS Student Council with The Browser's Project LiniCCS. Members and officers swept, wiped and bagged their way through classrooms, hallways, restrooms and the AVR.",
    credit: "Aira Celerio, John Kaede Isip, Nash Joshua Supan",
    cover: "/photos/ccs-cares.webp",
    photos: eventPhotos(
      "ccs-cares",
      [3, 4, 5, 7, 14, 15, 23, 26, 32, 34, 37, 45],
    ),
  },
  {
    slug: "ready-set-join",
    month: "JUL",
    day: "27", // July 27, 2026
    title: "Ready, Set, Join: Become a JPCS Member",
    venue: "Membership sign-ups for BSCS students",
    done: true,
    summary:
      "Fresh faces, new beginnings. Officers set up sign-up tables in classrooms and around campus so freshmen could register as JPCS members, pick up freshman stickers and meet the chapter.",
    credit: "Nash Joshua Supan",
    cover: "/photos/ready-set-join.webp",
    photos: eventPhotos(
      "ready-set-join",
      [1, 2, 3, 4, 6, 7, 10, 13, 14, 15, 16, 19],
    ),
  },
  {
    slug: "meet-and-greet-booth",
    month: "JUL",
    day: "28", // July 28, 2026
    title: "Meet & Greet Booth",
    venue: "JAVANJI: Welcome to the Realm",
    done: true,
    summary:
      "The JPCS booth at JAVANJI: Welcome to the Realm, the CCS Freshmen Meet and Greet organized by the CCS Student Council. A morning of flag raising, a freshman parade, org showcases, games and a raffle, with the CS Community out in full orange.",
    credit: "JPCS-TSU",
    cover: "/photos/meet-and-greet-group.webp",
    photos: eventPhotos(
      "meet-and-greet-booth",
      [1, 2, 3, 4, 5, 25, 30, 36, 44, 53, 61, 66],
    ),
  },
  {
    slug: "jpcs-merch",
    month: "SEP",
    day: "08", // Pre-orders ran Sept 8 to 25, 2026
    title: "JPCS Official Merch",
    venue: "Pre-orders, Sept 8 to 25",
    done: true,
    summary:
      "The 2026-2027 collection launched with shirts, lanyards, keychains and button pins, all designed by JPCS-TSU officers and members, on pre-order through a Google Form until the last lap on September 25.",
    credit: "JPCS-TSU",
    cover: "/merch/bundle-a.webp",
    photos: [
      "shirt-red", "shirt-orange", "lanyard-half-inch", "lanyard-reversible", "keychain-f1", "keychain-jujutsu-kaisen",
      "keychain-haikyuu", "keychain-demon-slayer", "keychain-exclusive", "pins", "bundle-e", "size-chart",
    ].map((n) => `/merch/${n}.webp`),
    // Pubmats are square, so they aren't cropped to the usual 16:9 tiles
    square: true,
    link: { href: "/merch", label: "See the full kit" },
  },
];

// Rounds follow the calendar order above.
export const events = eventList.map((e, i) => ({ ...e, round: `R${i + 1}` }));

export type Event = (typeof events)[number];

// Happening now, so it shows "In progress" instead of a countdown. Set `date` only once a real start time exists.
export const nextEvent: { round: string; title: string; date?: string; venue: string; blurb: string } = {
  round: `R${events.length + 1}`,
  title: "Full Throttle Frontend: Interface Design Challenge",
  venue: "Open to all CCS students",
  blurb: "An interface design challenge for CCS students. Top three win PHP 500, 300 and 200, plus certificates.",
};

// Photographers as credited on the TSUJPCS Facebook posts. "JPCS-TSU" where no one was credited.
export const gallery = [
  {
    src: "/photos/meet-and-greet-group.webp",
    caption: "Meet & Greet Booth",
    credit: "JPCS-TSU",
  },
  {
    src: "/photos/ready-set-join.webp",
    caption: "Ready, Set, Join",
    credit: "Nash Joshua Supan",
  },
  {
    src: "/photos/ccs-cares.webp",
    caption: "Project CCS C.A.R.E.S",
    credit: "Aira Celerio, John Kaede Isip, Nash Joshua Supan",
  },
  {
    src: "/photos/meet-and-greet-booth.webp",
    caption: "The JPCS Booth",
    credit: "JPCS-TSU",
  },
  {
    src: "/photos/general-assembly-members.webp",
    caption: "General Assembly",
    credit: "JPCS-TSU",
  },
];

// The 2026-2027 collection, from the Sept 8, 2026 "JPCS Official Merch" launch pubmats (public/merch/).
// Pre-order only, through a Google Form that closed Sept 25, so there is no buy button while `open` is false.
// Shirt prices "start at" PHP 249; no price per size was posted, so none is shown.
type MerchItem = { name: string; price: number; from?: boolean; image: string; details?: string; credit?: string };

export const merch = {
  open: false,
  form: "https://forms.gle/XNS4qgSrKSUExjL37",
  window: "Sept 8 to 25, 2026",
  groups: [
    {
      id: "shirts",
      title: "Shirts",
      note: "Sizes XS to 3XL. Larger sizes may cost more.",
      items: [
        {
          name: "Red ComSci shirt",
          price: 249,
          from: true,
          image: "/merch/shirt-red.webp",
          details: "Small logo on the front, the Computer Science graphic with MMXXVI on the back.",
          credit: "Cashlyn Florentino",
        },
        {
          name: "Orange ComSci shirt",
          price: 249,
          from: true,
          image: "/merch/shirt-orange.webp",
          details: "Same design as the red shirt, in the CS Community's orange.",
          credit: "Cashlyn Florentino",
        },
      ],
    },
    {
      id: "lanyards",
      title: "Lanyards",
      items: [
        {
          name: "Half-inch lanyard",
          price: 79,
          image: "/merch/lanyard-half-inch.webp",
          details: "Black.",
          credit: "Charles Guevarra",
        },
        {
          name: "Reversible lanyard",
          price: 149,
          image: "/merch/lanyard-reversible.webp",
          details: "Black and red on the front, white and blue Computer Science on the back.",
          credit: "Charles Guevarra, Justin Tiamzon",
        },
      ],
    },
    {
      id: "keychains",
      title: "Keychains",
      creditLabel: "Art by",
      note: "Chibi characters riding tires. Sold per piece.",
      items: [
        {
          name: "F1 set",
          price: 45,
          image: "/merch/keychain-f1.webp",
          details: "Lewis Hamilton, Max Verstappen, Charles Leclerc, Kimi Antonelli",
          credit: "Kassandra Gonzales, Nash Joshua Supan",
        },
        {
          name: "Jujutsu Kaisen set",
          price: 45,
          image: "/merch/keychain-jujutsu-kaisen.webp",
          details: "Satoru Gojo, Ryomen Sukuna, Yuji Itadori, Suguru Geto",
          credit: "Jaydeen Gerangaya",
        },
        {
          name: "Haikyuu!! set",
          price: 45,
          image: "/merch/keychain-haikyuu.webp",
          details: "Tobio Kageyama, Shoyo Hinata, Kei Tsukishima",
          credit: "Jaydeen Gerangaya, Nash Joshua Supan",
        },
        {
          name: "Demon Slayer set",
          price: 45,
          image: "/merch/keychain-demon-slayer.webp",
          details: "Zenitsu Agatsuma, Obanai Iguro, Nezuko Kamado, Mitsuri Kanroji",
          credit: "Kassandra Gonzales",
        },
        {
          name: "Exclusive set",
          price: 45,
          image: "/merch/keychain-exclusive.webp",
          details: "The JPCS mascot, Spider-Man",
          credit: "John Paul Almiron, Nash Joshua Supan",
        },
      ],
    },
    {
      id: "pins",
      title: "Button pins",
      items: [
        {
          name: "Button pins",
          price: 25,
          image: "/merch/pins.webp",
          details:
            "Girls in Tech, Hello World!, ComSci, Bugs Love My Code, Geto, Gojo, Certified Komsay Boy, Certified Komsay Girl, Komsay Spidey, AI Can't Replace Boy, AI Can't Replace Girl",
          credit: "Charles Guevarra, Justin Tiamzon, Cashlyn Florentino, Aira Celerio, Miko Alcaraz",
        },
        {
          name: "Pin bundle A",
          price: 40,
          image: "/merch/pins-bundle-a.webp",
          details: "Certified Komsay Boy and Girl",
        },
        {
          name: "Pin bundle B",
          price: 40,
          image: "/merch/pins-bundle-b.webp",
          details: "Gojo and Geto",
        },
        {
          name: "Pin bundle C",
          price: 40,
          image: "/merch/pins-bundle-c.webp",
          details: "AI Can't Replace Boy and Girl",
        },
      ],
    },
    {
      id: "bundles",
      title: "Bundles",
      items: [
        { name: "Bundle A", price: 479, image: "/merch/bundle-a.webp", details: "Red shirt and orange shirt" },
        {
          name: "Bundle B",
          price: 209,
          image: "/merch/bundle-b.webp",
          details: "Half-inch lanyard and reversible lanyard",
        },
        { name: "Bundle C", price: 309, image: "/merch/bundle-c.webp", details: "1 shirt and half-inch lanyard" },
        { name: "Bundle D", price: 379, image: "/merch/bundle-d.webp", details: "1 shirt and reversible lanyard" },
        {
          name: "Bundle E",
          price: 459,
          image: "/merch/bundle-e.webp",
          details: "1 shirt, half-inch lanyard and reversible lanyard",
        },
      ],
    },
  ] satisfies { id: string; title: string; note?: string; creditLabel?: string; items: MerchItem[] }[],
  // Shirt size chart from the pubmat. No unit was printed; most likely inches.
  sizes: [
    ["XS", 18.5, 24],
    ["S", 19.5, 25],
    ["M", 20.5, 26],
    ["L", 21.5, 27],
    ["XL", 22.5, 28],
    ["2XL", 23.5, 29],
    ["3XL", 24.5, 30],
  ] as const,
};

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

export const contact = {
  email: "tsujpcs@gmail.com",
  facebook: "https://www.facebook.com/TSUJPCS",
  handle: "/TSUJPCS",
  messenger: "https://m.me/TSUJPCS",
  registration: "https://forms.gle/zqVqGttcoXE4nRYs5",
};
