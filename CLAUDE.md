**EN TEE MITÄÄN, MILLE EN OLE KYSYNYT LUPAA.**

# ELEA asunnot - Esittelysivusto

## Yleiskatsaus

ELEA asunnot on vuokra-asuntojen esittelysivusto. ~100 asuntoa, 6 paikkakuntaa, perheyritys vuodesta 1988.

**Teknologiat:** Next.js 16 (App Router), TypeScript, Tailwind CSS, SQLite

---

## Arkkitehtuuri

### Renderöinti (SSR/SSG)

Sivusto käyttää **server-side renderöintiä** SEO:n optimoimiseksi:

| Sivu | Tyyppi | Kuvaus |
|------|--------|--------|
| `/` | Dynamic (ƒ) | Etusivu, force-dynamic (reaaliaikaiset muutokset) |
| `/kohde/[id]` | SSG (●) | Kohdesivut, generateStaticParams |
| `/admin/*` | Dynamic (ƒ) | Admin-sivut |

**Tärkeää:** Data haetaan palvelimella `lib/properties.ts` funktioilla:
- `getProperties()` - kaikki julkiset kohteet
- `getProperty(id)` - yksittäinen kohde

Älä käytä client-side fetchiä (`useEffect` + `fetch`) julkisilla sivuilla.

### Komponenttirakenne

```
page.tsx (server)
└── PropertyListClient (client) - filtteröinti, load more, modalit
    ├── FilterBar (client)
    ├── PropertyGrid
    │   └── PropertyCard - karuselli, 3D-badge, "Ota yhteyttä"
    │       └── MatterportModal (client) - 3D-kierros modaalissa
    └── ContactModal (client) - yhteydenottolomake

kohde/[id]/page.tsx (server) + generateMetadata
└── PropertyPageClient (client) - galleria, Matterport, videokierros
    ├── KeyFactsBar
    ├── HighlightsPills
    ├── ContactCTACard
    ├── LocationSection (kartta)
    └── MobileCTABar

tour/[kohde]/page.tsx (server) + generateMetadata
└── TourPageClient (client)
    └── PanoramaViewer (client) - PSV 360° viewer
        ├── CubemapAdapter (Matterport skyboxit)
        └── VirtualTourPlugin (navigointi pisteiden välillä)

admin/video/[kohde]/page.tsx (client)
└── Kuvavalinta + drag & drop + video-generointi

admin/tour/[kohde]/page.tsx (client)
└── Sweep-hallinta: piilotus, labelit, aloituspiste, stitching
```

---

## Tyylittely

### Tailwind-teema (globals.css)

ELEA-brändivärit on rekisteröity Tailwind-teemaan:

```css
/* Käytettävissä Tailwind-luokkina */
text-elea-navy       /* #1B3A5C - pääväri */
text-elea-warm       /* #C8A96E - kultainen aksentti */
text-elea-text-muted /* #6B6560 - himmeä teksti */
text-elea-text-light /* #8A857E - vaalea teksti */

bg-elea-bg           /* #FAF8F5 - sivun tausta */
bg-elea-bg-warm      /* #F3EDE3 - lämmin tausta */
bg-elea-warm-pale    /* #F5EFE3 - ikoni-taustat */

border-elea-border   /* #E5DFD6 - reunaviivat */

font-serif           /* DM Serif Display - otsikot */
font-sans            /* DM Sans - leipäteksti */
```

**Esimerkki:**
```tsx
<h2 className="font-serif text-elea-navy text-[28px]">
  Otsikko
</h2>
```

### Typografia

| Käyttö | Fontti | Koko | Luokka |
|--------|--------|------|--------|
| Hero-otsikko | DM Serif Display | 28-32px | `font-serif text-[28px] sm:text-[32px]` |
| Section-otsikko | DM Serif Display | 22-24px | `font-serif text-[22px] sm:text-[24px]` |
| Kortin otsikko | DM Serif Display | 16px | `font-serif text-[16px]` |
| Leipäteksti | DM Sans | 15px | `text-[15px] leading-[1.7]` |
| Metateksti | DM Sans | 13px | `text-[13px] text-elea-text-muted` |
| Label/uppercase | DM Sans | 11px | `text-[11px] tracking-[2px] uppercase` |

### Logo

Tekstilogo DM Serif Display -fontilla:
```tsx
<span className="text-[24px] tracking-[1.5px] font-serif text-elea-navy">
  ELEA<span className="text-elea-warm">.</span>
</span>
```

---

## Komponentit

### PropertyCard

Asuntokortti etusivulla:

