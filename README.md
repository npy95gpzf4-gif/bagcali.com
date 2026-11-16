# BAGCALI

Company website and Trade onboarding demo.

## Existing website

`public/` preserves the current company website, login prototypes and cookie consent. Upload the contents to the cPanel document root to update the existing site. Merge the included HTTPS/www rules with any server-specific `.htaccess` rules.

## Trade demo

`trade/` contains real Supabase Auth integration and simulated exchange connections and paper trading for Binance, OKX, Coinbase, Upbit, Bybit, Bitget, Gate and KuCoin. It never accepts real exchange keys or sends real orders. Demo connections and trading activity are held in memory and reset on reload/sign-out.

Supabase Auth requires the separate BAGCALI project's URL and publishable key. Without configuration, sign-up/sign-in are disabled with an explanatory message. No database schema for exchange connections, secrets or transactions is created in this phase.

## Development

Use Node 24. Copy `.env.example` to `.env` and set the public Supabase configuration.

```sh
npm ci
npm run dev
npm test
npm run build
```

Open `/trade/` on the development server. Builds preserve the marketing site in `dist/` and emit the trade app into `dist/trade/`.

## Deployment

`netlify.toml` sets `npm run build` and `dist` publishing. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the intended Netlify account and redeploy. Never commit service-role keys, private credentials or `.env`.

The main domain remains on cPanel. Routing `/trade/` to Netlify requires a supported reverse proxy or edge routing; DNS alone cannot route a path. No custom domain, proxy or Netlify deployment is configured by committing this repository.

See [SETUP-TR.md](SETUP-TR.md) for Turkish instructions, Auth redirect settings and current validation limits. Production build and model tests pass; real Auth and hosting tests require connection of the selected Supabase/Netlify accounts. Browser visual QA remains unverified.
