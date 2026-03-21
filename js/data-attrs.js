/* ===== Data-Attribute Registry ===== */
/* Single source of truth for all data-attribute names used across renderers and handlers.
   Eliminates magic strings, prevents namespace collisions, and makes the contract explicit. */

// --- Workout day display (ui.js → app.js) ---
export const WORKOUT = {
    EXERCISE:        'data-exercise',
    SET:             'data-set',
    SEG:             'data-seg',
    EX_NAME:         'data-ex-name',          // renamed: was data-exname
    EX_NAME_RU:      'data-ex-name-ru',       // renamed: was data-exname-ru (also used in builder picker)
    CHOICE_KEY:      'data-choice-key',
    EXERCISE_ID:     'data-exercise-id',
    TARGET_EXERCISE: 'data-target-exercise',
    SUB_NAME:        'data-sub-name',
};

// --- Program builder (builder.js internal) ---
export const BUILDER = {
    ITEM:         'data-item',
    ITEM_IDX:     'data-item-idx',
    SUB:          'data-sub',
    SUB_IDX:      'data-sub-idx',
    TYPE:         'data-type',
    TECH:         'data-tech',
    RULE:         'data-rule',
    DAY:          'data-day',
    VAL:          'data-val',
    MAX:          'data-max',
    RPE:          'data-rpe',
    CAT:          'data-cat',
    IDX:          'data-idx',
    ORIG_IDX:     'data-orig-idx',
    CHECK_IDX:    'data-check-idx',
    SPLIT_IDX:    'data-split-idx',
    DEL_SUB:      'data-del-sub',
    DEL_SUB_ITEM: 'data-del-sub-item',
};

// --- Equipment management (equipment-manager.js ↔ app.js) ---
export const EQ = {
    ID:           'data-eq-id',
    NAME:         'data-eq-name',             // renamed: was data-name (collision!)
    GYM_ID:       'data-gym-id',
    CATALOG_ID:   'data-catalog-id',
    IMAGE:        'data-image',
    BRAND:        'data-brand',
    EXTYPE:       'data-extype',
    GYM_SHARED_ID:'data-id',
};

// --- Social / checkins (social-ui.js ↔ app.js) ---
export const SOCIAL = {
    CHECKIN:      'data-checkin',
    COMMENT:      'data-comment',
    COMMENT_ID:   'data-comment-id',          // renamed: was data-commentid
    USERNAME:     'data-username',
    UID:          'data-uid',
    DISPLAY_NAME: 'data-display-name',        // renamed: was data-name (collision!)
    TAB:          'data-tab',
    USER:         'data-user',
    CONV:         'data-conv',
};

// --- Inline editor (inline-editor.js ↔ ui.js → workout-ui.js) ---
export const INLINE = {
    GROUP_IDX: 'data-group-idx',   // index in exerciseGroups[]
    EX_ID:     'data-inline-ex',   // exercise ID for menu actions
};

// --- Settings / auth / onboarding (builder.js → app.js) ---
export const SETTINGS = {
    TARGET: 'data-target',
    CYCLE:  'data-cycle',
    UNIT:   'data-unit',
    LANG:   'data-lang',
};

export const ONBOARDING = {
    GENDER:   'data-gender',
    ROLE:     'data-role',
    GOAL:     'data-goal',
    PRO:      'data-pro',
    CLIENTS:  'data-clients',
    CATEGORY: 'data-category',
    PHASE:    'data-phase',
};

// --- Helpers ---

/**
 * Generate an HTML attribute fragment for use in innerHTML strings.
 * attr(WORKOUT.EXERCISE, 'D1E2') → 'data-exercise="D1E2"'
 */
export function attr(name, value) {
    return name + '="' + value + '"';
}

// Internal: convert 'data-foo-bar' → 'fooBar' for dataset access
function _toDatasetKey(name) {
    return name.slice(5).replace(/-([a-z])/g, function(_, c) { return c.toUpperCase(); });
}

/**
 * Read a data attribute from an element.
 * read(el, WORKOUT.EXERCISE) → el's data-exercise value or null
 */
export function read(el, name) {
    return el ? el.getAttribute(name) : null;
}

/**
 * Read a data attribute as integer.
 * readInt(el, BUILDER.ITEM) → parseInt of the attribute value
 */
export function readInt(el, name) {
    var v = el ? el.getAttribute(name) : null;
    return v != null ? parseInt(v) : NaN;
}

/**
 * Write a data attribute on an existing DOM element.
 * write(el, BUILDER.ITEM_IDX, 3)
 */
export function write(el, name, value) {
    if (el) el.setAttribute(name, value);
}
