**EN TEE MITÄÄN, MILLE EN OLE KYSYNYT LUPAA.**

# Vuokra-platform - UI-toteutuksen ohjeet

## Yleiset säännöt

**ÄLÄ keksi uusia värejä tai varjoja.** Jos jokin puuttuu, käytä olemassa olevia CSS-muuttujia ja Tailwind-luokkia.

---

## Rooli

OLET PROJEKTIN UI-TOTEUTTAJA. Tavoite: erittäin tyylikäs, rauhallinen "Blueground"-henkinen ilme ja Airbnb-tyyliset kohdekortit. Tämä on esittelyportaali, jossa EI ole tarvetta varsinaisille hauille: vain alueet (6 kaupunkia) + ruudukko.

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
- Kortti vie suoraan kohdesivulle ilman erillistä CTA-nappia

### 8) Saavutettavuus
- Fokuskehys aina näkyvä
- Linkeille järkevä `aria-label` ("Katso kohde: {nimi}")

---

## Sivurakenne

```
┌─────────────────────────────────────────────────┐
│ Header: Logo + "ELEA asunnot"                 │
├─────────────────────────────────────────────────┤
│ Otsikko: "Löydä unelmiesi koti"                 │
│ Ingressi: "Valitse alue ja katso..."            │
├─────────────────────────────────────────────────┤
│ FilterBar:                                      │
│ [Espoo] [Helsinki] [Kirkkonummi] [Klaukkala] [Oulu] [Vantaa] │
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

1. Pääkuva (aspect-[4/3]) - automaattinen rotaatio
2. Status-badge vasemmassa yläkulmassa (Vapaa / Vapaa X.X.XX)
3. 3D-badge oikeassa yläkulmassa (pyöreä "3D" jos matterportUrl)
4. Otsikko (nimi)
5. Sijainti: alue, kaupunki (neighborhood + city)
6. Metarivi: `€/kk · m² · huoneet`
7. Highlights-pillerit (max 4 kpl)
8. Koko kortti on klikattava linkki

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

## Admin-käyttöliittymä

### Osoitteet (Tailscale-verkko)

| Sivu | Osoite |
|------|--------|
| Etusivu | http://100.119.209.125:3000 |
| Admin | http://100.119.209.125:3000/admin |
| Kohteen muokkaus | http://100.119.209.125:3000/admin/properties/[id] |
| Kuvien hallinta | http://100.119.209.125:3000/admin/images/[db_id] |
| **Vuokralaiset** | http://100.119.209.125:3000/admin/tenants |
| **Sopimukset** | http://100.119.209.125:3000/admin/contracts |

### Admin API

```
GET  /api/admin/properties        # Kaikki kohteet (myös piilotetut)
GET  /api/admin/properties/[id]   # Yksittäinen kohde
PUT  /api/admin/properties/[id]   # Päivitä kohde
POST /api/contracts/[id]/generate # Generoi DOCX/PDF sopimus
GET  /api/contracts/[id]/download # Lataa sopimustiedosto (?type=docx|pdf)
```

---

## Sopimushallinta

### Tietokantakerros (Drizzle ORM)

```
lib/db/
├── index.ts    # Tietokantayhteys (better-sqlite3)
└── schema.ts   # Drizzle schema (landlords, tenants, properties, contracts)
```

### Server Actions

```
app/admin/tenants/actions.ts     # Vuokralaisten CRUD
app/admin/contracts/actions.ts   # Sopimusten CRUD
```

### Dokumenttien generointi

```
lib/contracts/generate.ts        # docxtemplater + LibreOffice PDF
templates/sopimuspohja_template.docx   # Placeholder-pohja ({property_address} jne.)
archive/                         # Generoidut sopimustiedostot
```

**Käyttö:**
1. Luo sopimus `/admin/contracts/new`
2. Avaa sopimus ja siirry "Dokumentit"-välilehdelle
3. Klikkaa "Generoi dokumentit"
4. Lataa DOCX tai PDF

### Tietokannan taulut

| Taulu | Rivejä | Kuvaus |
|-------|--------|--------|
| landlords | 3 | Vuokranantajat (Tarja, Jukka, Fiquan) |
| tenants | 305 | Vuokralaiset |
| properties | 75 | Kohteet |
| contracts | 457 | Sopimukset |

### Kohteen muokkaussivu

Kaksipalstainen layout (60%/40%):

**Vasen paneeli:** status, tiedot, highlights, esittelyteksti, muistiinpanot
**Oikea paneeli:** kuvaesikatselu (dropzonesta), read-only tiedot, toiminnot

**Pikanäppäimet:**
- `⌘S` / `Ctrl+S` - Tallenna
- `Alt+←` - Edellinen kohde
- `Alt+→` - Seuraava kohde

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

## Kohdesivu (`/kohde/[id]`)

Uudistettu kohdesivu sisältää:
- Key facts -palkki (m², huoneet, kerros, vuosi)
- Kuvagalleria
- Formatted description (markdown-tuki)
- Highlights-pillerit
- Kartta (Leaflet/OpenStreetMap)
- Yhteydenotto-CTA
- Mobiili-CTA (sticky footer)

**Uudet komponentit:**
- `contact-cta-card.tsx` - Yhteydenottolomake
- `formatted-description.tsx` - Esittelytekstin muotoilu
- `highlights-pills.tsx` - Ominaisuuspillerit
- `key-facts-bar.tsx` - Perustiedot kompaktisti
- `location-section.tsx` - Sijainti + kartta
- `mobile-cta-bar.tsx` - Mobiili-footer
- `property-map.tsx` - Leaflet-kartta

---

## Tärkeät tiedostopolut

```
/opt/vuokra-platform/
├── apps/esittely/
│   ├── app/
│   │   ├── page.tsx              # Etusivu
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # CSS-muuttujat
│   │   ├── kohde/[id]/page.tsx   # Kohdesivu (uudistettu)
│   │   ├── meista/page.tsx       # Meistä-sivu
│   │   ├── admin/
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   ├── layout.tsx        # Admin layout + sidebar
│   │   │   ├── login/page.tsx    # Kirjautuminen
│   │   │   ├── properties/[id]/  # Kohteen muokkaus
│   │   │   ├── images/[id]/      # Kuvien hallinta
│   │   │   ├── tenants/          # Vuokralaisten hallinta (UUSI)
│   │   │   └── contracts/        # Sopimusten hallinta (UUSI)
│   │   └── api/
│   │       ├── properties/       # Julkinen API
│   │       ├── admin/properties/ # Admin API (GET/PUT)
│   │       ├── auth/             # NextAuth
│   │       ├── contracts/[id]/   # Sopimus-API (UUSI)
│   │       └── images/raw/       # Raakakuvat dropzonesta
│   ├── components/
│   │   ├── admin-sidebar.tsx     # Admin sivupalkki
│   │   ├── filter-bar.tsx
│   │   ├── property-card.tsx
│   │   ├── property-grid.tsx
│   │   ├── contact-cta-card.tsx  # Yhteydenotto
│   │   ├── key-facts-bar.tsx     # Perustiedot
│   │   ├── property-map.tsx      # Kartta
│   │   └── ...                   # Muut kohdesivu-komponentit
│   ├── lib/
│   │   ├── properties.ts         # Tyypit ja fetch-funktiot
│   │   ├── auth.ts               # NextAuth config
│   │   ├── utils.ts              # cn() helper
│   │   ├── db/                   # Tietokantakerros (UUSI)
│   │   │   ├── index.ts          # better-sqlite3 yhteys
│   │   │   └── schema.ts         # Drizzle ORM schema
│   │   └── contracts/            # Sopimus-logiikka (UUSI)
│   │       └── generate.ts       # docxtemplater + PDF
│   └── middleware.ts             # Auth + Tailscale-tunnistus
├── templates/
│   └── sopimuspohja_template.docx  # Sopimustemplate (UUSI)
├── archive/                      # Generoidut sopimukset (UUSI)
├── data/
│   ├── vuokra.db                 # SQLite tietokanta
│   └── properties.json           # Kohteet JSON
└── scripts/
    └── export_properties.py      # DB → JSON export

/srv/shared/DROPZONE/vuokra-images-raw/   # Raakakuvat (Z:\vuokra-images-raw)
```
