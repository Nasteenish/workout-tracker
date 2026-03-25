#!/usr/bin/env node
/**
 * sync_exercises.js — Синхронизирует exercises_db.js из Supabase
 *
 * Использование:
 *   node tools/sync_exercises.js
 *
 * После запуска:
 *   git add js/exercises_db.js && git commit -m "sync: update exercises from Supabase" && git push
 */

const SUPABASE_URL = 'https://mqyfdbfdeuwojgexhwpy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzE1OTYsImV4cCI6MjA4NzQ0NzU5Nn0.5okpQM-UffmYatsVjbzjafsHhY3taCqhDYkiyEjiSvg';

const CATEGORIES = [
    { id: 'abdominals', nameRu: 'Пресс' },
    { id: 'abductors', nameRu: 'Отводящие' },
    { id: 'adductors', nameRu: 'Приводящие' },
    { id: 'biceps', nameRu: 'Бицепс' },
    { id: 'calves', nameRu: 'Икры' },
    { id: 'cardio', nameRu: 'Кардио' },
    { id: 'chest', nameRu: 'Грудь' },
    { id: 'forearms', nameRu: 'Предплечья' },
    { id: 'glutes', nameRu: 'Ягодицы' },
    { id: 'hamstrings', nameRu: 'Бицепс бедра' },
    { id: 'lats', nameRu: 'Широчайшие' },
    { id: 'lower_back', nameRu: 'Нижняя спина' },
    { id: 'neck', nameRu: 'Шея' },
    { id: 'quadriceps', nameRu: 'Квадрицепс' },
    { id: 'shoulders', nameRu: 'Плечи' },
    { id: 'traps', nameRu: 'Трапеции' },
    { id: 'triceps', nameRu: 'Трицепс' },
    { id: 'upper_back', nameRu: 'Верхняя спина' },
];

const CATEGORY_LABELS = {
    abdominals: 'Пресс',
    abductors: 'Отводящие',
    adductors: 'Приводящие',
    biceps: 'Бицепс',
    calves: 'Икры',
    cardio: 'Кардио',
    chest: 'Грудь',
    forearms: 'Предплечья',
    glutes: 'Ягодицы',
    hamstrings: 'Бицепс бедра',
    lats: 'Широчайшие',
    lower_back: 'Нижняя спина',
    neck: 'Шея',
    quadriceps: 'Квадрицепс',
    shoulders: 'Плечи',
    traps: 'Трапеции',
    triceps: 'Трицепс',
    upper_back: 'Верхняя спина',
};

async function fetchAllExercises() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/exercises?select=name_ru,name_en,primary_muscles&order=name_ru`,
        {
            headers: {
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`,
            }
        }
    );
    if (!res.ok) throw new Error(`Supabase error: ${res.status} ${await res.text()}`);
    return res.json();
}

function escape(str) {
    return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function main() {
    console.log('Загружаем упражнения из Supabase...');
    const exercises = await fetchAllExercises();
    console.log(`Получено: ${exercises.length} упражнений`);

    // Группируем по категории (первый элемент primary_muscles)
    const byCategory = {};
    const unknown = [];

    for (const ex of exercises) {
        const cat = (ex.primary_muscles && ex.primary_muscles[0]) || null;
        if (cat && CATEGORY_LABELS[cat]) {
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(ex);
        } else {
            unknown.push(ex);
        }
    }

    if (unknown.length > 0) {
        console.warn(`⚠️  ${unknown.length} упражнений без категории (пропущены):`);
        unknown.forEach(e => console.warn('   -', e.name_ru || e.name_en));
    }

    // Строим файл
    let lines = [];
    lines.push(`// exercises_db.js — Exercise library (${exercises.length - unknown.length} exercises)`);
    lines.push(`// Автогенерируется скриптом tools/sync_exercises.js — не редактировать вручную`);
    lines.push('');
    lines.push('export const EXERCISE_CATEGORIES = [');
    for (const cat of CATEGORIES) {
        lines.push(`    { id: '${cat.id}', nameRu: '${cat.nameRu}' },`);
    }
    lines.push('];');
    lines.push('');
    lines.push('export const EXERCISE_DB = [');

    for (const cat of CATEGORIES) {
        const list = byCategory[cat.id];
        if (!list || list.length === 0) continue;
        lines.push(`    // === ${cat.nameRu} (${list.length}) ===`);
        for (const ex of list) {
            lines.push(`    { nameRu: '${escape(ex.name_ru)}', name: '${escape(ex.name_en || '')}', category: '${cat.id}' },`);
        }
    }

    lines.push('];');
    lines.push('');

    const content = lines.join('\n');

    const { writeFileSync } = await import('fs');
    const { resolve } = await import('path');
    const outPath = resolve(process.cwd(), 'js/exercises_db.js');
    writeFileSync(outPath, content, 'utf8');

    console.log(`✅ Готово! Записано в ${outPath}`);
    console.log('');
    console.log('Следующий шаг:');
    console.log('  git add js/exercises_db.js && git commit -m "sync: update exercises from Supabase" && git push');
}

main().catch(e => { console.error('Ошибка:', e.message); process.exit(1); });
