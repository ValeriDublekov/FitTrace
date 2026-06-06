# Validation Baseline

This file establishes a clean baseline of the system's typescript check and markdown lint status before any refactoring begins.

## Date & Environment
- **Date Check:** 2026-06-06T13:44:12Z
- **Local Time:** 2026-06-06 13:44

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
> react-example@0.1.0 lint
> tsc --noEmit
```

---

## 3. Production Build Validation (`npm run build`)
- **Command:** `npm run build`
- **Status:** **PASS** (Exit Code: 0)
- **Output:** Build completed successfully inside AI Studio.

---

## 4. Markdown Lint Verification
- **Command:** `npx -y markdownlint-cli ./*.md`
- **Status:** **FAIL** (Exit Code: 1)
- **Trace Output:**
Below is the tail of flagged Markdown rule violations (MD013, MD022, MD026, MD031, MD032) across system documentation files:

```text
./FIREBASE_GUIDE.md:25:81 error MD013/line-length Line length [Expected: 80; Actual: 105]
./FIREBASE_GUIDE.md:27 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "### В. Firebase Storage (за снимки на упражнения)"]
./FIREBASE_GUIDE.md:28 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "1. Отидете на **Build > Storag..."]
./FIREBASE_GUIDE.md:31:81 error MD013/line-length Line length [Expected: 80; Actual: 140]
./FIREBASE_GUIDE.md:31 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "4. **Важно:** Трябва да добави..."]
./FIREBASE_GUIDE.md:32 error MD031/blanks-around-fences Fenced code blocks should be surrounded by blank lines [Context: "```javascript"]
./FIREBASE_GUIDE.md:48:81 error MD013/line-length Line length [Expected: 80; Actual: 116]
./FIREBASE_GUIDE.md:50 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "### Стъпки за добавяне:"]
./FIREBASE_GUIDE.md:50:23 error MD026/no-trailing-punctuation Trailing punctuation in heading [Punctuation: ':']
./FIREBASE_GUIDE.md:51 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "1. Влезте в приложението веднъ..."]
./FIREBASE_GUIDE.md:62:81 error MD013/line-length Line length [Expected: 80; Actual: 138]
./FIREBASE_GUIDE.md:66 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "## 3. Локална конфигурация"]
./FIREBASE_GUIDE.md:67:81 error MD013/line-length Line length [Expected: 80; Actual: 183]
./PRD.md:3 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "## 1. Overview"]
./PRD.md:4:81 error MD013/line-length Line length [Expected: 80; Actual: 301]
./PRD.md:6 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "## 2. Target Audience & Roles"]
./PRD.md:7:104 error MD009/no-trailing-spaces Trailing spaces [Expected: 0 or 2; Actual: 1]
./PRD.md:7:81 error MD013/line-length Line length [Expected: 80; Actual: 104]
./PRD.md:7 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "- **Standard User:** Can start..."]
./PRD.md:8:81 error MD013/line-length Line length [Expected: 80; Actual: 168]
./PRD.md:12 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "### 3.1. Authentication & Admin Access"]
./PRD.md:13 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "- User logs in via Google Auth..."]
./PRD.md:15:81 error MD013/line-length Line length [Expected: 80; Actual: 189]
./PRD.md:17 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "### 3.2. Admin: Exercise Management"]
./PRD.md:18 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "- **Add/Edit Exercise:** Admin..."]
./PRD.md:22 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "### 3.2.1. User: Custom Exercises"]
./PRD.md:23:81 error MD013/line-length Line length [Expected: 80; Actual: 113]
./PRD.md:23 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "- **On-the-fly Creation:** Use..."]
./PRD.md:25:81 error MD013/line-length Line length [Expected: 80; Actual: 96]
./PRD.md:26:18 error MD009/no-trailing-spaces Trailing spaces [Expected: 0 or 2; Actual: 1]
./PRD.md:27:81 error MD013/line-length Line length [Expected: 80; Actual: 100]
./PRD.md:28:81 error MD013/line-length Line length [Expected: 80; Actual: 92]
./PRD.md:31 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "### 3.3. Core Workout Flow"]
./PRD.md:32 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "1. **Start Session:** User cli..."]
./PRD.md:34:81 error MD013/line-length Line length [Expected: 80; Actual: 150]
./PRD.md:36:81 error MD013/line-length Line length [Expected: 80; Actual: 93]
./PRD.md:41:81 error MD013/line-length Line length [Expected: 80; Actual: 123]
./PRD.md:44 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "### 3.4. Progress & Analytics"]
./PRD.md:45 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "- **History View:** User selec..."]
./PRD.md:46:81 error MD013/line-length Line length [Expected: 80; Actual: 114]
./PRD.md:48 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "### 3.5. Non-Functional Requirements"]
./PRD.md:49:81 error MD013/line-length Line length [Expected: 80; Actual: 126]
./PRD.md:49 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "- **Offline Mode:** Must handl..."]
./PRD.md:50 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Above] [Context: "## Status Tracking"]
./PRD.md:50 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "## Status Tracking"]
./PRD.md:51 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "- **Phase 1: Basic Foundation:..."]
./PRD.md:53:81 error MD013/line-length Line length [Expected: 80; Actual: 94]
./security_spec.md:3 error MD022/blanks-around-headings Headings should be surrounded by blank lines [Expected: 1; Actual: 0; Below] [Context: "## 1. Data Invariants"]
./security_spec.md:4 error MD032/blanks-around-lists Lists should be surrounded by blank lines [Context: "- An exercise must have a name..."]
./security_spec.md:9:81 error MD013/line-length Line length [Expected: 80; Actual: 94]
./security_spec.md:11:81 error MD013/line-length Line length [Expected: 80; Actual: 94]
./security_spec.md:17:81 error MD013/line-length Line length [Expected: 80; Actual: 92]
./security_spec.md:18:81 error MD013/line-length Line length [Expected: 80; Actual: 101]
./security_spec.md:19:81 error MD013/line-length Line length [Expected: 80; Actual: 105]
./security_spec.md:21:81 error MD013/line-length Line length [Expected: 80; Actual: 92]
./security_spec.md:23:81 error MD013/line-length Line length [Expected: 80; Actual: 94]
./security_spec.md:24:81 error MD013/line-length Line length [Expected: 80; Actual: 103]
./security_spec.md:26:81 error MD013/line-length Line length [Expected: 80; Actual: 92]
./security_spec.md:27:81 error MD013/line-length Line length [Expected: 80; Actual: 91]
./security_spec.md:52:81 error MD013/line-length Line length [Expected: 80; Actual: 92]
./security_spec.md:57:81 error MD013/line-length Line length [Expected: 80; Actual: 90]
./security_spec.md:63:81 error MD013/line-length Line length [Expected: 80; Actual: 110]
./TECHNICAL_DEBT.md:3:81 error MD013/line-length Line length [Expected: 80; Actual: 172]
./TECHNICAL_DEBT.md:7:81 error MD013/line-length Line length [Expected: 80; Actual: 116]
./TECHNICAL_DEBT.md:16:81 error MD013/line-length Line length [Expected: 80; Actual: 100]
./TECHNICAL_DEBT.md:17:81 error MD013/line-length Line length [Expected: 80; Actual: 107]
./TECHNICAL_DEBT.md:20:81 error MD013/line-length Line length [Expected: 80; Actual: 192]
./TECHNICAL_DEBT.md:24:81 error MD013/line-length Line length [Expected: 80; Actual: 167]
./TECHNICAL_DEBT.md:25:81 error MD013/line-length Line length [Expected: 80; Actual: 138]
./TECHNICAL_DEBT.md:26:81 error MD013/line-length Line length [Expected: 80; Actual: 90]
./TECHNICAL_DEBT.md:30:81 error MD013/line-length Line length [Expected: 80; Actual: 293]
```
