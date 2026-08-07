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

## Jak dodawać zdjęcia — teraz w pełni automatycznie 🎉

Nie musisz już ręcznie edytować `js/gallery-data.js` ani dodawać przycisków filtrów w `index.html`. Wystarczy wrzucić zdjęcia do odpowiedniego folderu — resztą zajmuje się automat (GitHub Actions) w ciągu ok. 1 minuty od wrzucenia.

**Jak to działa:**

1. Wrzuć zdjęcia (zwykłe .jpg/.png, nie muszą być zoptymalizowane) do folderu:
   ```
   images/source/<nazwa-kategorii>/
   ```
   np. `images/source/modelki/nowa-sesja.jpg`. Możesz to zrobić wprost w przeglądarce na GitHubie: wejdź w folder → **Add file → Upload files**.

2. **Istniejąca kategoria** (np. `modelki`) → zdjęcie po prostu dojdzie do tej zakładki w portfolio.
   **Nowa kategoria** (np. `images/source/sesja-slubna/`) → strona **sama utworzy nową zakładkę filtra** o nazwie "Sesja Slubna" (domyślnie na podstawie nazwy folderu — możesz ją ładnie poprawić, patrz niżej).

3. Po commicie/wgraniu, wejdź w zakładkę **Actions** na GitHubie — zobaczysz uruchomiony workflow "Aktualizacja galerii zdjęć". Po ok. 30–90 sekundach (czas zależy od liczby i rozmiaru zdjęć) strona jest gotowa — po prostu odśwież ją w przeglądarce.

**Co dzieje się pod spodem:** GitHub Actions uruchamia `tools/build_gallery.py`, który konwertuje zdjęcia do lekkiego formatu WebP (wersja pełna + miniatura), generuje `js/gallery-data.js` i `js/category-labels.js`, i sam commituje gotowe pliki z powrotem do repozytorium. Usunięcie zdjęcia z `images/source/...` przy kolejnym uruchomieniu **usunie je też ze strony**.

**Jak zmienić nazwę zakładki** (np. "Sesja Slubna" → "Sesja Ślubna Ani i Kuby"): otwórz `tools/category-labels.json`, popraw tekst w polu `"labels"`, zapisz — automat sam się uruchomi i zaktualizuje stronę (bo ten plik też jest obserwowany przez workflow).

**Jednorazowa migracja** (tylko przy pierwszym wdrożeniu tego systemu): obecne zdjęcia trzeba raz przenieść do `images/source/`, żeby automat je "zobaczył". Najprościej lokalnie:
```bash
pip install pillow --break-system-packages
python3 tools/migrate_to_source.py   # kopiuje obecne zdjęcia do images/source/<kategoria>/
python3 tools/build_gallery.py       # przelicza wszystko na nowo i sprawdza, że działa
```
Potem zwykły `git add . && git commit -m "Migracja galerii" && git push` — od tego momentu wystarczy już tylko wrzucać nowe zdjęcia do `images/source/`.

**Uwaga:** ten mechanizm wymaga uprawnień do zapisu dla GitHub Actions w repo. Jeśli workflow nie może commitować z powrotem, wejdź w **Settings → Actions → General → Workflow permissions** i zaznacz **"Read and write permissions"**.

Jeśli wolisz zrobić to bez GitHuba (np. lokalnie, bez internetu), możesz też po prostu odpalić `python3 tools/build_gallery.py` samodzielnie i wypchnąć zmiany ręcznie.

## Jak podmienić zdjęcia ręcznie (bez automatu)

Jeśli wolisz dodać pojedyncze zdjęcie ręcznie, bez czekania na automat — nadal możesz edytować `js/gallery-data.js` bezpośrednio. Pamiętaj: przy najbliższym uruchomieniu automatu z sekcji wyżej ten plik zostanie nadpisany na podstawie zawartości `images/source/`, więc taka ręczna zmiana jest tymczasowa, chyba że dodasz też odpowiedni plik źródłowy do `images/source/`.

```js
{
  "id": "modelki-013",
  "category": "modelki",
  "categoryLabel": "Modelki",
  "project": "Nazwa sesji / projektu",
  "full": "images/full/modelki/013.webp",
  "thumb": "images/thumb/modelki/013.webp",
  "w": 1600, "h": 2000
}
```

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
