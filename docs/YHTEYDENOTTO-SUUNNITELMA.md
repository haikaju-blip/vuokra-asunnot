# ELEA Yhteydenottolomake — Suunnitelma v1

> Iterointidokumentti. Päivitetään keskustelun edetessä.

---

## 1. TAVOITE

Kerätä vuokra-asuntokandidaateilta tarvittavat tiedot tehokkaasti ja ohjata heidät oikeaan prosessiin.

---

## 2. AVOIMET KYSYMYKSET (päätettävä)

### A) Mihin yhteydenotot tulevat?

| Vaihtoehto | Plussat | Miinukset |
|------------|---------|-----------|
| **1. Sähköposti** (asunnot@elea.fi) | Tuttu, helppo vastata, ei järjestelmävaatimuksia | Hukkuu muuhun postiin, ei strukturoitu |
| **2. Tietokanta** (SQLite/Postgres) | Kaikki yhdessä paikassa, tilastot, haku | Vaatii admin-näkymän, vastaus erikseen |
| **3. Molemmat** | Ilmoitus + arkisto | Monimutkaisin, duplikaattiriski |
| **4. WhatsApp/Telegram** | Nopea, keskustelunomainen | Ei strukturoitu, henkilöityy |
| **5. Lomakepalvelu** (Typeform, Tally) | Helppo analytiikka, ehdolliset kysymykset | Kolmas osapuoli, ei integraatio |

**Suositus:** Vaihtoehto 3 — sähköposti-ilmoitus + tietokantaan tallennus. Admin-näkymä myöhemmin.

---

### B) Miten vastaat yhteydenottoon?

| Vaihtoehto | Kuvaus |
|------------|--------|
| **1. Manuaalisesti** | Luet viestin, vastaat sähköpostilla/puhelimella |
| **2. Auto-reply** | Välitön kuittaus: "Kiitos yhteydenotostasi, olemme yhteydessä X arkipäivän kuluessa" |
| **3. Bot / AI** | Esittää jatkokysymyksiä, kerää lisätietoja |
| **4. Ajanvaraus** | Ohjaa suoraan kalenteriin näyttöajan varaamiseen |

**Suositus:** Vaihtoehto 2 (auto-reply) + manuaalinen jatkokäsittely alkuun. Ajanvaraus mahdollinen jatko.

---

### C) Haluatko suodattaa/kvalifioida kandidaatteja?

Lomake voi toimia "portinvartijana" — ei-toivotut hakijat karsiutuvat jo lomakevaiheessa.

**Esimerkkikysymyksiä kvalifiointiin:**
- Milloin muuttaisit? (→ onko kiireellinen/realistinen)
- Oletko työssä/opiskelija/muu? (→ maksukyvyn arviointi)
- Tupakoitko? (→ instant dealbreaker?)
- Onko sinulla lemmikkejä? (→ jos kohde ei salli)

---

## 3. LOMAKKEEN KENTÄT

### Pakolliset (candidate MUST provide)

| Kenttä | Tyyppi | Validointi | Miksi pakollinen |
|--------|--------|------------|------------------|
| **Nimi** | text | min 2 merkkiä | Perus identifiointi |
| **Sähköposti** | email | regex | Vastauskanava |
| **Puhelin** | tel | Suomen numero | Nopea yhteys, näyttöjen sopiminen |

### Kvalifioivat (candidate SHOULD provide)

| Kenttä | Tyyppi | Vaihtoehdot | Miksi |
|--------|--------|-------------|-------|
| **Muuttoaikataulu** | select | Heti / 1-2 kk / 3+ kk / En tiedä | Priorisointi |
| **Asukkaiden määrä** | select | 1 / 2 / 3+ | Sopivuus kohteeseen |
| **Tilanne** | select | Töissä / Opiskelija / Eläkeläinen / Muu | Maksukykyarvio |

### Vapaaehtoiset