- Embla-karuselli kuvagallerialle (swipe + nuolet)
- "Ota yhteyttä" CTA-painike otsikon vieressä (ghost-tyyli)
- Status-badge (Vapaa / Vapautuu X.X)
- 3D-badge jos Matterport
- Highlights-pillerit (max 5 + "+X")
- Huonetiedot: kokoonpano (esim. "2h+k") tai "X huonetta"

```tsx
// components/property-card.tsx
interface PropertyCardProps {
  property: Property
  onContactClick?: (property: Property) => void  // Avaa yhteydenotto-modalin
}
```

### ContactModal

Yhteydenottolomake modalina:

- Kohteen tiedot esitäytettynä
- Pakolliset: nimi, sähköposti, puhelin, muuttoaikataulu, GDPR
- Vapaaehtoiset: asukkaiden määrä, viesti
- Validointi + virheilmoitukset
- Focus trap, ESC sulkee

```tsx
// components/contact-modal.tsx
<ContactModal
  property={property}
  isOpen={isOpen}
  onClose={closeModal}
/>
```

### PropertyListClient

Client component joka hoitaa:
- Aluesuodatuksen (FilterBar)
- "Näytä lisää" -toiminnon
- Saa properties-datan propsina palvelimelta

### PropertyPageClient

Client component kohdesivulle:
- Embla-karuselli kuvagallerialle
- Matterport iframe lazy-load
- Mobiili-CTA

### MatterportModal

3D-kierros modaalissa (ei uusi välilehti):

```tsx
// components/matterport-modal.tsx
<MatterportModal
  property={property}
  isOpen={matterportOpen}
  onClose={() => setMatterportOpen(false)}
  onContact={() => openContactModal()}
/>
```

**Ominaisuudet:**
- 3D-badge kortissa avaa modalin (ei uutta välilehteä)
- Mobiili pysty: koko näyttö (flex-grow)
- Mobiili vaaka + tablet + desktop: 4:3 aspect ratio
- ESC-näppäin ja taustan klikkaus sulkee
- Focus trap saavutettavuutta varten
- Footer: kohteen tiedot + "Kohteen tiedot" + "Ota yhteyttä"

**Matterport URL-parametrit:**
```typescript
url.searchParams.set("qs", "1")      // Quick start - suoraan sisään
url.searchParams.set("brand", "0")   // Piilota Matterport-brändäys
url.searchParams.set("help", "0")    // Piilota navigointiohjeet
url.searchParams.set("ts", "3")      // Aloita Guided Tour 3s kuluttua
url.searchParams.set("dh", "0")      // Piilota dollhouse-nappi
url.searchParams.set("hl", "0")      // Piilota highlight reel -palkki
```

**Huom:** `ts=X` vaatii Matterport-tilassa olevan Highlight Reel -konfiguraation.

### 3D-badge (Kultainen Glow Ring)

Korttien oikeassa yläkulmassa oleva 3D-nappi:

```css
/* globals.css */
@keyframes glow-ring {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.5); opacity: 0; }
}

.badge-3d { position: relative; display: flex; }
.badge-3d::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid var(--elea-warm);
  animation: glow-ring 2.5s ease-in-out infinite;
}
```

**Reduced motion -tuki:** Animaatio poistetaan käytöstä.

---

## SEO ja Meta-tagit

### Layout (app/layout.tsx)

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://asunnot.elea.fi"),
  title: "ELEA asunnot – Löydä unelmiesi koti",
  openGraph: {
    type: "website",
    locale: "fi_FI",
    siteName: "ELEA asunnot",
  },
}
```

### Kohdesivut (generateMetadata)

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const property = getProperty(params.id)
  return {
    title: `${property.name} | ELEA asunnot`,
    description: property.description?.slice(0, 160),
    openGraph: {
      images: [{ url: property.gallery[0] }],
    },
  }
}
```

---

## Data-arkkitehtuuri

### Tietolähteet

```
/data/properties.json  ← Kohteet (export SQLitestä)
/data/vuokra.db        ← SQLite (master)
/public/images/{db_id}/ ← Prosessoidut kuvat
```

### lib/properties.ts

```typescript
// Server-side funktiot (SSR/SSG)
getProperties(): Property[]      // Kaikki julkiset (master-periytyminen mukana)
getProperty(id): Property | null // Yksittäinen (master-periytyminen mukana)

// Client-side funktiot (legacy, älä käytä uusilla sivuilla)
fetchProperties(): Promise<Property[]>
fetchProperty(id): Promise<Property | null>

// Periytyvät kentät master → slave
INHERITABLE_FIELDS = ['area_m2', 'rooms', 'room_layout', 'balcony',
                      'year_built', 'matterport', 'highlights', 'description', 'media_source']
```

