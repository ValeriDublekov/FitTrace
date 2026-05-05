# AI Guidelines for Fitness Tracker PWA

## Code Quality & Architecture Constraints
- **Separation of Concerns:** Keep UI components dumb. Extract business logic, Firebase calls, and state management into Custom React Hooks (e.g., `useExercises`, `useWorkoutSession`).
- **File Size Limits:** Keep files under 200 lines. If a component grows larger, split it into smaller sub-components.
- **Folder Structure:** Use a feature-based or strict domain-based structure (`/components`, `/hooks`, `/services/firebase`, `/types`, `/utils`).
- **Types:** Use TypeScript strictly. Define interfaces for all Firestore documents.
- **Best Practices:** Avoid nested ternaries. Early returns are preferred. Use Tailwind CSS for styling, keeping classes organized.
- **Documentation:** Update the `ARCHITECTURE.md` and `PRD.md` whenever core logic or database schemas change.
- **Mobile First:** Ensure the UI is optimized for Android (touch targets, bottom nav, fluid layout).