| Kenttä | Tyyppi | Huom |
|--------|--------|------|
| **Viesti** | textarea | Vapaa viesti, esitäytetty placeholder |
| **Miten kuulit meistä?** | select | Markkinoinnin seuranta |

---

## 4. LOMAKKEEN RAKENNE (ehdotus)

```
┌─────────────────────────────────────────────────────────────┐
│                                                         [✕] │
│                                                             │
│   OTA YHTEYTTÄ                                              │
│                                                             │
│   ┌───────────────────────────────────────────────────┐    │
│   │  📍 Isokatu 60, Oulu                              │    │
│   │     615 €/kk · 27 m² · 1h+avok                    │    │
│   └───────────────────────────────────────────────────┘    │
│                                                             │
│   ─────────────────────────────────────────────────────    │
│                                                             │
│   Yhteystietosi                                             │
│                                                             │
│   Nimi *                                                    │
│   ┌─────────────────────────────────────────────────┐      │
│   │ Matti Meikäläinen                               │      │
│   └─────────────────────────────────────────────────┘      │
│                                                             │
│   Sähköposti *                                              │
│   ┌─────────────────────────────────────────────────┐      │
│   │ matti@example.com                               │      │
│   └─────────────────────────────────────────────────┘      │
│                                                             │
│   Puhelin *                                                 │
│   ┌─────────────────────────────────────────────────┐      │
│   │ 040 123 4567                                    │      │
│   └─────────────────────────────────────────────────┘      │
│                                                             │
│   ─────────────────────────────────────────────────────    │
│                                                             │
│   Taustatiedot                                              │
│                                                             │
│   Milloin voisit muuttaa? *                                 │
│   ○ Heti kun mahdollista                                    │
│   ○ 1–2 kuukauden sisällä                                   │
│   ○ 3+ kuukauden päästä                                     │
│   ○ En ole vielä varma                                      │
│                                                             │
│   Montako henkilöä muuttaisi?                               │
│   ○ 1     ○ 2     ○ 3+                                      │
│                                                             │
│   Viesti (vapaaehtoinen)                                    │
│   ┌─────────────────────────────────────────────────┐      │
│   │ Hei! Olen kiinnostunut asunnosta. Voisinko      │      │
│   │ tulla katsomaan sitä?                           │      │
│   │                                                 │      │
│   └─────────────────────────────────────────────────┘      │
│                                                             │
│   ─────────────────────────────────────────────────────    │
│                                                             │
│   □ Hyväksyn tietojeni käsittelyn yhteydenottoa varten *   │
│                                                             │
│   ┌─────────────────────────────────────────────────┐      │
│   │              LÄHETÄ YHTEYDENOTTO                │      │
│   └─────────────────────────────────────────────────┘      │
│                                                             │
│   Vastaamme yleensä 1–2 arkipäivän kuluessa.               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. REITTI

### Vaihtoehto A: Modal etusivulla (ohjeen mukainen)
```
/                          ← Korteissa "Ota yhteyttä" -painike
                           ← Klikkaus avaa modalin
                           ← Lomake lähetetään API:lle
```

**Plussat:** Nopein polku, yksi klikkaus
**Miinukset:** Modal rajoittaa tilaa, ei omaa URL:ia (ei jaettavissa)

### Vaihtoehto B: Erillinen sivu
```
/kohde/[id]               ← Kohdesivulla "Ota yhteyttä" -painike
/yhteydenotto/[id]        ← Oma sivu lomakkeelle
```

**Plussat:** Enemmän tilaa, oma URL, voi jakaa
**Miinukset:** Yksi klikkaus lisää

### Vaihtoehto C: Hybdridi
```
Etusivu: Modal (nopea)
Kohdesivu: Erillinen sivu TAI modal (käyttäjän valinta)
```

**Suositus:** Vaihtoehto A (modal) alkuun, helppo laajentaa B:ksi myöhemmin.

---

## 6. TEKNINEN TOTEUTUS (hahmotelma)

### Tiedostot

```
app/
├── api/
│   └── contact/
│       └── route.ts           ← POST: vastaanota lomake
components/
├── contact-modal.tsx          ← Modal + lomake
├── property-card.tsx          ← CTA-painike (päivitetään)
lib/
├── contact.ts                 ← Tyyppi + sähköpostilähetys
```

### API: POST /api/contact

```typescript
// Vastaanottaa
{
  propertyId: string
  propertyName: string
  propertyAddress: string
  name: string
  email: string
  phone: string
  moveTimeline: "asap" | "1-2months" | "3+months" | "unknown"
  occupants: "1" | "2" | "3+"
  message?: string
  gdprConsent: true
}

