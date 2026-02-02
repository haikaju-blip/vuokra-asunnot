# ELEA asunnot - Täydellinen UI/Brändi-dokumentaatio

## Projektin yleiskuvaus

ELEA asuntojen esittelyportaali suomalaisille vuokra-asunnoille.
- **Brändi:** ELEA asunnot (FI) / ELEA Homes (EN)
- **Slogan:** "Selkeä tie kotiin."
- **Tyyli:** Blueground/Airbnb-henkinen, rauhallinen ja laadukas
- **Kohderyhmä:** Vuokra-asuntoa etsivät
- **Kieli:** Suomi

---

## Brändi (LUKITTU)

| Kieli | Kirjoitusasu |
|-------|--------------|
| Suomi | **ELEA asunnot** |
| Englanti | **ELEA Homes** (Homes isolla H:lla) |

**Pakolliset käyttöpaikat:**
- Header: **ELEA asunnot**
- Footer: `© {vuosi} ELEA asunnot. Kaikki oikeudet pidätetään.`
- Meta title: "ELEA asunnot – ..."

**Äänensävy:**
- Lyhyt, selkeä, rauhallinen
- Ei markkinahöttöä, ei huutomerkkejä

---

## Teknologiat

- **Framework:** Next.js 16 (App Router)
- **Kieli:** TypeScript
- **Tyylitys:** Tailwind CSS 4 + OKLCH-värit
- **UI-kirjastot:** Ei ulkoisia (shadcn/ui-tyylinen tokenointi)
- **Kuvat:** Native `<img>` + srcSet + sizes (ei Next.js Image)
- **3D-kierrokset:** Matterport iframe (lazy-load klikkauksesta)
- **Data:** Runtime API `/api/properties` → `properties.json`

---

## Väripaletti (globals.css)

```css
:root {
  /* Taustat */
  --background: oklch(0.985 0.002 90);    /* Lämmin vaalea tausta */
  --card: oklch(1 0 0);                   /* Puhdas valkoinen kortti */
  --secondary: oklch(0.97 0.002 90);      /* Vaalea harmaa (hover, tausta) */
  --muted: oklch(0.96 0.002 90);          /* Himmeä tausta */

  /* Tekstit */
  --foreground: oklch(0.2 0 0);           /* Tumma teksti */
  --card-foreground: oklch(0.2 0 0);      /* Kortin teksti */
  --muted-foreground: oklch(0.5 0 0);     /* Himmeä teksti (metatiedot) */

  /* Korostus (Primary) */
  --primary: oklch(0.45 0.12 250);        /* Sininen korostusväri */
  --primary-foreground: oklch(1 0 0);     /* Valkoinen primary-tekstille */
  --accent: oklch(0.45 0.12 250);         /* Sama kuin primary */

  /* Reunat ja interaktio */
  --border: oklch(0.92 0.002 90);         /* Hienovarainen reuna */
  --input: oklch(0.92 0.002 90);          /* Input-reunat */
  --ring: oklch(0.45 0.12 250);           /* Fokuskehys = primary */

  /* Pyöristys */
  --radius: 1rem;                         /* Perus 16px */
}
```

### Värien käyttö

| Käyttötarkoitus | Token | Esimerkki |
|-----------------|-------|-----------|
| Sivun tausta | `bg-background` | Koko sivun pohja |
| Kortit | `bg-card` | PropertyCard, info-laatikot |
| Hover-tilat | `bg-secondary` | Napin hover |
| Pääotsikot | `text-foreground` | h1, h2, hinnat |
| Metatiedot | `text-muted-foreground` | Sijainti, m², huoneet |
| Aktiivinen nappi | `bg-primary text-primary-foreground` | Valittu alue, CTA |
| Reunaviivat | `border-border/70` | Kortit, FilterBar |

---

## Visuaaliset periaatteet (LUKITUT - ÄLÄ MUUTA)