### Master/Slave -malli

Saman rakennuksen asunnot voivat periä tietoja toisiltaan:

```
Master (Isokatu 60 A1)
├── area_m2: 45
├── rooms: 2
├── room_layout: "2h+k"
├── highlights: ["Parveke", "Hissi"]
└── description: "Valoisa kaksio..."

Slave (Isokatu 60 B3)
├── master_id: "isokatu-60-a1"  ← Perii masterilta
├── rent: 750                    ← Oma arvo
└── floor: 3                     ← Oma arvo
```

**Admin-sivulla:**
- "Periytyminen"-osio näyttää master/slave-tilan
- SLAVE: näyttää masterin, "Irrota masterista" -nappi
- ITSENÄINEN: lista saman talon kohteista, klikkaa asettaaksesi masteriksi

### Mediakansio (`media_source`)

Kohteen video- ja 360°-materiaalit haetaan matterport-arkistokansiosta (`/data/matterport-archive/{kohde}/`). Kansionimi ei aina vastaa kohteen ID:tä (esim. kohde `niittyportti-2-a20` käyttää kansiota `niittyportti-2-a21`).

`media_source`-kenttä kertoo minkä kansion materiaaleja kohde käyttää:
- **Tyhjä** → käyttää kohteen omaa ID:tä kansionnimenä
- **Toisen kohteen ID** → käyttää sen kansion materiaaleja (kuvat säilyvät yhdessä paikassa)

```
niittyportti-2-a20 (master):  media_source = "niittyportti-2-a21"
niittyportti-2-a21 (slave):   media_source = (tyhjä → oma ID)
niittyportti-2-a13 (slave):   media_source = (periytyy masterilta → "niittyportti-2-a21")
```

Admin-sivulla "Mediakansio" on dropdown jossa vaihtoehdot: Oma + saman talon muut kohteet. Kenttä periytyy master→slave -mallilla.

Toiminnot-osion "Videokierros" ja "360° kierros" -linkit käyttävät `media_source`-arvoa (tai kohteen omaa ID:tä) kansionnimenä.

### API-reitit

```
GET  /api/properties              # Julkiset kohteet
GET  /api/properties/[id]         # Yksittäinen kohde
GET  /api/properties/related/[id] # Saman talon kohteet (master/slave)
GET  /api/admin/properties        # Admin: kaikki (myös piilotetut)
PUT  /api/admin/properties/[id]   # Admin: päivitys
POST /api/contact                 # Yhteydenottolomake
GET  /api/contact                 # Yhteydenottojen listaus (admin)
```

### Yhteydenotot

Yhteydenotot tallennetaan tiedostoon `/data/contacts.json`:

```typescript
interface ContactSubmission {
  id: string
  timestamp: string
  propertyId: string
  propertyName: string
  name: string
  email: string
  phone: string
  moveTimeline: "asap" | "1-2months" | "3+months" | "unknown"
  occupants: string
  message: string
  status: "new" | "contacted" | "archived"
}
```

---

## Admin-käyttöliittymä

### Osoitteet

| Sivu | URL |
|------|-----|
| Etusivu | http://100.119.209.125:3000 |
| Admin | http://100.119.209.125:3000/admin |
| Kohteen muokkaus | /admin/properties/[id] |
| Kuvien hallinta | /admin/images/[db_id] |
| Vuokralaiset | /admin/tenants |
| Sopimukset | /admin/contracts |

**Tailscale-verkosta kirjautumista ei tarvita.**

### Pikanäppäimet (kohteen muokkaus)

- `⌘S` / `Ctrl+S` - Tallenna
- `Alt+←` - Edellinen kohde
- `Alt+→` - Seuraava kohde

---

## Tiedostorakenne

