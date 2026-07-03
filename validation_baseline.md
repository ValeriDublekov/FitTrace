# Validation Baseline

This file establishes a clean baseline of the system's typescript check and markdown lint status before any refactoring begins.

## Date & Environment
- **Date Check:** 2026-07-03T00:09:30-07:00
- **Local Time:** 2026-07-03 00:09

---

## 1. Dependency Installation & Dev Environment
- Run context: Dependencies are already pre-installed in the environment.
- Service Start: No missing packages or server start blocking blocks for baseline.

---

## 2. TypeScript/Lint Validation (`npm run lint` / `tsc --noEmit`)
- **Command:** `npm run lint` (`tsc --noEmit`)
- **Status:** **PASS** (Exit Code: 0)
- **Output:**
```text
> fittrace@0.1.0 lint
> tsc --noEmit
```

---

## 3. Production Build Validation (`npm run build`)
- **Command:** `npm run build`
- **Status:** **PASS** (Exit Code: 0)
- **Output:**
```text
> fittrace@0.1.0 build
> node scripts/generate-sounds-manifest.js && vite build

✅ Generated sounds manifest: 3 files found.
vite v6.4.2 building for production...
transforming...
✓ 2880 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                      0.56 kB │ gzip:   0.32 kB
dist/manifest.webmanifest                            0.74 kB
dist/assets/index-CXwssjWy.css                      67.24 kB │ gzip:  11.67 kB
dist/assets/workbox-window.prod.es5-BBnX5xw4.js      5.75 kB │ gzip:   2.36 kB
dist/assets/index-B2TX3-wy.js                    1,928.14 kB │ gzip: 502.43 kB
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 11.39s
PWA v1.3.0
mode      generateSW
precache  7 entries (1955.26 KiB)
files generated  dist/sw.js  dist/workbox-afac4cd2.js
```

---

## 4. Markdown Lint Verification
- **Command:** `npx -y markdownlint-cli ./*.md`
- **Status:** **FAIL** (Exit Code: 1)
- **Trace Output:**
Below is the output of flagged Markdown rule violations (MD047, MD060) across system documentation files:

```text
./AI_EXECUTION_PROMPTS.md:985:48 error MD047/single-trailing-newline Files should end with a single newline character
./analysis_and_execution_plan.md:18:5 error MD060/table-column-style Table column style [Table pipe is missing space to the left for style "compact"].
./analysis_and_execution_plan.md:18:9 error MD060/table-column-style Table column style [Table pipe is missing space to the left for style "compact"].
./analysis_and_execution_plan.md:18:13 error MD060/table-column-style Table column style [Table pipe is missing space to the left for style "compact"].
./analysis_and_execution_plan.md:18:17 error MD060/table-column-style Table column style [Table pipe is missing space to the left for style "compact"].
./analysis_and_execution_plan.md:18:1 error MD060/table-column-style Table column style [Table pipe is missing space to the right for style "compact"].
./analysis_and_execution_plan.md:18:5 error MD060/table-column-style Table column style [Table pipe is missing space to the right for style "compact"].
./analysis_and_execution_plan.md:18:9 error MD060/table-column-style Table column style [Table pipe is missing space to the right for style "compact"].
./analysis_and_execution_plan.md:18:13 error MD060/table-column-style Table column style [Table pipe is missing space to the right for style "compact"].
./POST_PLAN_IMPROVEMENTS.md:251:42 error MD047/single-trailing-newline Files should end with a single newline character
```