// Tekee
1. Validoi kentät
2. Tallentaa tietokantaan (myöhemmin)
3. Lähettää sähköpostin: asunnot@elea.fi
4. Lähettää auto-reply: hakijalle
5. Palauttaa { success: true }
```

### Sähköpostin sisältö (asunnot@elea.fi)

```
Aihe: 🏠 Yhteydenotto: Isokatu 60, Oulu

Uusi yhteydenotto asunnosta:

KOHDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Isokatu 60, Oulu
615 €/kk · 27 m²
https://asunnot.elea.fi/kohde/isokatu-60-b52

HAKIJA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nimi: Matti Meikäläinen
Sähköposti: matti@example.com
Puhelin: 040 123 4567

TAUSTATIEDOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Muuttoaikataulu: 1–2 kuukauden sisällä
Asukkaiden määrä: 2

VIESTI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hei! Olen kiinnostunut asunnosta. Voisinko tulla katsomaan sitä?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lähetetty: 5.2.2026 klo 14:32
```

### Auto-reply (hakijalle)

```
Aihe: Kiitos yhteydenotostasi — ELEA asunnot

Hei Matti,

Kiitos yhteydenotostasi koskien kohdetta Isokatu 60, Oulu.

Olemme vastaanottaneet viestisi ja palaamme asiaan 1–2 arkipäivän kuluessa.

Jos asia on kiireellinen, voit soittaa numeroon 040 XXX XXXX.

Ystävällisin terveisin,
ELEA asunnot

---
Tämä on automaattinen viesti. Ethän vastaa tähän viestiin.
```

---

## 7. PRIORITEETTIJÄRJESTYS

1. **MVP:** CTA-painike → Modal → Sähköposti (ei tietokantaa)
2. **V2:** Tallennus tietokantaan + admin-näkymä
3. **V3:** Auto-reply hakijalle
4. **V4:** Kvalifioivat kysymykset + analytiikka
5. **V5:** Ajanvarausintegraatio

---

## 8. PÄÄTÖKSET (täytetään yhdessä)

| Kysymys | Päätös | Päivämäärä |
|---------|--------|------------|
| Mihin yhteydenotot tulevat? | __________ | ______ |
| Mihin osoitteeseen sähköposti? | __________ | ______ |
| Auto-reply käytössä? | Kyllä / Ei | ______ |
| Pakolliset kentät | Nimi, email, puh, muuttoaika | ______ |
| Kvalifioivat kysymykset käytössä? | Kyllä / Ei | ______ |
| Lemmikit/tupakointi-kysymys? | Kyllä / Ei | ______ |
| GDPR-checkbox? | Kyllä (pakollinen) | ______ |

---

## 9. SEURAAVAT ASKELEET

1. **Käydään läpi tämä dokumentti** — päätökset avoimiin kysymyksiin
2. **Toteutetaan CTA-painike** kortteihin (teknisesti helppo)
3. **Rakennetaan lomake-modal** päätösten mukaan
4. **Kytketään sähköpostilähetys** (Nodemailer / Resend / SendGrid)
5. **Testataan flow läpi**

---

*Dokumentti päivitetty: 5.2.2026*
