
# Add browser-safe crypto polyfills, WebCrypto fallbacks and modern encryption tools

## Description
Summary: Add pure‑TS crypto polyfills and WebCrypto fallbacks to restore legacy algorithms in the browser build, register several modern encryption tools, remove the problematic `MCDTool`, and fix bundler/parse errors so the dev build succeeds.

Motivation & context: The dev/build process failed due to imports of missing `crypto-js/*` submodules and unavailable legacy algorithms in browser builds. This change provides local, audited-by-dev (but untrusted-for-production) pure‑TS polyfills and WebCrypto fallbacks to enable the encryption tools UI to load and operate in modern browsers, while preventing bundler pre-transform failures by aliasing imports to local implementations.

Dependencies: No new runtime npm dependencies — polyfills are implemented in TypeScript and rely on the browser WebCrypto API. Please run a fresh install after review:
```bash
npm ci
```

Fixes: Fixes #<issue-number> (replace with actual issue number)

---

## Type of change
- [x] Bug fix (fixes build/runtime errors and restores legacy algorithm availability)
- [x] New feature (adds modern encryption tool placeholders and polyfills)
- [ ] Breaking change

---

## How Has This Been Tested?

Reproduction / verification steps:

1. Install dependencies and run dev server:
   ```bash
   npm ci
   npm run dev
   ```
2. Open the app and navigate to encryption tools:
   - Verify pages load for PBKDF2, MD2, MD4, MDC2, CAST5 (polyfilled), Ed25519, X25519, ChaCha20/XChaCha20 (polyfilled).
3. Smoke tests:
   - PBKDF2: derive a key for a known password+salt and compare to expected vector.
   - SHA‑3/MD2/MD4: confirm outputs with known test vectors.
   - ChaCha20/XChaCha20: encrypt→decrypt roundtrip succeeds.
4. Confirm terminal shows no Vite/esbuild pre-transform parse errors.

Tests run:
- [x] Dev server starts without pre-transform errors
- [x] Manual interactive verification of tool pages and basic encrypt/decrypt or sign/verify flows

---

## Files / Areas Changed (high level)
- Polyfills: `src/lib/crypto-polyfills/` (MD2, MD4, MDC2, ChaCha20/XChaCha20, CAST5 shim, SHA‑3)
- Tools: `src/components/tools/encryption/` (new placeholders and updated legacy tools)
- Tool registration: `src/components/tools/encryption/index.tsx`
- Data: `src/data/tools.ts`
- Config: `vite.config.ts` (alias mappings), `package.json`, `package-lock.json`, `eslint.config.js`
- Public assets: `public/rss.xml`, `public/sitemap.xml`, `public/timezones.json`
- Removed: `src/components/tools/encryption/MCDTool.tsx`

---

## Risks / Notes for Reviewers
- Polyfills are hand-implemented for browser compatibility and need security review and test vectors before production use.
- CAST5 is implemented as a browser-safe AES‑CBC shim (PBKDF2 → AES‑CBC) — not true CAST5; may not interoperate with systems expecting CAST5.
- Recommend adding unit tests with official vectors for MD2/MD4/MDC2/ChaCha/XChaCha/SHA‑3 and PBKDF2.
- If reviewers prefer, we can replace specific polyfills with vetted npm packages (tradeoff: bundle size).

---

## Suggested Verification Checklist
- [ ] `npm ci` runs without issues
- [ ] `npm run dev` starts and shows no pre-transform/esbuild parse errors
- [ ] Encryption tool pages load (legacy + modern placeholders)
- [ ] Run test vectors for MD2/MD4/SHA‑3/PBKDF2 and confirm matches
- [ ] ChaCha20/XChaCha20 encrypt→decrypt roundtrip passes
- [ ] Confirm `MCDTool` removed across UI and data entries

---

## Next steps (recommended)
- Add automated unit tests using official test vectors for all polyfills.
- Replace hand-rolled polyfills with audited libraries or WebCrypto-native implementations where available.
- Decide whether to keep CAST5 as AES‑CBC shim or integrate a true CAST5 implementation (if required).

---

If you want, I can:
- Open a PR branch, commit these changes and push them, or
- Generate a small test suite with official vectors for MD4/ChaCha20/PBKDF2 before creating the PR.

Which do you prefer?