```
apps/esittely/
├── app/
│   ├── page.tsx              # Etusivu (dynamic, force-dynamic)
│   ├── layout.tsx            # Root layout + metadata
│   ├── globals.css           # Tailwind + ELEA-teema
│   ├── kohde/[id]/page.tsx   # Kohdesivu (SSG + metadata)
│   ├── tour/[kohde]/         # 360° virtuaalikierros
│   │   ├── page.tsx          # Tour-sivu (server, metadata)
│   │   └── tour-page-client.tsx  # Client wrapper
│   ├── meista/page.tsx
│   ├── admin/
│   │   ├── properties/[id]/page.tsx  # Kohteen muokkaus + master/slave
│   │   ├── tour/[kohde]/page.tsx     # 360° tour hallinta
│   │   └── video/[kohde]/page.tsx    # Videokuvien valinta + generointi
│   └── api/
│       ├── contact/route.ts           # Yhteydenottolomake
│       ├── properties/related/[id]/   # Saman talon kohteet
│       ├── admin/properties/[id]/     # Admin API
│       ├── tour/[kohde]/              # Tour data API
│       │   ├── route.ts              # GET tour data (sweeps, config)
│       │   └── panorama/route.ts     # GET panoraamakuva (cubemap/equirect)
│       ├── admin/tour/[kohde]/        # Admin tour API
│       │   ├── route.ts              # GET/PUT tour config
│       │   └── stitch/route.ts       # POST/GET stitching
│       └── admin/video/[kohde]/       # Admin video API
│           ├── route.ts              # GET kuvalista, PUT valinta
│           ├── thumbnail/route.ts    # GET kuva-thumbnail
│           └── generate/route.ts     # POST/GET video-generointi
├── components/
│   ├── property-card.tsx     # Kortti + karuselli + 3D-badge
│   ├── property-grid.tsx
│   ├── property-list-client.tsx  # Filtteröinti + modalit
│   ├── contact-modal.tsx     # Yhteydenottolomake (modal)
│   ├── matterport-modal.tsx  # 3D-kierros modaalissa
│   ├── panorama-viewer.tsx   # PSV 360° viewer (cubemap + equirect)
│   ├── property-page-client.tsx  # Kohdesivun client-logiikka
│   ├── filter-bar.tsx
│   ├── contact-cta-card.tsx
│   ├── key-facts-bar.tsx
│   ├── highlights-pills.tsx
│   ├── location-section.tsx
│   ├── mobile-cta-bar.tsx
│   └── property-map.tsx      # Leaflet-kartta
├── lib/
│   ├── properties.ts         # Tyypit + master/slave periytyminen + videoUrl
│   ├── tour-data.ts          # 360° tour tyypit + data loading
│   ├── utils.ts              # cn() helper
│   ├── auth.ts               # NextAuth
│   └── db/                   # Drizzle ORM
├── docs/
│   └── YHTEYDENOTTO-SUUNNITELMA.md  # Lomakkeen suunnittelu
└── middleware.ts             # Auth + Tailscale

scripts/ (repon ulkopuolella: /opt/vuokra-platform/scripts/)
├── extract-matterport.sh         # Matterport-datan ekstraktointi
├── extract-matterport-batch.py   # Batch-ekstraktointi
├── generate-tour-video.sh        # Ken Burns -video + ELEA intro/outro + overlay
├── generate-intro-outro.py       # ELEA-brändätty intro (4s) ja outro (3s)
├── generate-overlay.py           # Kohteen tiedot -overlay (RGBA PNG)
└── stitch-panorama.sh            # Hugin CLI panoraama-stitching

assets/ (repon ulkopuolella: /opt/vuokra-platform/assets/)
├── fonts/
│   ├── DMSerifDisplay-Regular.ttf  # ELEA-logo fontti
│   ├── DMSans-Regular.ttf          # Teksti regular (400)
│   ├── DMSans-Medium.ttf           # Teksti medium (500)
│   ├── DMSans-SemiBold.ttf         # Teksti semibold (600)
│   └── DMSans-Bold.ttf             # Teksti bold (700)
```

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

## Visuaaliset periaatteet (LUKITUT)

1. **Rauha ja laatu** - Neutraali tausta, tumma teksti, kultainen aksentti
2. **Reilut välit** - Välistysasteikko: 8 / 12 / 16 / 24 / 32
3. **Pyöristys** - 16px kaikkialla
4. **Varjot** - Hienovaraiset: `shadow-[0_1px_2px_rgba(16,24,40,0.06)]`
5. **Typografia** - DM Serif Display otsikoihin, DM Sans leipätekstiin
6. **Kuvat** - aspect-[4/3], hover-zoom max scale-[1.02]
7. **Interaktio** - Koko kortti klikattava, näppäimistöfokus näkyvä
8. **Saavutettavuus** - aria-label linkeille

---

## 🏆 Matterport Data Extraction (KULTA)

### Toteutettu ratkaisu Matterport-datan omistamiseen

Matterport-tiloista voidaan ekstraktoida KAIKKI data ilman tilin omistajuutta:

**Mitä saadaan irti:**
- Korkearesoluutiokuvat (7680×4320 = 33 MP)
- 360° skybox-panoraamat kaikissa resoluutioissa (low, high, 2k, 4k)
- 3D-mallit (DAM, OBJ, ZIP)
- Tekstuurit (high, low, 50k)
- Huonemitat (m², korkeus, leveys, syvyys)
- Pohjapiirrokset (minimap PNG)
- Galleria-, render- ja semanttinen data
- Sweep-positiot, huonetieto, naapurisuhteet