### 1. Rauha ja laatu
- Neutraali vaalea tausta
- Tumma teksti
- **Yksi korostusväri** (primary sininen)
- Ei räikeitä värejä
- Ei liukuvärejä
- Ei gradientteja

### 2. Välistys (Spacing)
- Asteikko: **8 / 12 / 16 / 24 / 32 px**
- Tailwind: `gap-2, gap-3, gap-4, gap-6, gap-8`
- Yhdenmukainen rytmi koko sovelluksessa
- Kortin sisäinen: `p-5` (20px)
- Korttien väli gridissä: `gap-7` (28px)

### 3. Pyöristys (Border radius)
| Elementti | Arvo | Tailwind |
|-----------|------|----------|
| Kortit | 16px | `rounded-[16px]` |
| Napit | 12px | `rounded-[12px]` |
| Badget | 10px | `rounded-[10px]` |
| Logo | 8px | `rounded-[8px]` |
| Välilehdet (sisä) | 8px | `rounded-[8px]` |

ÄLÄ vaihtele pyöristyksiä satunnaisesti

### 4. Varjot
- **Erittäin hienovaraiset**
- Oletus: `shadow-[0_1px_2px_rgba(16,24,40,0.06)]`
- Hover: `shadow-[0_8px_20px_rgba(16,24,40,0.10)]`
- EI voimakkaita varjoja
- EI "pomppaavia" hover-animaatioita

### 5. Typografia
```
Fontti: font-sans (system-ui, -apple-system, sans-serif)
Antialiasing: antialiased

Otsikot:
- h1: text-3xl sm:text-4xl font-semibold tracking-tight
- h2: text-xl font-semibold
- h3: text-lg font-semibold (kortin otsikko)

Leipäteksti:
- Normaali: text-foreground
- Meta: text-[13px] text-muted-foreground
- Hinta: font-semibold text-foreground
```

### 6. Kuvat ja responsiivinen optimointi

**Kuvasuhde:** 4:3 (kaikki koot)

**Formaatti:** WebP (20-30% pienempi kuin JPEG)

**Responsiiviset koot (Sharp-generoitu):**

| Koko | Resoluutio | Laatu | Käyttö | Tiedostokoko |
|------|------------|-------|--------|--------------|
| thumb | 800×600 | 75% | Mobiili | ~50-100 KB |
| card | 1200×900 | 78% | Tabletti | ~100-150 KB |
| large | 1600×1200 | 80% | Desktop/retina kortit | ~150-250 KB |
| hero | 2400×1800 | 82% | Kohdesivun pääkuva | ~250-400 KB |

**Tiedostorakenne:**
```
/public/images/{db_id}/
├── 01-thumb.webp
├── 01-card.webp
├── 01-large.webp
├── 01-hero.webp
├── 02-thumb.webp
├── 02-card.webp
└── ...
```

**Käyttö komponenteissa (srcSet + sizes + decoding):**

PropertyCard käyttää native `<img>` + srcSet:
```html
<img
  src="/images/38/01-large.webp"
  srcSet="/images/38/01-thumb.webp 800w,
          /images/38/01-card.webp 1200w,
          /images/38/01-large.webp 1600w"
  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
  loading="lazy"
  decoding="async"
/>
```

Kohdesivun hero (LCP-optimoitu):
```html
<img
  src="/images/38/01-hero.webp"
  srcSet="/images/38/01-card.webp 1200w,
          /images/38/01-large.webp 1600w,
          /images/38/01-hero.webp 2400w"
  sizes="(min-width: 1024px) 800px, 100vw"
  loading="eager"
  decoding="async"
  fetchPriority="high"
/>
```

**Selain valitsee automaattisesti:**
| Konteksti | sizes | Ladattu kuva |
|-----------|-------|--------------|
| Kortti mobile | 100vw | thumb 800w |
| Kortti tablet | 50vw | card 1200w |
| Kortti desktop | 25vw | card/large |
| Hero mobile | 100vw | card 1200w |
| Hero desktop | 800px | large 1600w |

