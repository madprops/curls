from __future__ import annotations

# Standard
from pathlib import Path


def get_files(path: str, ext: str) -> list[str]:
    files = Path(path).glob(f"*.{ext}")
    return [str(f) for f in files]


def bundle_dashboard_js(what: str, first: list[str], last: list[str]) -> None:
    files = get_files(f"static/dashboard/js/{what}", "js")

    def get_path(f: str) -> Path:
        return Path(f"static/dashboard/js/{what}/{f}.js")

    with Path(f"static/dashboard/js/bundle.{what}.js").open("w") as f:
        for file_ in first:
            with get_path(file_).open("r") as js:
                f.write(js.read())
                f.write("\n\n")

        for file_ in files:
            file = Path(file_)

            if (file.stem not in first) and (file.stem not in last):
                with file.open("r") as js:
                    f.write(js.read())
                    f.write("\n\n")

        for file_ in last:
            with get_path(file_).open("r") as js:
                f.write(js.read())
                f.write("\n\n")


def bundle_dashboard() -> None:
    bundle_dashboard_js("libs", [], [])

    bundle_dashboard_js(
        "main",
        [
            "vars",
            "combo",
            "block",
            "curlist",
            "more",
            "curls",
            "items",
            "container",
            "update",
            "change",
            "picker",
            "filter",
            "sort",
            "colors",
            "font",
            "border",
            "status",
            "controls",
            "main",
        ],
        ["load"],
    )


if __name__ == "__main__":
    bundle_dashboard()
