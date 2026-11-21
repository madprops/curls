from __future__ import annotations

# Standard
import argparse
import sqlite3
from pathlib import Path

# Libraries
from werkzeug.security import generate_password_hash  # type: ignore


base_dir = Path(__file__).resolve().parent
default_db = base_dir / "curls.db"


def is_hashed_key(value: str) -> bool:
    return value.startswith(("scrypt:", "pbkdf2:")) and (value.count("$") >= 2)


def migrate_keys(db_path: Path, *, dry_run: bool = False) -> tuple[int, int]:
    conn = sqlite3.connect(db_path, timeout=30.0)
    conn.execute("PRAGMA busy_timeout=30000")

    try:
        rows = conn.execute("SELECT id, key FROM curls").fetchall()
        to_update: list[tuple[str, int]] = []
        skipped = 0

        for row_id, stored_key in rows:
            key_str = str(stored_key)

            if is_hashed_key(key_str):
                skipped += 1
                continue

            to_update.append((generate_password_hash(key_str), int(row_id)))

        if (not dry_run) and to_update:
            with conn:
                conn.executemany(
                    "UPDATE curls SET key = ? WHERE id = ?",
                    to_update,
                )

        return len(to_update), skipped
    finally:
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Hash legacy plaintext curl keys in curls.db in place."
    )
    parser.add_argument(
        "--db",
        type=Path,
        default=default_db,
        help="Path to SQLite database (default: server/curls.db).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Count plaintext keys without modifying the database.",
    )
    args = parser.parse_args()

    migrated, skipped = migrate_keys(args.db, dry_run=args.dry_run)
    action = "Would hash" if args.dry_run else "Hashed"
    print(f"{action} {migrated} plaintext key(s); skipped {skipped} already-hashed key(s).")  # noqa: T201


if __name__ == "__main__":
    main()