**Käsittely (Sharp):**
- normalize() - automaattinen tasokorjaus
- modulate({ brightness: 1.02, saturation: 1.05 }) - kevyt parannus
- sharpen({ sigma: 0.5 }) - terävöitys
- fit: 'cover' + position: 'center' - keskitetty rajaus

**Pyörivä galleria:** 3-4 sekunnin välein
**Hover-zoom:** EI käytössä

### 7. Interaktio ja saavutettavuus
- Koko kortti on klikattava (Next.js Link wrapper)
- Fokuskehys **aina näkyvä**: `focus-visible:ring-2 focus-visible:ring-ring`
- EI sisäkkäisiä linkkejä
- `aria-label` linkeille: "Katso kohde: {nimi}"
- `aria-pressed` toggle-napeille
- `role="tablist"` välilehdille

### 8. Puuttuvien tietojen käsittely (TÄRKEÄ)

**Älä koskaan näytä nollia:**
- EI "0 €/kk"
- EI "0 m²"
- EI "0 huonetta"

**Metarivin muodostus:**
```tsx
const parts = []
if (price > 0) parts.push(`${price} €/kk`)
if (size > 0) parts.push(`${size} m²`)
if (rooms > 0) parts.push(`${rooms} huonetta`)

// Jos kaikki puuttuu:
if (parts.length === 0) return "Tiedot tulossa"

// Muuten yhdistä:
return parts.join(" · ")
```

---

## Komponenttirakenne

### Layout (layout.tsx)
```tsx
<html lang="fi">
  <body className="font-sans antialiased">
    {children}
  </body>
</html>
```

**Metadata:**
```tsx
export const metadata: Metadata = {
  title: "ELEA asunnot – Löydä unelmiesi koti",
  description: "Selaa vapaita ja pian vapautuvia ELEA-asuntoja. Selkeä tie kotiin.",
}
```

### Header
```tsx
<header className="border-b border-border bg-card">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex h-16 items-center justify-between">
      {/* Logo + teksti */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[8px] bg-primary flex items-center justify-center">
          {/* Talo-ikoni */}
        </div>
        <span className="text-lg font-semibold text-foreground">
          ELEA asunnot
        </span>
      </div>
    </div>
  </div>
</header>
```

### Footer
```tsx
<footer className="border-t border-border bg-card mt-16">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    <p className="text-sm text-muted-foreground text-center">
      © 2026 ELEA asunnot. Kaikki oikeudet pidätetään.
    </p>
  </div>
</footer>
```

### FilterBar
```tsx
<div className="bg-card rounded-[16px] border border-border/70
  shadow-[0_1px_2px_rgba(16,24,40,0.06)] p-4">

  {/* Aluenapit */}
  <button className={cn(
    "px-4 py-2 rounded-[12px] text-sm font-medium border",
    selected
      ? "bg-primary text-primary-foreground border-transparent"
      : "bg-transparent text-foreground border-border/80 hover:bg-secondary"
  )}>
    {area.label}
  </button>

  {/* Välilehdet: Vapaat / Vapautuvat */}
  <div className="flex items-center gap-1 p-1 bg-secondary rounded-[12px] border border-border/70">
    <button className={cn(
      "px-4 py-2 rounded-[8px] text-sm font-medium",
      selected
        ? "bg-card text-card-foreground border border-border/70"
        : "text-muted-foreground hover:text-foreground"
    )}>
      Vapaat
    </button>
  </div>

  {/* Laskurit */}
  <span className="font-semibold">{count}</span>
  <span className="text-muted-foreground"> Vapaita</span>
</div>
```

