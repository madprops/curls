from __future__ import annotations

# Standard
from pathlib import Path


def get_main() -> list[str]:
    js_files = Path("static/dashboard/js/main").glob("*.js")
    return [str(f) for f in js_files]


def get_libs() -> list[str]:
    js_files = Path("static/dashboard/js/libs").glob("*.js")
    return [str(f) for f in js_files]


def bundle_dashboard_libs() -> None:
    files = get_libs()
    first: list[str] = ["needcontext.js"]
    last: list[str] = []

    with Path("static/dashboard/js/bundle.libs.js").open("w") as f:
        for o in first:
            with Path(f"static/dashboard/js/libs/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")

        for file_ in files:
            file = Path(file_)

            if (file.name not in first) and (file.name not in last):
                with file.open("r") as js:
                    f.write(js.read())
                    f.write("\n\n")

        for o in last:
            with Path(f"static/dashboard/js/libs/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")


def bundle_dashboard_main() -> None:
    files = get_main()
    first: list[str] = ["vars.js", "main.js"]
    last: list[str] = ["load.js"]

    with Path("static/dashboard/js/bundle.main.js").open("w") as f:
        for o in first:
            with Path(f"static/dashboard/js/main/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")

        for file_ in files:
            file = Path(file_)

            if (file.name not in first) and (file.name not in last):
                with file.open("r") as js:
                    f.write(js.read())
                    f.write("\n\n")

        for o in last:
            with Path(f"static/dashboard/js/main/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")


def bundle_dashboard() -> None:
    bundle_dashboard_libs()
    bundle_dashboard_main()


if __name__ == "__main__":
    bundle_dashboard()
