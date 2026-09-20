# PassProve — administrační portál

Zdrojové kódy administrace v Next.js a TypeScriptu pro firmy, e-shopy, ověření, chyby, transakce a nastavení. Datová vrstva využívá klientské a serverové funkce Supabase.

**Stav:** Starší/souběžná implementace. Lokální instalaci blokuje neplatný `package.json`.

## Rozsah a architektura

- `app/admin/` — administrační stránky a rozvržení.
- `components/admin/` — přehledy, tabulky, podrobnosti a nastavení.
- `lib/supabase/` — databázoví klienti a typy.
- `supabase/migrations/` — migrace schématu a administračního zabezpečení.
- `middleware.ts` a `hooks/use-admin.ts` — zdroje řízení přístupu k požadavkům a rozhraní.

## Co blokuje spuštění

Objekt závislostí obsahuje samostatnou položku `"@rc-component/color-picker"` bez hodnoty, takže dokument není platný JSON. Před instalací opravte manifest a slaďte jej se souborem uzamčených verzí závislostí. Deklarované příkazy jsou `dev` (`next dev`), `build` (`next build`) a `start` (`next start`); při kontrole nebyly spuštěny.

## Poznámky k údržbě

Konfiguraci Supabase a přístupové politiky ověřte v odděleném vývojovém projektu. Složka `smazat/` obsahuje souběžné zdroje stránek; její název není pokynem k odstranění. Ochrana stránek nenahrazuje oprávnění na serveru. Tato změna README nemění cesty, migrace ani chování aplikace.

## Přínos pro portfolio

Reference pro provozní přehledy, administrační postupy a typovanou databázovou integraci. Před prezentací jako udržovaného vydání je nutné projekt sjednotit a zajistit opakovatelné sestavení.