### PropertyCard (puuttuvien tietojen käsittelyllä)
```tsx
<Link href={`/kohde/${property.id}`}
  aria-label={`Katso kohde: ${property.name}`}
  className="block rounded-[16px] focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-ring">

  <article className="group bg-card rounded-[16px] overflow-hidden
    border border-border/70
    shadow-[0_1px_2px_rgba(16,24,40,0.06)]
    transition duration-300
    hover:shadow-[0_8px_20px_rgba(16,24,40,0.10)]">

    {/* Kuva */}
    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
      <img
        src={imageSrc}
        srcSet={srcSet}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        loading="lazy"
        decoding="async"
        className="object-cover"
      />

      {/* Badget */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        <span className={cn(
          "px-3 py-1.5 rounded-[10px] text-sm font-medium backdrop-blur-md",
          isAvailable
            ? "bg-primary text-primary-foreground"
            : "bg-white/85 text-foreground"
        )}>
          {isAvailable ? "Vapaa" : `Vapautuu ${date}`}
        </span>

        {property.matterportUrl && (
          <span className="px-3 py-1.5 rounded-[10px] text-sm font-medium
            bg-white/90 text-foreground backdrop-blur-md">
            360° 3D-kierros
          </span>
        )}
      </div>
    </div>

    {/* Sisältö */}
    <div className="p-5 space-y-3">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-card-foreground leading-tight">
          {property.name}
        </h3>
        <p className="text-[13px] text-muted-foreground">
          {property.location} · {property.area}
        </p>
      </div>

      {/* Metarivi - EI NOLLIA */}
      <p className="text-[13px] text-muted-foreground">
        {(() => {
          const parts = []
          if (price > 0) parts.push(<span className="font-semibold text-foreground">{price} €/kk</span>)
          if (size > 0) parts.push(`${size} m²`)
          if (rooms > 0) parts.push(`${rooms} huonetta`)
          if (parts.length === 0) return "Tiedot tulossa"
          return parts.join(" · ")
        })()}
      </p>

      <div className="pt-1">
        <span className="inline-flex items-center justify-center
          rounded-[12px] px-4 py-2 text-[13px] font-medium
          border border-border/80 bg-card hover:bg-secondary transition">
          Katso kohde <span className="ml-2">→</span>
        </span>
      </div>
    </div>
  </article>
</Link>
```

### PropertyGrid
```tsx
<div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
  {properties.map((property) => (
    <PropertyCard key={property.id} property={property} />
  ))}
</div>

{/* Näytä lisää -nappi */}
<button className="px-6 py-2.5 rounded-[12px] bg-card
  border border-border/80 text-foreground font-medium text-sm
  hover:bg-secondary transition">
  Näytä lisää
</button>
```

### Kohdesivun Matterport (LAZY-LOAD)

**Matterport-iframe ladataan vasta klikkauksesta:**

```tsx
const [showMatterport, setShowMatterport] = useState(false)

{matterportUrl && (
  <section className="space-y-3">
    <h2 className="text-xl font-semibold text-foreground">3D-virtuaalikierros</h2>
    <p className="text-sm text-muted-foreground">
      Tutustu asuntoon 360°-kierroksella.
    </p>
    <div className="rounded-[16px] overflow-hidden border border-border/70 bg-muted aspect-video relative">
      {showMatterport ? (
        <iframe
          title={`Matterport 3D-kierros: ${property.name}`}
          src={`${matterportUrl}&play=1`}
          allowFullScreen
          allow="xr-spatial-tracking"
          className="w-full h-full min-h-[400px]"
        />
      ) : (
        <button
          onClick={() => setShowMatterport(true)}
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4
            bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
            {/* 3D-ikoni */}
          </div>
          <span className="text-lg font-medium text-foreground">Avaa 3D-virtuaalikierros</span>
          <span className="text-sm text-muted-foreground">Klikkaa ladataksesi interaktiivisen kierroksen</span>
        </button>
      )}
    </div>
  </section>
)}
```

**Miksi lazy-load:**
- Matterport-iframe on raskas (~2-5 MB)
- Ei ladata turhaan jos käyttäjä ei tarvitse
- Parempi suorituskyky ja LCP-aika
- Käyttäjä päättää itse milloin lataa

---