### Ekstraktointiprosessi (Files API + Catalog)

```bash
# 1. Hae CDN template URL (sisältää auth-avaimen)
curl -s "https://my.matterport.com/api/player/models/{MODEL_ID}/files"
# → {"templates": ["https://cdn-2.matterport.com/.../{{filename}}?t=AUTH"], "catalog_file": "catalog.json"}

# 2. Lataa catalog.json (listaa KAIKKI tiedostot)
# Korvaa {{filename}} → catalog.json

# 3. Lataa jokainen tiedosto catalogista template-URL:lla
# Korvaa {{filename}} → tiedostonimi (esim. pan/2k/SCANID_skybox0.jpg)
```

**Lisädata showcase-sivulta:**
```bash
# Sweep-positiot, huoneet, naapurit
curl -s "https://my.matterport.com/show/?m={MODEL_ID}"
# → HTML sisältää MODELDATA = parseJSON("...") → JSON sweep/room data
```

### Ekstraktointiskriptit

```bash
# TÄYSEKSTRAKTOINTI (kaikki data, Hetznerillä):
python3 ~/extract-all-matterport.py                          # Kaikki 10 kohdetta
python3 ~/extract-all-matterport.py MODEL_ID kohde-nimi      # Yksittäinen

# Vain kuvat + Ken Burns video (Tommilla):
/opt/vuokra-platform/scripts/extract-matterport.sh <MODEL_ID> <KOHDE_NIMI>
python3 /opt/vuokra-platform/scripts/extract-matterport-batch.py
```

### Ekstraktoidut Matterport-tilat (10 kpl)

**Hetzner-arkisto:** `jukka@65.109.164.17:/home/jukka/matterport-archive/`

| Kohde | Model ID | Koko | Tila |
|-------|----------|------|------|
| kilterinrinne-3-a | yT6twx42vuJ | 162 MB | Kaikki |
| kilterinrinne-3-a28 | gpkPQS85df4 | 167 MB | Kaikki |
| kilterinrinne-3-b | QgLMeLZmCfv | 162 MB | Kaikki |
| kilterinrinne-3-c39 | 5g7VZfKVRtP | 153 MB | Kaikki |
| kilterinrinne-3-c43 | dn22Xkc1PcY | 167 MB | Kaikki |
| tyonjohtajankatu-5-as6 | QbpBYmj8zw4 | 140 MB | Kaikki |
| tyonjohtajankatu-5-as7 | EuJFUDWy9UX | 98 MB | Kaikki |
| tyonjohtajankatu-5-as16 | Mf7ndzm5V1v | 80 MB | Vain kuvat+videot (malli poistettu 404) |
| niittyportti-2-a21 | SQMmpYKKQ7L | 159 MB | Kaikki |
| laajaniitynkuja-7-d | H2LtzgaK7Ve | 202 MB | Kaikki |

**Yhteensä: 1.5 GB, 10 kohdetta (9 täydellistä + 1 osittainen)**

**Tommi-arkisto (vain kuvat+videot):** `/opt/vuokra-platform/data/matterport-archive/{kohde}/`

### Arkistorakenne per kohde (Hetzner)

```
/home/jukka/matterport-archive/{kohde}/
├── metadata-raw.json      # Player API metadata (sweeps, images)
├── model-graph.json       # Showcase MODELDATA (positiot, huoneet, naapurit)
├── space-data.json        # Koottu sweep-data
├── catalog.json           # Täydellinen tiedostolista
├── images/                # Hi-res kuvat (7680×4320)
├── panoramas/
│   ├── low/               # Skybox 512px faces (6 per sweep)
│   ├── high/              # Skybox 1024px
│   ├── 2k/                # Skybox 2048px
│   └── 4k/                # Skybox 4096px
├── textures/              # 3D-mallin tekstuurit
├── models/                # 3D-mallit (DAM, OBJ, ZIP)
├── gallery/               # Galleriakuvat
├── render/                # Renderöidyt kuvat
├── floorplans/            # Pohjapiirrokset (minimap PNG)
└── semantic/              # Semanttinen data
```

### Poistetut mallit (404)

- **Mf7ndzm5V1v** (tyonjohtajankatu-5-as16) — kuvat haettu 5.2.2026, skybox ei ehditty ennen poistoa

---

## Tulevat kehitysideat

### Video-modalin integrointi

Seuraava vaihe: korvaa Matterport-iframe omalla videolla:

1. Modalissa näytetään video oletuksena
2. "Tutki itse 3D:nä" -nappi avaa Matterportin (valinnainen)
3. Kun kaikki kohteet prosessoitu → Matterport-tilaus voidaan lopettaa

---

