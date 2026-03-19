/* ===== Shared App State ===== */
/* Readable by any module; written by app.js only */
export const AppState = {
    currentWeek: 1,
    currentDay: 1,
    pageCache: {},
    saveDebounced: null
};