## Sivurakenne (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│ [Logo] ELEA asunnot                                         │
├─────────────────────────────────────────────────────────────┤
│ HERO                                                        │
│ h1: "Löydä unelmiesi koti"                                  │
│ p: "Valitse alue ja katso vapaat tai pian vapautuvat..."    │
├─────────────────────────────────────────────────────────────┤
│ FILTERBAR                                                   │
│ [Kaikki] [Oulu] [Vantaa] [Espoo]  |  [Vapaat][Vapautuvat]   │
│                                           X Vapaita / Y Vap │
├─────────────────────────────────────────────────────────────┤
│ PROPERTYGRID (4 col desktop, 2 tablet, 1 mobile)            │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│ │  CARD   │ │  CARD   │ │  CARD   │ │  CARD   │             │
│ │ [Kuva]  │ │ [Kuva]  │ │ [Kuva]  │ │ [Kuva]  │             │
│ │ Nimi    │ │ Nimi    │ │ Nimi    │ │ Nimi    │             │
│ │ Meta    │ │ Meta    │ │ Meta    │ │ Meta    │             │
│ │ [CTA]   │ │ [CTA]   │ │ [CTA]   │ │ [CTA]   │             │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
│                                                             │
│                    [Näytä lisää]                            │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
│ © 2026 ELEA asunnot. Kaikki oikeudet pidätetään.            │
└─────────────────────────────────────────────────────────────┘
```

---

## Data-malli

### Property (Frontend)
```typescript
interface Property {
  id: string              // URL-slug: "niittyportti-2-a13"
  db_id: number           // Tietokannan ID
  name: string            // Näyttönimi: "Niittyportti 2 A13"
  address: string         // Täysi osoite
  location: string        // Kaupunginosa
  area: string            // Alue (filtteröinti): "Espoo", "Oulu"
  image: string           // Pääkuva
  gallery?: string[]      // Kuvagalleria
  size: number            // Neliöt (0 = puuttuu)
  rooms: number           // Huoneiden määrä (0 = puuttuu)
  price: number           // Vuokra €/kk (0 = puuttuu)
  status: "available" | "upcoming"
  availableDate?: string  // "1.3.2026"
  matterportUrl?: string  // 3D-kierroksen URL
}
```

### API-reitit
| Reitti | Kuvaus |
|--------|--------|
| `GET /api/properties` | Kaikki kohteet |
| `GET /api/properties/[id]` | Yksittäinen kohde |
| `GET /api/properties/related/[id]` | Saman talon muut asunnot |

---

## Responsiivisuus

| Breakpoint | Grid | Kuvaus |
|------------|------|--------|
| Mobile < 640px | 1 col | Yksi kortti per rivi |
| Tablet 640-1024px | 2 col | Kaksi korttia per rivi |
| Desktop > 1024px | 4 col | Neljä korttia per rivi |

```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7"
```

Max-width: `max-w-7xl` (1280px)

---

## Kielletyt asiat

- **Uudet värit** - käytä vain olemassa olevia tokeneita
- **Räikeät varjot** - vain määritellyt hienovaraiset
- **Liukuvärit/gradientit** - ei koskaan
- **Vaihtelevat pyöristykset** - pidä kiinni määritellyistä
- **Sisäkkäiset linkit** - kortti = yksi linkki
- **Emojit** - ellei erikseen pyydetä
- **Ulkoiset UI-kirjastot** - ei Material, Chakra, yms.
- **Animaatiot** - ei "pomppivia" hover-efektejä
- **Tumma teema** - ei toteutettu
- **Nolla-arvot** - ei näytetä (0 €/kk, 0 m², 0 huonetta)
- **Matterport suora lataus** - aina lazy-load klikkauksesta

---

## Sallitut asiat

- Olemassa olevien tokenien käyttö
- Hienovaraiset hover-siirtymät (transition duration-300)
- Backdrop-blur badgeissa (backdrop-blur-md)
- Ring fokuskehyksenä
- Pyörivä kuvagalleria
- Matterport-iframe upotus (lazy-load)

---

## Tiedostorakenne

```
/opt/vuokra-platform/apps/esittely/
├── app/
│   ├── layout.tsx              # Root layout (lang="fi")
│   ├── page.tsx                # Etusivu (listaus)
│   ├── globals.css             # Värit ja tokenit
│   ├── kohde/[id]/page.tsx     # Kohteen sivu
│   ├── admin/images/[id]/      # Kuvien valinta-admin
│   └── api/
│       ├── properties/         # Kohde-API
│       │   ├── route.ts        # GET kaikki
│       │   ├── [id]/route.ts   # GET yksittäinen
│       │   └── related/[id]/   # Saman talon kohteet
│       └── images/
│           ├── process/        # Kuvan käsittely (Sharp)
│           ├── raw/            # Raakakuvien listaus
│           └── done/           # Valmis-merkinnät
├── components/
│   ├── property-card.tsx       # Kohdekortti
│   ├── property-grid.tsx       # Korttien ruudukko
│   └── filter-bar.tsx          # Suodattimet
├── lib/
│   ├── properties.ts           # Tyypit ja fetch
│   └── utils.ts                # cn() helper
└── public/
    └── images/                 # Käsitellyt kohdekuvat (WebP)
        └── {db_id}/
            ├── 01-thumb.webp
            ├── 01-card.webp
            ├── 01-large.webp
            └── 01-hero.webp
