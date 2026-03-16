#!/usr/bin/env python3
"""
Export workout logs from Supabase to text files.
Usage: python export-logs.py
Output: logs/<DisplayName>_<username>.txt
"""

import json
import os
import urllib.request
from datetime import datetime

SUPABASE_URL = "https://mqyfdbfdeuwojgexhwpy.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"

LOGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")


def supabase_get(table, select="*"):
    """Fetch data from Supabase REST API using service role key (bypasses RLS)."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={select}"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def find_exercise_name(program, ex_id):
    """Find exercise name by ID in program dayTemplates."""
    if not program or "dayTemplates" not in program:
        return ex_id
    for day_num, day in program["dayTemplates"].items():
        for group in day.get("exerciseGroups", []):
            if group.get("type") == "choose_one":
                for opt in group.get("options", []):
                    if opt.get("id") == ex_id:
                        return opt.get("nameRu") or opt.get("name") or ex_id
            elif group.get("type") == "superset":
                for item in group.get("exercises", []):
                    ex = item if isinstance(item, dict) and "id" in item else item.get("exercise", item) if isinstance(item, dict) else None
                    if ex and ex.get("id") == ex_id:
                        return ex.get("nameRu") or ex.get("name") or ex_id
            else:
                ex = group.get("exercise", {})
                if ex and ex.get("id") == ex_id:
                    return ex.get("nameRu") or ex.get("name") or ex_id
    return ex_id


def get_day_title(program, day_num):
    """Get day title from program."""
    if not program or "dayTemplates" not in program:
        return f"День {day_num}"
    day = program["dayTemplates"].get(str(day_num), {})
    return day.get("titleRu") or day.get("title") or f"День {day_num}"


def format_timestamp(ts):
    """Convert millisecond timestamp to readable date."""
    if not ts:
        return ""
    try:
        return datetime.fromtimestamp(ts / 1000).strftime("%d.%m.%Y %H:%M")
    except (ValueError, OSError):
        return ""


def format_set(set_data):
    """Format a single set: weight × reps."""
    w = set_data.get("weight", 0)
    r = set_data.get("reps", 0)
    unit = set_data.get("unit", "kg")
    completed = set_data.get("completed", False)
    mark = "+" if completed else "-"

    parts = []
    if w:
        parts.append(f"{w} {unit}")
    if r:
        parts.append(f"x {r}")

    # Segments (drop sets, rest-pauses)
    segs = set_data.get("segs", {})
    seg_parts = []
    for seg_idx in sorted(segs.keys(), key=lambda x: int(x)):
        seg = segs[seg_idx]
        sw = seg.get("weight", "")
        sr = seg.get("reps", "")
        if sw or sr:
            seg_str = ""
            if sw:
                seg_str += f"{sw}"
            if sr:
                seg_str += f" x {sr}" if sw else f"x {sr}"
            seg_parts.append(seg_str)

    result = " ".join(parts) if parts else "—"
    if seg_parts:
        result += " → " + " → ".join(seg_parts)
    return f"[{mark}] {result}"


def generate_log_text(profile, user_data):
    """Generate formatted text log for a user."""
    data = user_data.get("data", {})
    log = data.get("log", {})
    program = data.get("program")
    updated = user_data.get("updated_at", "")

    display = profile.get("display_name") or profile.get("username") or "Unknown"
    username = profile.get("username") or "unknown"

    lines = []
    lines.append(f"=== Тренировочный лог: {display} (@{username}) ===")
    lines.append(f"Экспорт: {datetime.now().strftime('%d.%m.%Y %H:%M')}")
    lines.append(f"Последнее обновление: {updated[:10] if updated else '—'}")
    lines.append("")

    if not log:
        lines.append("(нет записей)")
        return "\n".join(lines)

    for week_num in sorted(log.keys(), key=lambda x: int(x)):
        week_data = log[week_num]
        if not week_data:
            continue

        for day_num in sorted(week_data.keys(), key=lambda x: int(x)):
            day_data = week_data[day_num]
            if not day_data:
                continue

            day_title = get_day_title(program, day_num)
            lines.append(f"--- Неделя {week_num}, День {day_num}: {day_title} ---")

            # Find earliest timestamp for date
            timestamps = []
            for ex_id, sets in day_data.items():
                if isinstance(sets, dict):
                    for s_idx, s_data in sets.items():
                        if isinstance(s_data, dict) and s_data.get("timestamp"):
                            timestamps.append(s_data["timestamp"])
            if timestamps:
                lines.append(f"Дата: {format_timestamp(min(timestamps))}")
            lines.append("")

            for ex_id in sorted(day_data.keys()):
                sets = day_data[ex_id]
                if not isinstance(sets, dict) or not sets:
                    continue

                # Skip exercises with no completed sets
                has_data = any(
                    isinstance(s, dict) and s.get("completed")
                    for s in sets.values()
                )
                if not has_data:
                    continue

                ex_name = find_exercise_name(program, ex_id)
                lines.append(f"  {ex_name}")

                for set_idx in sorted(sets.keys(), key=lambda x: int(x)):
                    set_data = sets[set_idx]
                    if not isinstance(set_data, dict):
                        continue
                    set_num = int(set_idx) + 1
                    lines.append(f"    Подход {set_num}: {format_set(set_data)}")

                lines.append("")

            lines.append("")

    return "\n".join(lines)


def main():
    print("Загрузка данных из Supabase...")

    # Fetch profiles
    profiles = supabase_get("profiles", "user_id,username,display_name")
    profile_map = {p["user_id"]: p for p in profiles}
    print(f"  Профилей: {len(profiles)}")

    # Fetch user data
    user_data_list = supabase_get("user_data", "user_id,data,updated_at")
    print(f"  Записей user_data: {len(user_data_list)}")

    # Create logs directory
    os.makedirs(LOGS_DIR, exist_ok=True)

    exported = 0
    for ud in user_data_list:
        uid = ud["user_id"]
        data = ud.get("data", {})
        log = data.get("log", {})

        # Skip users with no workout data
        has_sets = False
        for w in log.values():
            if not isinstance(w, dict):
                continue
            for d in w.values():
                if not isinstance(d, dict):
                    continue
                for ex in d.values():
                    if not isinstance(ex, dict):
                        continue
                    for s in ex.values():
                        if isinstance(s, dict) and s.get("completed"):
                            has_sets = True
                            break
                    if has_sets:
                        break
                if has_sets:
                    break
            if has_sets:
                break

        if not has_sets:
            continue

        profile = profile_map.get(uid, {"username": uid[:8], "display_name": uid[:8]})
        display = profile.get("display_name") or profile.get("username") or uid[:8]
        username = profile.get("username") or uid[:8]

        # Sanitize filename
        safe_name = "".join(c if c.isalnum() or c in "._- " else "_" for c in f"{display}_{username}")
        filename = os.path.join(LOGS_DIR, f"{safe_name}.txt")

        text = generate_log_text(profile, ud)
        with open(filename, "w", encoding="utf-8") as f:
            f.write(text)

        # Count completed sets
        total_sets = 0
        for w in log.values():
            if not isinstance(w, dict):
                continue
            for d in w.values():
                if not isinstance(d, dict):
                    continue
                for ex in d.values():
                    if not isinstance(ex, dict):
                        continue
                    for s in ex.values():
                        if isinstance(s, dict) and s.get("completed"):
                            total_sets += 1

        print(f"  -> {filename} ({total_sets} подходов)")
        exported += 1

    print(f"\nГотово! Экспортировано {exported} файлов в {LOGS_DIR}/")


if __name__ == "__main__":
    main()
