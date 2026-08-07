/* =========================================================================
   DANE STRONY — edytuj tutaj, bez ruszania HTML/CSS
   =========================================================================
   To jest jedyny plik, który musisz zmieniać, żeby:
   - zaktualizować ceny i zawartość pakietów (PRICING),
   - podmienić 3 wyróżnione zdjęcia z Instagrama (INSTAGRAM_PREVIEW),
   - zmienić adres formularza kontaktowego (FORM_ENDPOINT).
   Po zapisaniu pliku wystarczy odświeżyć stronę — nic nie trzeba budować.
   ========================================================================= */

// ---- CENNIK ---------------------------------------------------------------
// group: "foto" lub "grafika" — decyduje w jakiej zakładce pakiet się pokaże.
// featured: true -> pakiet wyróżniony (obramowanie + etykieta "Polecane").
const PRICING = {
  foto: [
    {
      name: "Mini",
      price: "250 zł",
      unit: "/ sesja",
      desc: "Krótka sesja portretowa w jednej lokalizacji — idealna na aktualizację social mediów.",
      features: [
        "do 1 godziny sesji",
        "1 lokalizacja",
        "5 zdjęć w obróbce kolorystycznej",
        "Pliki na Google Drive przez 14 dni"
      ],
      featured: false
    },
    {
      name: "Standard",
      price: "450 zł",
      unit: "/ sesja",
      desc: "Najczęściej wybierany pakiet — więcej czasu, więcej ujęć i pełny grading.",
      features: [
        "do 2 godzin sesji",
        "3 lokalizacje",
        "15 zdjęć w obróbce kolorystycznej",
        "Konsultacja stylizacji i pomysłu",
        "Pliki na Google Drive przez 30 dni"
      ],
      featured: true
    },
    {
      name: "Premium",
      price: "950 zł",
      unit: "/ dzień",
      desc: "Pełen dzień kreatywny — na plan teledysku, lookbook lub większą produkcję.",
      features: [
        "do 4 godzin zdjęciowych",
        "Nielimitowane lokalizacje do 30 km",
        "30 zdjęć w obróbce kolorystycznej",
        "Krótki materiał BTS (behind the scenes)",
        "Priorytetowy czas realizacji (5 dni)",
        "Unikatowy Link do Google Drive na zawsze"
        
      ],
      featured: false
    }
  ],
  grafika: [
    {
      name: "Pojedyncza grafika",
      price: "99 zł",
      unit: "/ 1 grafika",
      desc: "Jedna grafika pod social media, post, relacj lub ulotkę.",
      features: [
        "1 projekt graficzny",
        "2 rundy poprawek",
        "Pliki pod Druk / Instagram / Facebook",
        "Realizacja do 3 dni roboczych"
      ],
      featured: false
    },
    {
      name: "Pakiet social media",
      price: "650 zł",
      unit: "/ 8 grafik",
      desc: "Spójny zestaw grafik utrzymany w jednej stylistyce — na miesiąc publikacji.",
      features: [
        "8 grafik w spójnej identyfikacji",
        "Szablon do samodzielnej edycji",
        "3 rundy poprawek na cały pakiet",
        "Pliki pod Druk / Instagram / Facebook",
        "Realizacja do 7 dni roboczych"
      ],
      featured: true
    },
    {
      name: "Branding",
      price: "2000 zł",
      unit: "/ projekt",
      desc: "Pełna identyfikacja wizualna dla marki, artysty lub wydarzenia.",
      features: [
        "Logo + wersje kolorystyczne",
        "Paleta barw i typografia",
        "Zestaw szablonów social media",
        "Mini brandbook (PDF)",
        "Indywidualne ustalenia"
      ],
      featured: false
    }
  ]
};

// ---- INSTAGRAM — podgląd 3 wyróżnionych realizacji ------------------------
// Instagram nie pozwala pobierać zdjęć na żywo bez płatnego widgetu z tokenem
// (np. SnapWidget / Elfsight) i backendu do jego odświeżania. Poniżej wpisujesz
// RĘCZNIE 3 zdjęcia, które mają się pokazywać jako "najnowsze realizacje" —
// możesz użyć plików z /images/full lub wgrać nowe do tego folderu.
// Jeśli chcesz PRAWDZIWY, samoaktualizujący się feed — zobacz README.md.
const INSTAGRAM_PREVIEW = [
  { image: "images/insta/1.jpg", caption: "KTW" },
  { image: "images/insta/2.jpg", caption: "ATAL" },
  { image: "images/insta/3.jpg", caption: "SPODEK" }
];

// ---- OPINIE — automatycznie przewijany pasek opinii ------------------------
// Przykładowe, wymyślone opinie — podmień na prawdziwe, gdy je zbierzesz.
// Kolejność ma znaczenie tylko wizualnie (kolejność przewijania).
const TESTIMONIALS = [
  {
    quote: "Sesja była luźna i naturalna, a mimo to zdjęcia wyszły niesamowicie klimatyczne. Tomasz świetnie czuje światło.",
    author: "Julia W. — sesja portretowa"
  },
  {
    quote: "Współpraca przy teledysku była w 100% profesjonalna — kadry z planu wykorzystaliśmy potem w całej kampanii promocyjnej.",
    author: "Kuba, wokalista — plan teledysku"
  },
  {
    quote: "Grafiki na social media zrobione szybko, spójnie i dokładnie tak, jak sobie to wyobrażałam. Polecam każdemu, kto szuka konkretów.",
    author: "Marta K. — pakiet social media"
  },
  {
    quote: "Zdjęcia z koncertu złapały dokładnie tę energię, która była na sali. Zero sztywnych, pozowanych ujęć.",
    author: "Team X — fotorelacja z koncertu"
  },
  {
    quote: "Branding, który dostaliśmy, do dziś jest fundamentem naszej marki. Logo, kolory, szablony — wszystko trzyma się razem.",
    author: "Aleksandra P. — branding marki"
  },
  {
    quote: "Druga sesja z Tomkiem i znowu bez rozczarowań — wie, jak ustawić światło, żeby wyglądać naturalnie, a nie sztucznie.",
    author: "Nina S. — sesja portretowa"
  },
  {
    quote: "Terminowość i komunikacja na pełnej profesji. Poprawki wprowadzone tego samego dnia, bez zbędnych dyskusji.",
    author: "Michał R. — plan teledysku"
  },
  {
    quote: "Kolory i kontrast na zdjęciach są jego znakiem rozpoznawczym — od razu widać, że to jego robota, bez podpisu.",
    author: "Ola D. — sesja portretowa"
  },
  {
    quote: "Pakiet grafik eventowych rozszedł się błyskawicznie w social mediach — dokładnie o to nam chodziło.",
    author: "Kohana Katowice — grafika eventowa"
  },
  {
    quote: "Profesjonalne podejście od pierwszej wiadomości po odbiór plików. Zdecydowanie wracam przy kolejnym projekcie.",
    author: "Wiktoria L. — sesja portretowa"
  }
];

// ---- FORMULARZ KONTAKTOWY ---------------------------------------------------
// Domyślnie formularz otwiera klienta pocztowego (mailto). Żeby wiadomości
// przychodziły od razu na maila bez otwierania Poczty (np. na telefonie),
// załóż darmowe konto na https://formspree.io, utwórz formularz i wklej
// tutaj jego adres w formacie: "https://formspree.io/f/xxxxxxx"
const FORM_ENDPOINT = ""; // np. "https://formspree.io/f/abcdwxyz"
const CONTACT_EMAIL = "tokonwicki@gmail.com";
