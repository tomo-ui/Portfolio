# Tomasz Konwicki — Portfolio

Strona portfolio dla fotografa, grafika i specjalisty ds. marketingu. Statyczna strona (HTML/CSS/JS) — bez frameworków i bez procesu budowania. Gotowa do wrzucenia na GitHub Pages.

## Struktura projektu

```
index.html            — cała struktura strony
css/style.css          — cały wygląd (kolory, typografia, layout)
js/data.js              ← EDYTUJESZ TUTAJ: cennik, podgląd Instagrama, adres formularza
js/gallery-data.js      — lista zdjęć w portfolio (wygenerowana automatycznie)
js/main.js              — logika strony (galeria, filtry, lightbox, formularz)
images/full/             — zdjęcia w pełnej jakości (do podglądu / lightboxa)
images/thumb/            — miniatury (do siatki portfolio, szybsze ładowanie)
```

## Uruchomienie lokalne

To zwykłe pliki statyczne — wystarczy je otworzyć przez lokalny serwer (przeglądarka blokuje część funkcji przy otwieraniu `index.html` bezpośrednio z dysku):

```bash
cd site
python3 -m http.server 8000
# wejdź na http://localhost:8000
```

## Wrzucenie na GitHub Pages

1. Utwórz nowe repozytorium na GitHub, np. `portfolio`.
2. Wrzuć do niego całą zawartość folderu `site/` (czyli `index.html` powinien leżeć w głównym katalogu repo).
3. W repo wejdź w **Settings → Pages**, w sekcji „Build and deployment” wybierz **Deploy from a branch**, branch `main`, folder `/root`.
4. Po chwili strona będzie dostępna pod adresem `https://twoja-nazwa.github.io/portfolio/`.

Możesz też podpiąć własną domenę w tej samej zakładce (**Settings → Pages → Custom domain**).

## Jak edytować ceny pakietów

Otwórz plik **`js/data.js`** — na górze znajduje się obiekt `PRICING` z dwiema grupami: `foto` (sesje zdjęciowe) i `grafika` (grafika/branding). Każdy pakiet to:

```js
{
  name: "Standard",       // nazwa pakietu
  price: "450 zł",        // cena
  unit: "/ sesja",        // jednostka (np. "/ sesja", "/ projekt")
  desc: "Krótki opis…",
  features: ["punkt 1", "punkt 2"],  // lista co wchodzi w skład
  featured: true           // true = wyróżniony pakiet (obramowanie + etykieta „Polecane")
}
```

Dodaj, usuń albo zmień dowolny pakiet — strona przeliczy i odrysuje karty automatycznie po odświeżeniu.

## Jak podmienić zdjęcia w portfolio

Galeria zawiera **komplet zdjęć** ze wszystkich dostarczonych folderów (126 sztuk): `modelki` (31), `markiza` (30), `chlodnonam` (13), `jwp` (28), `koncerty` (12), `grafika` (12) — każdy folder to osobna zakładka filtra w portfolio.

1. Wrzuć nowe zdjęcia do `images/full/` (pełna jakość, max ~1600 px szerokości) i `images/thumb/` (miniatura, ~700 px szerokości) w formacie `.webp` (najlżejszy format dla przeglądarek).
2. Dodaj wpis w `js/gallery-data.js`:

```js
{
  "id": "modelki-032",
  "category": "modelki",        // modelki | markiza | chlodnonam | jwp | koncerty | grafika
  "categoryLabel": "Modelki",
  "project": "Nazwa sesji / projektu",
  "full": "images/full/modelki-032.webp",
  "thumb": "images/thumb/modelki-032.webp",
  "w": 1600, "h": 2000            // wymiary zdjęcia w px (zachowują proporcje kafelka)
}
```

Żeby przekonwertować od zera cały folder ze zdjęciami (np. po podmianie całej sesji), użyj `tools/convert_all.py` — bierze **wszystkie** pliki z folderów `raw_all/MODELKI`, `raw_all/Plan Teledysku Markiza` itd. i konwertuje je bez pomijania żadnego zdjęcia. Osobno, `tools/convert_grafika.py` robi to samo dla folderu `Grafiki`.

