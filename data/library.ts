export type LibraryLink = {
  label: string;
  url: string;
};

export type LibraryEntry = {
  slug: string;
  language: 'en' | 'fa';
  title: string;
  author?: string;
  format?: string;
  publisher?: string;
  description?: string;
  citation?: string;
  links?: LibraryLink[];
};

const libraryEntries: LibraryEntry[] = [
  // English-language sources
  {
    slug: 'artificial-hells',
    language: 'en',
    title: 'Artificial Hells: Participatory Art and the Politics of Spectatorship',
    author: 'Claire Bishop',
    format: 'Book',
    publisher: 'Verso',
    description:
      "Claire Bishop's Artificial Hells explores the historical and theoretical landscape of participatory art, examining how social engagement became a primary medium in the twentieth and twenty-first centuries.",
    links: [
      {
        label: 'Read PDF',
        url: 'https://selforganizedseminar.wordpress.com/wp-content/uploads/2011/08/bishop-claire-artificial-hells-participatory-art-and-politics-spectatorship.pdf',
      },
      {
        label: 'Publisher page',
        url: 'https://mocastore.org/products/claire-bishop-artificial-hells',
      },
    ],
  },
  {
    slug: 'the-one-and-the-many',
    language: 'en',
    title: 'The One and the Many: Contemporary Collaborative Art in a Global Context',
    author: 'Grant Kester',
    format: 'Book',
    publisher: 'Duke University Press',
    description:
      'The One and the Many explores the rise of collaborative and participatory art within a global framework. Kester examines how modern artists have shifted away from the solitary creation of objects toward a focus on social interaction and collective experience.',
    links: [
      {
        label: 'Read PDF',
        url: 'https://portoiracemadasartes.org.br/wp-content/uploads/2018/12/the-one-and-the-many.pdf',
      },
    ],
  },
  {
    slug: 'participatory-art-paradigm-shift',
    language: 'en',
    title: 'Participatory Art: A Paradigm Shift from Objects to Subjects',
    author: 'Suzana Milevska',
    format: 'Book',
    publisher: 'ZG Kontrapunkt',
    links: [
      {
        label: 'Read on Academia.edu',
        url: 'https://www.academia.edu/126611499/Suzana_Milevska_PARTICIPATORY_ART_A_PARADIGM_SHIFT_FROM_OBJECTS_TO_SUBJECTS',
      },
    ],
  },
  {
    slug: 'the-failure-of-participation',
    language: 'en',
    title: 'The Failure of Participation: The Demos Is in the Detail',
    author: 'Anthony Schrag',
    format: 'Book Chapter',
    publisher: 'Routledge',
    description:
      'Anthony Schrag argues that the "failure" of participation lies in the field’s tendency to operate in isolated silos while ignoring the diverse ethical frameworks that define success.',
    citation:
      'In C. Cartiere and A. Schrag, The Failures of Public Art and Participation, 1st edn. London: Routledge, pp. 139–155.',
  },
  {
    slug: 'visible-project',
    language: 'en',
    title: 'Visible Project',
    format: 'Website',
    links: [{ label: 'Visit website', url: 'https://www.visibleproject.org/' }],
  },
  {
    slug: 'arte-util',
    language: 'en',
    title: 'Arte Útil',
    format: 'Website',
    links: [{ label: 'Visit website', url: 'https://arte-util.org/' }],
  },
  {
    slug: 'publics-and-counterpublics',
    language: 'en',
    title: 'Publics and Counterpublics',
    author: 'Michael Warner',
    format: 'Book',
    publisher: 'Zone Books',
  },
  {
    slug: 'tehran-monoxide',
    language: 'en',
    title: 'Tehran Monoxide',
    format: 'Book',
  },

  // Farsi-language sources
  {
    slug: 'notes-on-social-practice',
    language: 'fa',
    title: 'یادداشت‌هایی در باب کنش اجتماعی (پرکتیس)',
    format: 'مقاله',
    publisher: 'درجریان',
    links: [
      {
        label: 'مطالعه‌ی مقاله',
        url: 'https://darjaryanprojects.com/content/notes-on-social-practice/',
      },
    ],
  },
  {
    slug: 'democratic-presence-in-participatory-arts',
    language: 'fa',
    title:
      'حضور دموکراتیک در هنرهای مشارکتی: نگاهی به اکتیویسم هنری',
    format: 'مقاله',
    publisher: 'درجریان',
    links: [
      {
        label: 'مطالعه‌ی مقاله',
        url: 'https://darjaryanprojects.com/content/democratic-presence-in-participatory-arts-a-perspective-on-artistic-activism/',
      },
    ],
  },
  {
    slug: 'aesthetic-politics-ranciere',
    language: 'fa',
    title: 'سیاست‌ورزی زیبایی‌شناسانه',
    author: 'ژاک رانسیر',
    format: 'کتاب',
    links: [
      {
        label: 'مشاهده‌ی کتاب',
        url: 'https://abanbooks.com/product/%D8%B3%DB%8C%D8%A7%D8%B3%D8%AA%E2%80%8C%D9%88%D8%B1%D8%B2%DB%8C-%D8%B2%DB%8C%D8%A8%D8%A7%DB%8C%DB%8C%E2%80%8C%D8%B4%D9%86%D8%A7%D8%B3%DB%8C/',
      },
    ],
  },
  {
    slug: 'emancipated-spectator-fa',
    language: 'fa',
    title: 'تماشاگر رهایی‌یافته',
    author: 'ژاک رانسیر',
    format: 'کتاب',
    links: [
      {
        label: 'مشاهده‌ی کتاب',
        url: 'https://www.iranketab.ir/book/67306-the-emancipated-spectator',
      },
    ],
  },
  {
    slug: 'on-art-activism-groys',
    language: 'fa',
    title: 'در باب اکتیویسم هنری',
    author: 'بوریس گرویس',
    format: 'مقاله',
    citation: 'ترجمه: علی سطوتی‌فر',
    links: [
      {
        label: 'مطالعه‌ی مقاله',
        url: 'http://www.ka-af.org/index.php/article/25-ar-9.html',
      },
    ],
  },
  {
    slug: 'social-art-book',
    language: 'fa',
    title: 'کتاب هنر اجتماعی',
    author: 'محمدرضا مریدی',
    format: 'کتاب',
    links: [
      {
        label: 'مشاهده‌ی کتاب',
        url: 'https://www.iranketab.ir/book/53541-social-art',
      },
    ],
  },
  {
    slug: 'creating-better-cities-children-youth',
    language: 'fa',
    title:
      'ایجاد شهرهای بهتر با کودکان و نوجوانان',
    author: 'دیوید دریسکل',
    format: 'کتاب',
    publisher: 'دیباچه',
    links: [
      {
        label: 'مشاهده‌ی کتاب',
        url: 'https://www.iranketab.ir/book/74030-creating-better-cities-with-children-and-youth',
      },
    ],
  },
  {
    slug: 'darjaryan-website',
    language: 'fa',
    title: 'درجریان',
    format: 'وبسایت',
    links: [
      {
        label: 'بازدید از وبسایت',
        url: 'https://darjaryanprojects.com/',
      },
    ],
  },
  {
    slug: 'modakheleh-telegram',
    language: 'fa',
    title: 'کانال تلگرام مداخله',
    format: 'کانال تلگرام',
    links: [
      {
        label: 'مشاهده‌ی کانال',
        url: 'https://t.me/modakhelehh',
      },
    ],
  },
];

export function getLibraryEntries() {
  return libraryEntries;
}

export function getLibraryEntriesByLanguage(language: 'en' | 'fa') {
  return libraryEntries.filter((entry) => entry.language === language);
}