```

---

## Admin-käyttöliittymä (kuvien valinta)

**URL:** `/admin/images/{db_id}`

**Toiminnot:**
- Sivupalkki: kaikki kohteet joilla raakakuvia dropzonessa
- Kuvien esikatselu ja valinta
- Saman talon muiden asuntojen valinta (kuvien kopiointi)
- "Merkitse valmiiksi" -nappi (siirtyy seuraavaan)
- Kuvan poisto (punainen X)

**Raakakuvien sijainti:**
- Linux: `/srv/shared/DROPZONE/vuokra-images-raw/{db_id}/`
- Windows: `Z:\vuokra-images-raw\{db_id}\`

**Käsittelyn jälkeen:**
- 4 WebP-tiedostoa per kuva (thumb, card, large, hero)
- Raakakuva poistetaan automaattisesti
- Tyhjä kansio poistetaan

---

## GitHub

**Repository:** https://github.com/haikaju-blip/vuokra-asunnot

---

## Yhteenveto: Design System

| Ominaisuus | Arvo |
|------------|------|
| Brändi | ELEA asunnot |
| Primary väri | oklch(0.45 0.12 250) - sininen |
| Tausta | oklch(0.985 0.002 90) - lämmin vaalea |
| Pyöristys (kortit) | 16px |
| Pyöristys (napit) | 12px |
| Varjo (oletus) | 0_1px_2px_rgba(16,24,40,0.06) |
| Varjo (hover) | 0_8px_20px_rgba(16,24,40,0.10) |
| Fontti | system-ui sans-serif |
| Grid desktop | 4 saraketta |
| Max-width | 1280px (max-w-7xl) |
| Kuvasuhde | 4:3 (kaikki koot) |
| Kuvaformaatti | WebP |
| Korttikuva | srcSet: thumb/card/large |
| Hero-kuva | srcSet: card/large/hero + fetchPriority="high" |
| Kuvan laatu | 75-82% (koon mukaan) |
| Matterport | Lazy-load klikkauksesta |

---

## Päivityshistoria

| Päivä | Muutos |
|-------|--------|
| 2026-02-02 | ELEA-brändiohje yhteensopivuus (brändi, puuttuvat tiedot, Matterport lazy-load) |
| 2026-02-02 | srcSet + sizes responsiivisille kuville |
| 2026-02-02 | Responsiivinen kuvaoptimointi (4 kokoa, WebP) |
| 2026-02-02 | Admin-käyttöliittymä kuvien valintaan |
| 2026-02-02 | Alkuperäinen dokumentaatio |
