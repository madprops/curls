from __future__ import annotations

# Standard
import fcntl
import tempfile
from pathlib import Path


base_dir = Path(__file__).resolve().parent
js_root = base_dir / "static" / "dashboard" / "js"


def get_files(path: Path, ext: str) -> list[Path]:
    # Sort explicitly so bundle concatenation order is deterministic across filesystems.
    return sorted(path.glob(f"*.{ext}"))


def needs_rebuild(target: Path, sources: list[Path]) -> bool:
    if not target.is_file():
        return True

    target_mtime = target.stat().st_mtime
    return any(src.stat().st_mtime > target_mtime for src in sources)


def write_bundle_atomic(what: str, target: Path, ordered: list[Path]) -> None:
    chunks: list[str] = []

    for src in ordered:
        with src.open("r", encoding="utf-8") as js:
            chunks.append(js.read())
            chunks.append("\n\n")

    tmp_path: Path | None = None

    try:
        # Write into the target directory and swap atomically via Path.replace() so concurrent
        # readers never observe a truncated or partially written JS bundle.
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=js_root,
            prefix=f".bundle.{what}.",
            suffix=".tmp",
            delete=False,
        ) as tmp:
            tmp.write("".join(chunks))
            tmp_path = Path(tmp.name)

        tmp_path.replace(target)
    except Exception:
        if tmp_path is not None:
            tmp_path.unlink(missing_ok=True)
        raise


def bundle_dashboard_js(
    what: str,
    first: list[str],
    last: list[str],
    *,
    force: bool = True,
) -> None:
    source_dir = js_root / what
    files = get_files(source_dir, "js")
    target = js_root / f"bundle.{what}.js"

    def get_path(name: str) -> Path:
        return source_dir / f"{name}.js"

    ordered: list[Path] = [get_path(name) for name in first]

    ordered.extend(
        file for file in files if (file.stem not in first) and (file.stem not in last)
    )

    ordered.extend(get_path(name) for name in last)

    # Fast path: skip locking and disk writes on read-only or already-built startups.
    if (not force) and (not needs_rebuild(target, ordered)):
        return

    # Keep lockfiles in the system temp dir so they do not pollute static/dashboard/js/.
    lock_path = Path(tempfile.gettempdir()) / f"curls-bundle-{what}.lock"

    with lock_path.open("w", encoding="utf-8") as lock_file:
        # Serialize rebuilds across Gunicorn workers starting simultaneously.
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)

        try:
            # Re-check after acquiring the lock in case another worker just finished rebuilding.
            if force or needs_rebuild(target, ordered):
                write_bundle_atomic(what, target, ordered)
        finally:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)


def bundle_dashboard(*, force: bool = True) -> None:
    bundle_dashboard_js("libs", [], ["colorlib"], force=force)
    bundle_dashboard_js("main", ["app", "utils"], ["load"], force=force)


def ensure_bundles() -> None:
    bundle_dashboard(force=False)


if __name__ == "__main__":
    bundle_dashboard(force=True)
