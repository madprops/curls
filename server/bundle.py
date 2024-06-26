from __future__ import annotations

# Standard
from pathlib import Path


def get_files(path: str, ext: str) -> list[str]:
    files = Path(path).glob(f"*.{ext}")
    return [str(f) for f in files]


def bundle_dashboard_js(what: str, first: list[str], last: list[str]) -> None:
    files = get_files(f"static/dashboard/js/{what}", "js")

    with Path(f"static/dashboard/js/bundle.{what}.js").open("w") as f:
        for o in first:
            with Path(f"static/dashboard/js/{what}/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")

        for file_ in files:
            file = Path(file_)

            if (file.name not in first) and (file.name not in last):
                with file.open("r") as js:
                    f.write(js.read())
                    f.write("\n\n")

        for o in last:
            with Path(f"static/dashboard/js/{what}/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")



def bundle_dashboard() -> None:
    bundle_dashboard_js("libs", ["needcontext.js"], [])
    bundle_dashboard_js("main", ["vars.js", "main.js"], ["load.js"])


if __name__ == "__main__":
    bundle_dashboard()
