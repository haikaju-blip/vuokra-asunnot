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
└── PropertyPageClient (client) - galleria, Matterport
    ├── KeyFactsBar
    ├── HighlightsPills
    ├── ContactCTACard
    ├── LocationSection (kartta)
    └── MobileCTABar
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
                      'year_built', 'matterport', 'highlights', 'description']
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
│   ├── meista/page.tsx
│   ├── admin/
│   │   └── properties/[id]/page.tsx  # Kohteen muokkaus + master/slave
│   └── api/
│       ├── contact/route.ts           # Yhteydenottolomake
│       ├── properties/related/[id]/   # Saman talon kohteet
│       └── admin/properties/[id]/     # Admin API
├── components/
│   ├── property-card.tsx     # Kortti + karuselli + 3D-badge
│   ├── property-grid.tsx
│   ├── property-list-client.tsx  # Filtteröinti + modalit
│   ├── contact-modal.tsx     # Yhteydenottolomake (modal)
│   ├── matterport-modal.tsx  # 3D-kierros modaalissa
│   ├── property-page-client.tsx  # Kohdesivun client-logiikka
│   ├── filter-bar.tsx
│   ├── contact-cta-card.tsx
│   ├── key-facts-bar.tsx
│   ├── highlights-pills.tsx
│   ├── location-section.tsx
│   ├── mobile-cta-bar.tsx
│   └── property-map.tsx      # Leaflet-kartta
├── lib/
│   ├── properties.ts         # Tyypit + master/slave periytyminen
│   ├── utils.ts              # cn() helper
│   ├── auth.ts               # NextAuth
│   └── db/                   # Drizzle ORM
├── docs/
│   └── YHTEYDENOTTO-SUUNNITELMA.md  # Lomakkeen suunnittelu
└── middleware.ts             # Auth + Tailscale
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

## Tulevat kehitysideat

### Video + Matterport -hybridi

Suunnitelma Matterport-riippuvuuden vähentämiseksi:

1. **Nauhoita Matterport-kierrokset videoiksi** (screen recording / MP export)
2. **Näytä video oletuksena** modalissa - nopea, hallittu, toimii aina
3. **"Tutki itse 3D:nä"** -nappi avaa Matterportin (valinnainen)
4. **Myöhemmin** voidaan lopettaa Matterport-tilaus

**Hyödyt:**
- Ei riippuvuutta MP:n parametreista/toiminnallisuudesta
- Tasainen käyttökokemus kaikille
- Nopea lataus (video CDN:stä)
- Täysi hallinta sisältöön

**Toteutus:** Puppeteer/Playwright-automaatio nauhoittamaan kierrokset.

---

## Muutosloki

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