## Muutosloki

### 2026-02-07: Video-overlay (kohteen tiedot videon päällä)

**V5b overlay Ken Burns -klippien päällä — kaksi laatikkoa vasemmassa yläkulmassa.**

Noudattaa `ELEA-video-overlay-v5b-ohje.md` -spesifikaatiota.

- Checkbox admin video-sivulla: "Lisää tiedot videon päälle"
- Overlay-kentät muokattavissa suoraan video-sivulla (vuokra, m², kokoonpano, status, alue, kaupunki)
- Muutokset tallentuvat properties.json:iin `updatePropertyData` helperillä (käyttää `_propertyId` täsmällistä hakua)
- Molemmat reitit (PUT config + POST generate) päivittävät properties.json:n
- Haku: id-match ensin, media_source-fallback (ei ristiin menevää dataa)
- Esikatselu V5b-layoutilla päivittyy reaaliajassa
- Overlay näkyy vain content-klipeissä, EI introssa/outrossa

**V5b Overlay-elementit (16:9, 1920×1080):**
1. **Ylälaatikko** (navy #1B3A5C): Status-badge vasemmalla (SemiBold 24px) + Hinta oikealla (Bold 44px), gap 40px
2. **Alalaatikko** (kulta #C8A96E): Meta-teksti ylhäällä (Medium 24px) + URL alhaalla (SemiBold 22px, opacity 92%)

**Skripti:** `scripts/generate-overlay.py <overlay-data.json> <output.png>`
- Pillow RGBA 1920×1080 PNG, ImageFilter blur-varjot
- Fontit: DM Sans Bold/SemiBold/Medium (`assets/fonts/`)

**Tiedostot:**
- `scripts/generate-overlay.py` (uusi)
- `scripts/generate-tour-video.sh` (muokattu — overlay composite per clip)
- `app/admin/video/[kohde]/page.tsx` (muokattu — checkbox + muokattavat kentät)
- `app/api/admin/video/[kohde]/route.ts` (muokattu — overlay + propertyData)
- `app/api/admin/video/[kohde]/generate/route.ts` (muokattu — overlay-data.json)
- `assets/fonts/DMSans-Bold.ttf` (uusi)
- `assets/fonts/DMSans-SemiBold.ttf` (uusi)
- `assets/fonts/DMSans-Medium.ttf` (uusi)

### 2026-02-07: ELEA-brändätty video intro/outro

**Intro (4s) ja outro (3s) lisätään automaattisesti kaikkiin generoituihin videokierroksiin.**

- `scripts/generate-intro-outro.py` — Pillow-pohjainen slate-kuva + ffmpeg fade
- Noudattaa ELEA-video-intro-outro-ohje-v2 -spesifikaatiota (DROPZONE)
- Intro: fade in 0–0.6s, näkyvissä 0.6–3.0s, fade out 3.0–4.0s
- Outro: fade in 0–0.8s, jää ruutuun (EI fade outia)
- `scripts/generate-tour-video.sh` päivitetty kutsumaan intro/outro-skriptiä
- Fontit: `assets/fonts/DMSerifDisplay-Regular.ttf`, `assets/fonts/DMSans-Regular.ttf`

**Tiedostot:**
- `scripts/generate-intro-outro.py` (uusi)
- `scripts/generate-tour-video.sh` (muokattu — intro/outro-integraatio)
- `assets/fonts/DMSans-Regular.ttf` (uusi — Google Fonts)

### 2026-02-07: Mediakansio + Toiminnot-osion uudelleenjärjestely

**Mediakansio (`media_source`):**
- Uusi kenttä joka kertoo minkä matterport-arkistokansion materiaaleja kohde käyttää
- Dropdown saman talon kohteista (related properties)
- Periytyy master→slave -mallilla
- Video/360° admin -linkit käyttävät mediaSource-arvoa kansionnimenä

**Toiminnot-osio kohteen muokkaussivulla:**
- Siirretty Kuvien ja Periytymisen väliin (aiemmin alhaalla)
- Lisätty linkit: Julkinen sivu, Videokierros, 360° kierros, Avaa 3D-kierros
- Videokierros/360° -linkit osoittavat oikeaan kansioon mediaSource-kentän perusteella

**Tiedostot:**
- `lib/properties.ts` — `mediaSource` tyyppi, periytyminen, transformaatio
- `app/admin/properties/[id]/page.tsx` — Mediakansio-dropdown, Toiminnot-osio siirretty
- `app/api/admin/properties/[id]/route.ts` — `media_source` sallittu kentäksi
- `data/properties.json` — `media_source` lisätty kaikille 75 kohteelle

### 2026-02-06: 360° Panoraama-esittelyjärjestelmä + Videokierrokset

**Kolme uutta järjestelmää toteutettu:**

#### 1) 360° virtuaalikierros (Photo Sphere Viewer)

Oma interaktiivinen 360° kierros Matterport-skybox-datasta, ilman Matterport-tililiä.

- **Photo Sphere Viewer 5.14.1** + CubemapAdapter + VirtualTourPlugin
- Tukee kahta kuvalähdettä: Matterport cubemap (6 sivua × 4 resoluutiota) ja omat equirectangular panoraamat
- Matterport skybox face mapping: `skybox0=top, 1=front, 2=left, 3=back, 4=right, 5=bottom`
- Naapurilaskenta: max 3m etäisyys, yaw = `atan2(dx, dy)`
- Ensimmäinen kohde: kilterinrinne-3-a28 (18 sweep-pistettä, 4 huonetta)

**Reitit:**

| Reitti | Tarkoitus |
|--------|-----------|
| `/tour/[kohde]` | Julkinen 360° kierros |
| `/api/tour/[kohde]` | Tour data (sweeps, config) |
| `/api/tour/[kohde]/panorama` | Cubemap face / equirect kuva |
| `/admin/tour/[kohde]` | Admin: piilotus, labelit, aloituspiste |

**Tiedostot:**
- `components/panorama-viewer.tsx` — PSV viewer ("use client", dynamic import)
- `lib/tour-data.ts` — Tyypit, loadTourData(), config management
- `app/tour/[kohde]/page.tsx` — Server component + SEO metadata
- `app/admin/tour/[kohde]/page.tsx` — Admin sweep-hallinta

**Datasijainti:** `/srv/shared/DROPZONE/{kohde}/space-data.json` + `panoramas/2k/` + `tour-config.json`

#### 2) Videokierrosten näyttäminen kohdesivulla

Ken Burns -videot kytketty kohdesivulle Matterport-iframen rinnalle.

- `lib/properties.ts`: `videoUrl` Property-tyyppiin + Matterport ID → video mapping (7 kohdetta)
- `components/property-page-client.tsx`: "Virtuaalikierros"-osio: videokierros + 3D-kierros
- Video periiytyy master/slave -mallilla saman rakennuksen asunnoille
- `<video>` -elementti natiivilla HTML5-soittimella (controls, playsInline)

**Video mapping:**

| Matterport ID | Video |
|---------------|-------|
| yT6twx42vuJ | kilterinrinne-3-a |
| QgLMeLZmCfv | kilterinrinne-3-b |
| QbpBYmj8zw4 | tyonjohtajankatu-5-as6 |
| EuJFUDWy9UX | tyonjohtajankatu-5-as7 |
| Mf7ndzm5V1v | tyonjohtajankatu-5-as16 |
| SQMmpYKKQ7L | niittyportti-2-a21 |
| H2LtzgaK7Ve | laajaniitynkuja-7-d |

#### 3) Admin: videokuvien valinta ja generointi

Admin-sivu videokuvien valintaan, järjestämiseen (drag & drop) ja videon uudelleengenerointiin.

- `/admin/video/[kohde]` — kuvagrid, valinta/poisto, drag & drop järjestys
- Valinta tallennetaan: `matterport-archive/{kohde}/video-config.json`
- "Generoi video" -nappi ajaa `scripts/generate-tour-video.sh` valituilla kuvilla
- Max 20 kuvaa per video (= ~100s), yli menevät näkyvät punaisella badgella
- Edistymisen seuranta + valmiin videon esikatselu

**Skripti:** `scripts/generate-tour-video.sh <kohde> <kuva1> <kuva2> ...`
- ELEA-brändätty intro (4s) ja outro (3s) lisätään automaattisesti
- Ken Burns clips (zoompan, 5s/kuva, vuorotteleva zoom in/out)
- Crossfade xfade (0.5s fades, hardcoded offsets — bc ei asennettu)
- Web-versio (CRF 23, faststart) → `public/videos/{kohde}-tour-web.mp4`

**Intro/outro:** `scripts/generate-intro-outro.py`
- Noudattaa ELEA-video-intro-outro-ohje-v2 -spesifikaatiota
- Generoi staattinen slate-kuva (Pillow): ELEA + ASUNNOT + eleaasunnot.fi
- Intro (4s): fade in 0–0.6s, näkyvissä 0.6–3.0s, fade out 3.0–4.0s
- Outro (3s): fade in 0–0.8s, jää ruutuun (EI fade outia)
- Tausta: navy #1B3A5C, logo: kulta #C8A96E
- Fontit: DM Serif Display (ELEA), DM Sans (ASUNNOT, URL)
- Spesifikaatio: `/srv/shared/DROPZONE/ELEA-video-intro-outro-ohje-v2(1).md`

#### Stitching-pipeline (S25 Ultra -kuville)

- `scripts/stitch-panorama.sh` — Hugin CLI: pto_gen → cpfind → autooptimiser → nona → JPEG
- Admin-integraatio: `/admin/tour/[kohde]` sisältää stitching-hallinnan
- API: `POST /api/admin/tour/[kohde]/stitch` käynnistää, `GET` seuraa tilaa

---

### 🏆 2026-02-05/06: Matterport Data Extraction - VALMIS

**Strateginen läpimurto:** Matterport-datan TÄYDELLINEN omistaminen ilman tilin hallintaa.

**2026-02-05: Kuvat + videot (7 kohdetta)**
- Matterport Player API → kuvien ja metadatan ekstraktointi
- FFmpeg-putki: Ken Burns -efekti + crossfade → ammattimainen video
- Python batch-skripti: `extract-matterport-batch.py`

**2026-02-06: KAIKKI data (10 kohdetta) → Hetzner**
- Files API + catalog.json → KAIKKI tiedostot (skyboxit, 3D, tekstuurit)
- Showcase HTML → MODELDATA (sweep-positiot, huoneet, naapurit)
- `extract-all-matterport.py` Hetznerillä → 1.5 GB, 9 täydellistä + 1 osittainen
- gpkPQS85df4, 5g7VZfKVRtP, dn22Xkc1PcY palasivat saataville (olivat 404 5.2.)
- Mf7ndzm5V1v (tyonjohtajankatu-5-as16) poistunut pysyvästi (404)

**Tiedostot:**
- Hetzner: `/home/jukka/matterport-archive/{kohde}/` (kaikki data)
- Tommi: `/data/matterport-archive/{kohde}/` (kuvat + videot)
- Web-videot: `/public/videos/{kohde}-tour-web.mp4`

**Hyöty:** Matterport-tilaus voidaan lopettaa — kaikki data omistetaan.

### 2026-02-05: Matterport-modali + 3D-badge

**Matterport-modali:**
- 3D-badge avaa Matterportin modaalissa (ei uusi välilehti)
- Käyttäjä pysyy sivulla → parempi konversio
- Kuvasuhteet: mobiili pysty koko näyttö, muut 4:3
- URL-parametrit: qs, brand, help, ts, dh, hl
- `ts=3` käynnistää Guided Tourin automaattisesti

**3D-badge (Kultainen Glow Ring):**
- Kultainen (#C8A96E) pyöreä badge kortin oikeassa yläkulmassa
- Glow ring -animaatio: valoaalto laajenee ja häviää 2.5s syklillä
- Hover: suurenee 1.1×, animaatio pysähtyy
- Reduced motion -tuki

**Tiedostot:**
- `components/matterport-modal.tsx` (uusi)
- `components/property-card.tsx` (3D-badge → button → modal)
- `app/globals.css` (glow-ring keyframes + badge-3d)

### 2026-02-05: Master/Slave + Yhteydenotto

**Master/Slave -malli:**
- `master_id` kenttä kohteille (lib/properties.ts, API)
- Periytymislogiikka: slave perii masterin tiedot automaattisesti
- Admin UI: "Periytyminen"-osio kohteen muokkaussivulla
- Saman talon kohteiden tunnistus (API: /api/properties/related/[id])

**Yhteydenottolomake:**
- "Ota yhteyttä" CTA-painike kortteihin (ghost-tyyli)
- ContactModal-komponentti (validointi, GDPR, focus trap)
- API: POST /api/contact → tallennus /data/contacts.json
- Suunnitteludokumentti: docs/YHTEYDENOTTO-SUUNNITELMA.md

**Admin-parannukset:**
- Preset highlights 10 kategorialla (kaksipalstainen valinta)
- Kokoonpano-kenttä (room_layout): "2h+k+s"
- Drag & drop highlightsien järjestämiseen
- Drag & drop kuvien järjestämiseen

**Muut:**
- Etusivu dynamic (force-dynamic) → admin-muutokset näkyvät heti
- Dev-sidebar siirretty oikeaan reunaan

### 2026-02-04: SSR/SSG refaktorointi

- Etusivu muutettu server componentiksi (SEO-korjaus)
- Kohdesivut SSG:ksi (generateStaticParams)
- PropertyCard yksinkertaistettu (ei Embla-karusellia)
- Tailwind-teema laajennettu ELEA-väreillä
- Meta-tagit kohdesivuille (generateMetadata)
- Style-attribuutit korvattu Tailwind-luokilla