Jeśli dodajesz nową kategorię (np. kolejny plan teledysku), dodaj też przycisk filtra w `index.html` w sekcji `.filters` — wystarczy skopiować istniejący `<button class="filter" data-filter="...">Nazwa</button>` i podmienić `data-filter` na nową wartość `category`.

## Jak podmienić zdjęcie hero (główne na stronie)

Podmień plik `images/full/hero-tomasz.webp` na nowe zdjęcie o tej samej nazwie (albo zmień ścieżkę w `<img id="heroImg">` w `index.html`). Zdjęcie w tle hero jest przycinane na pełną szerokość ekranu (`object-fit: cover`) — najlepiej sprawdzi się zdjęcie w wysokiej rozdzielczości (min. 1920 px szerokości), inaczej na dużych, szerokich monitorach może wyglądać nieco miękko.

## Jak podmienić opinie

W `js/data.js` w tablicy `TESTIMONIALS` — każda opinia to `{ quote: "treść", author: "Imię — kontekst" }`. Pasek opinii przewija się i zmienia automatycznie co ~5,5 s, kropki pod spodem pozwalają kliknąć wprost do wybranej opinii.

Jeśli wolisz zautomatyzować konwersję i skalowanie zdjęć, w folderze `tools/convert.py` znajduje się skrypt Pythona użyty do wygenerowania obecnych zdjęć (wymaga `pip install pillow`) — dostosuj w nim ścieżki i uruchom ponownie, gdy podmienisz całą pulę zdjęć.

## Instagram — jak to działa

Instagram nie pozwala pobierać zdjęć „na żywo” bez płatnego widgetu i tokenu dostępu (Meta wymaga zarejestrowanej aplikacji, weryfikacji i odświeżania tokenu co 60 dni) — to wymaga backendu, którego statyczna strona na GitHub Pages nie ma.

**Obecne rozwiązanie:** w `js/data.js` w obiekcie `INSTAGRAM_PREVIEW` wpisujesz ręcznie 3 zdjęcia (i podpisy), które mają się wyświetlać jako „ostatnie realizacje”. Zajmuje to 30 sekund za każdym razem, gdy chcesz je podmienić:

```js
const INSTAGRAM_PREVIEW = [
  { image: "images/full/modelki-004.webp", caption: "Twój podpis" },
  ...
];
```

**Jeśli chcesz prawdziwy, samoaktualizujący się feed:** najprostsza opcja to darmowy/płatny widget typu [SnapWidget](https://snapwidget.com) lub [Elfsight Instagram Feed](https://elfsight.com/instagram-feed-widget/) — rejestrujesz się, łączysz konto Instagram, wklejasz wygenerowany `<iframe>` w miejsce sekcji `#instagram` w `index.html`.

## Formularz kontaktowy

Domyślnie formularz otwiera klienta pocztowego użytkownika (`mailto:`) z gotową treścią wiadomości — działa od razu, bez żadnej konfiguracji.

Żeby wiadomości trafiały prosto na maila (bez otwierania Poczty, co jest wygodniejsze na telefonach):

1. Załóż darmowe konto na [formspree.io](https://formspree.io).
2. Utwórz nowy formularz i podepnij go pod `tokonwicki@gmail.com`.
3. Skopiuj wygenerowany adres (`https://formspree.io/f/xxxxxxx`) i wklej go w `js/data.js` do stałej `FORM_ENDPOINT`.

Od tego momentu formularz będzie wysyłał wiadomości bezpośrednio, z komunikatem potwierdzającym na stronie.

## Licencja zdjęć

Wszystkie zdjęcia i grafiki należą do Tomasza Konwickiego i nie są objęte licencją open source — służą wyłącznie jako zawartość tej konkretnej strony portfolio.
