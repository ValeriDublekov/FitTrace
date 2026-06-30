<!-- markdownlint-disable MD013 -->

# FitTrace Post-Plan Improvements

Този документ описва препоръчани подобрения за след изпълнението на
`AI_EXECUTION_PROMPTS.md`. Текущият план стабилизира правилата, типовете,
контекстите, тестовете и документацията. Този follow-up roadmap е за следващия
етап: по-добро продуктово усещане, надеждност, поддръжка и растеж.

## Препоръчителен Ред

1. Offline UX и sync състояния
2. Export, backup и ownership върху данните
3. CI/CD и release hygiene
4. Accessibility и mobile ergonomics pass
5. Workout UX подобрения
6. Progress insights
7. Observability и диагностика
8. Exercise catalog quality
9. Internationalization polish
10. Security и privacy hardening
11. Product feedback loop

## 1. Offline UX И Sync Състояния

**Защо:** FitTrace се ползва в gym среда, където мрежата често е слаба или
нестабилна. Firestore offline cache помага технически, но потребителят трябва да
разбира дали данните са записани, pending или failed.

**Идеи:**

- Показвай глобален статус: `Online`, `Offline`, `Syncing`, `Saved`.
- Показвай локален статус на workout save: `Saved locally`, `Sync pending`,
  `Sync failed`.
- Добави graceful retry при save failure.
- Не изтривай активната сесия при неуспешен save.
- Добави admin/debug екран за pending writes, ако Firebase API позволява
  достатъчно надеждна проверка.
- Добави copy за потребителя, което ясно казва, че workout-ът е запазен локално,
  но още не е синхронизиран.

**Валидация:** ръчно тествай workout save при online, offline и reconnect.

## 2. Export, Backup И Data Ownership

**Защо:** Потребителите ще трупат месеци тренировъчна история. Трябва да могат
да изнесат или възстановят данните си.

**Идеи:**

- Export workouts to JSON.
- Export workout history to CSV.
- Export progress per exercise.
- Import/restore от JSON backup.
- `Delete my data` flow за потребителски данни.
- Admin checklist за периодичен Firestore backup.
- Документирай backup/restore ограниченията: custom exercises, templates,
  historical exercise names и IDs.

**Валидация:** export на реален user, import в тестов user/project, сравнение на
брой workouts/templates/custom exercises.

## 3. CI/CD И Release Hygiene

**Защо:** След като има тестове и стабилни правила, всяка бъдеща промяна трябва
да минава през автоматична проверка.

**Идеи:**

- GitHub Actions или еквивалент за `npm run lint`, `npm run build`, `npm test`.
- Preview build за pull requests, ако hosting средата го поддържа.
- Firebase rules validation job, ако има emulator tests.
- Release checklist: build, tests, rules deploy, smoke test, rollback notes.
- `CHANGELOG.md` или release notes секция.
- Версиониране на production deployments.

**Валидация:** CI pipeline fail-ва при TypeScript грешка, build грешка или
падащ тест.

## 4. Accessibility И Mobile Ergonomics Pass

**Защо:** Приложението е mobile-first и се ползва в движение. Малки UX проблеми
се усещат много силно по време на тренировка.

**Идеи:**

- Проверка на всички touch targets за минимум около 44px.
- Safe-area handling за bottom nav и pinned workout controls.
- Focus trap и Escape behavior в modals.
- ARIA labels за icon-only бутони.
- Видими focus states.
- Contrast проверка за основни текстове, бутони и disabled states.
- Loading, empty и error states за всяка основна страница.
- Проверка на най-дългите BG/EN текстове на малък viewport.

**Валидация:** ръчен mobile pass на Android viewport плюс keyboard-only pass на
desktop.

## 5. Workout UX Подобрения

**Защо:** Това са промени, които най-директно подобряват ежедневното ползване в
реална тренировка.

**Идеи:**

- Custom rest timer per exercise или глобална настройка.
- Quick-add previous set.
- Duplicate exercise in current workout.
- Reorder exercises during active session.
- Mark all sets completed.
- Smart preview на last used weight/reps при избор на упражнение.
- Exercise substitution в template.
- Template folders или categories.
- По-бързо добавяне на custom exercise от active workout flow.
- Confirmation само за destructive actions, без да се прекалява с modal friction.

**Валидация:** ръчен сценарий: започни workout, добави 3 упражнения, промени ред,
дублирай упражнение, завърши workout, провери историята.

## 6. Progress И Insights

