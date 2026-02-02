# Vuokra-platform - UI-toteutuksen ohjeet

## Yleiset säännöt

**ÄLÄ keksi uusia värejä tai varjoja.** Jos jokin puuttuu, käytä olemassa olevia CSS-muuttujia ja Tailwind-luokkia.

---

## Rooli

OLET PROJEKTIN UI-TOTEUTTAJA. Tavoite: erittäin tyylikäs, rauhallinen "Blueground"-henkinen ilme ja Airbnb-tyyliset kohdekortit. Tämä on esittelyportaali, jossa EI ole tarvetta varsinaisille hauille: vain alueet + välilehdet "Vapaat / Vapautuvat" + ruudukko.

---

## Teknologia

- Next.js (App Router), React, TypeScript
- Tailwind CSS + shadcn/ui-tyyppinen tokenointi (CSS-muuttujat kuten `--background`, `--foreground`, `--border`, `--ring`, `--radius`)
- Käytä olemassa olevia väri- ja radius-tokeneita (OKLCH-muuttujat)
- **ÄLÄ tuo uusia design-kirjastoja**

---

## Visuaaliset periaatteet (LUKITUT)

### 1) "Rauha ja laatu"
- Neutraali vaalea tausta, tumma teksti, yksi korostusväri (primary)
- Ei räikeitä värejä, ei liukuvärejä

### 2) Reilut välit
- Käytä yhtä välistysasteikkoa: `8 / 12 / 16 / 24 / 32`
- Pidä rytmi yhdenmukaisena

### 3) Pyöristys
- Käytä samaa pyöristystä kaikkialla (perus 16px / radius token)
- **Älä vaihtele kulmia**

### 4) Varjot
- Erittäin hienovaraiset
- Ensisijaisesti reunaviiva + pieni varjo
- **Oletus:** `border-border/70` + `shadow-[0_1px_2px_rgba(16,24,40,0.06)]`
- **Hover:** vain hieman suurempi shadow, ei "pomppaavaa" animaatiota

### 5) Typografia
- Selkeä ja kevyt
- **Otsikko:** `font-semibold`
- **Metatieto:** pienempi ja himmeä (`text-muted-foreground`)
- **Vuokra:** korosta font-weightillä (ei väreillä)

### 6) Kuvat
- Yhdenmukainen kuvasuhde korteissa, jotta ruudukko ei pompi
- Kuvien hover-zoom max `scale-[1.02]` (hillitty)

### 7) Interaktio
- Koko kortti on klikattava (Next Link), näppäimistöfokus näkyy selkeästi (ring)
- **Ei sisäkkäisiä linkkejä**
- "Katso kohde →" saa näkyä, mutta sen ei tule olla erillinen linkki kortin sisällä

### 8) Saavutettavuus
- Fokuskehys aina näkyvä
- Linkeille järkevä `aria-label` ("Katso kohde: {nimi}")

---

## Sivurakenne

```
┌─────────────────────────────────────────────────┐
│ Header: Logo + "Vuokra-asunnot"                 │
├─────────────────────────────────────────────────┤
│ Otsikko: "Löydä unelmiesi koti"                 │
│ Ingressi: "Valitse alue ja katso..."            │
├─────────────────────────────────────────────────┤
│ FilterBar:                                      │
│ [Kaikki] [Oulu] [Vantaa] ...  │ [Vapaat][Vapautuvat] │ X Vapaita / Y Vapautumassa │
├─────────────────────────────────────────────────┤
│ PropertyGrid: 4 saraketta desktop, 2 tablet, 1 mobile │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                     │
│ │Card│ │Card│ │Card│ │Card│                     │
│ └────┘ └────┘ └────┘ └────┘                     │
│           [Näytä lisää]                         │
├─────────────────────────────────────────────────┤
│ Footer                                          │
└─────────────────────────────────────────────────┘
```

---

## PropertyCard sisältö

1. Pääkuva (aspect-[4/3])
2. Status-badge kuvan päällä (Vapaa / Vapautuu X.X.XXXX)
3. 3D-kierros badge (jos matterportUrl)
4. Otsikko (nimi)
5. Sijainti/alue
6. Metarivi: `m² · huoneet · €/kk`
7. "Katso kohde →" CTA (ei erillinen linkki)

---

## Tehtävälista UI-muutoksille

1. Varmista että `layout.tsx` käyttää `lang="fi"` ja `font-sans` + `antialiased`
2. Tee/viimeistele komponentit: `FilterBar`, `PropertyGrid`, `PropertyCard`
3. Tee kortista kokonaan klikattava Link (wrapper) ilman sisäkkäisiä linkkejä
4. Varmista, että painikkeet ja välilehdet ovat rauhalliset (border + hienovarainen hover)
5. Pidä `globals.css` tokenit ennallaan; lisää vain tarvittaessa pienet base-viimeistelyt

---

## Toimitustapa

Kun teet UI-muutoksia, tulosta lopuksi:

```
a) Mitkä tiedostot muuttuivat
b) Mitä visuaalisia periaatteita varmistit (1–2 riviä)
c) Miten testaan lokaalisti (komennot)
```

**Älä muuta liiketoimintalogiikkaa tai datamallia enempää kuin on pakko UI:n takia.**

---

## Data-arkkitehtuuri

- **Tietokanta:** `/data/vuokra.db` (SQLite)
- **JSON-export:** `/data/properties.json` (75 kohdetta)
- **API-reitit:**
  - `GET /api/properties` - kaikki kohteet
  - `GET /api/properties/[id]` - yksittäinen kohde
- **Kuvat:** `/public/images/{db_id}/` tai `/data/images/`

Data ladataan runtime API:sta, joten muutokset `properties.json`-tiedostoon näkyvät heti ilman rebuildia.

---

## Matterport-integraatio

- Matterport ID tallennetaan `properties.json` kenttään `matterport`
- API muuttaa sen täydeksi URL:ksi: `https://my.matterport.com/show/?m={id}`
- Kohdesivulla näytetään iframe-upotus jos `matterportUrl` on olemassa

---

## Komennot

```bash
# Kehityspalvelin
cd /opt/vuokra-platform/apps/esittely && npm run dev

# Tuotanto build
npm run build

# Palvelun uudelleenkäynnistys
systemctl restart vuokra-esittely.service

# Palvelun status
systemctl status vuokra-esittely.service
```

---

## Tärkeät tiedostopolut

```
/opt/vuokra-platform/
├── apps/esittely/
│   ├── app/
│   │   ├── page.tsx              # Etusivu
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # CSS-muuttujat
│   │   ├── kohde/[id]/page.tsx   # Kohdesivu
│   │   └── api/properties/       # API-reitit
│   ├── components/
│   │   ├── filter-bar.tsx
│   │   ├── property-card.tsx
│   │   └── property-grid.tsx
│   └── lib/
│       ├── properties.ts         # Tyypit ja fetch-funktiot
│       └── utils.ts              # cn() helper
├── data/
│   ├── vuokra.db                 # SQLite tietokanta
│   └── properties.json           # Kohteet JSON
└── scripts/
    └── export_properties.py      # DB → JSON export
```