**Защо:** След първите няколко седмици стойността на приложението идва от
историята и insight-ите, не само от logging flow-а.

**Идеи:**

- Personal records по упражнение.
- Estimated 1RM за weight/reps упражнения.
- Volume trends: sets, reps, total weight, duration.
- Category/muscle frequency.
- Compare last session vs current session.
- `You have not trained X recently` insight.
- Weekly/monthly summary.
- Progress cards на dashboard-а.
- Филтри по период: 7 days, 30 days, 90 days, all time.

**Валидация:** seed/test user с достатъчно история и проверка на изчисленията
срещу ръчно сметнати примери.

## 7. Observability И Реална Диагностика

**Защо:** Offline/PWA приложенията имат проблеми, които трудно се хващат само с
локални тестове. Нужна е диагностика за failed saves, permission errors и
състояния на sync.

**Идеи:**

- Централизиран client-side error reporting, ако privacy моделът го позволява.
- Breadcrumbs за ключови flow събития: start session, add exercise, finish,
  save failed, sync recovered.
- Логване на Firestore permission failures с operation/path, без sensitive data.
- Admin/debug diagnostics panel.
- Feature flag за verbose diagnostics само в development/admin mode.
- User-facing error IDs, които могат да се споделят при feedback.

**Валидация:** симулирай Firestore failure и провери, че diagnostic trail е
разбираем, но не излага лични данни.

## 8. Exercise Catalog Quality

**Защо:** Каталогът влияе на search, templates, progress analytics и custom
exercise merge flow.

**Идеи:**

- Normalize categories и load types.
- Добави aliases/search keywords.
- Duplicate detection при custom exercises.
- Merge preview: показва кои workouts/templates ще бъдат засегнати.
- Missing image fallback strategy.
- Optional equipment field.
- Muscle/group taxonomy вместо свободен `affectedPart` string, ако продуктът го
  изисква.
- Admin bulk edit/import за global exercises.

**Валидация:** search намира упражнения по име, alias и категория; merge flow не
губи workout history.

## 9. Internationalization Polish

**Защо:** Приложението вече има BG/EN, но bilingual UI лесно събира hardcoded
strings и inconsistent terminology.

**Идеи:**

- Script/test за missing translation keys.
- Audit за hardcoded UI strings.
- Consistent Bulgarian terminology за sets, reps, workout, template, progress.
- Date и number formatting според language.
- Fallback behavior при липсващ translation key.
- Проверка на дълги BG labels в compact mobile UI.

**Валидация:** build/test script за missing keys плюс manual language switch pass.

## 10. Security И Privacy Hardening

**Защо:** След стабилизиране на Firestore rules е полезно да има explicit privacy
и threat model слой.

**Идеи:**

- Threat model документ за auth, Firestore, Storage и admin actions.
- Storage rules review за exercise thumbnails.
- Data retention policy.
- Проверка error logs да не показват sensitive user data в UI.
- Admin action audit trail, ако има повече от един admin.
- Manual security review checklist преди production deploy.
- Privacy copy за потребителя: какви данни се пазят и защо.

**Валидация:** checklist review с един admin и един normal user, включително
опит за достъп до чужди workouts/custom exercises.

## 11. Product Feedback Loop

**Защо:** След стабилен MVP най-добрите следващи задачи трябва да идват от реално
ползване, не само от технически предположения.

**Идеи:**

- Lightweight feedback button.
- Optional feedback prompt след няколко завършени тренировки.
- In-app changelog или release notes.
- First-workout onboarding.
- Admin view за anonymous aggregate feedback, ако privacy моделът го позволява.
- Малки usability въпроси: `What slowed you down?`, `What was confusing?`.

**Валидация:** feedback може да се изпрати, admin може да го види, и flow-ът не
пречи на workout logging.

## Допълнителни Future Ideas

- Progressive overload suggestions.
- Deload/rest recommendations на база история.
- Bodyweight tracking, ако е релевантно.
- Wearable или timer integration.
- Shareable workout templates.
- Public/private template library.
- Exercise notes per user, отделно от session notes.
- Richer dashboard с weekly snapshot.

## Как Да Се Превърне В Следващ Execution Plan

Когато `AI_EXECUTION_PROMPTS.md` е изпълнен, този документ може да се разбие на
нов prompt-by-prompt план. Препоръчително е първият такъв план да бъде само за:

1. Offline UX и sync състояния
2. Export/backup
3. CI/CD

Тези три теми пазят данните, намаляват operational риска и създават основа за
по-агресивни продуктови промени след това.