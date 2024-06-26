from __future__ import annotations

# Standard
from pathlib import Path


def get_js_main() -> list[str]:
    js_files = Path("static/dashboard/js/main").glob("*.js")
    return [str(f) for f in js_files]


def get_js_libs() -> list[str]:
    js_files = Path("static/dashboard/js/libs").glob("*.js")
    return [str(f) for f in js_files]


def bundle_js() -> None:
    lib_files = get_js_libs()
    first = ["needcontext.js"]
    last = []

    with Path("static/dashboard/js/bundle.libs.js").open("w") as f:
        for o in first:
            with Path(f"static/dashboard/js/libs/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")

        for lib_file in lib_files:
            file = Path(lib_file)

            if (file.name not in first) and (file.name not in last):
                with file.open("r") as js:
                    f.write(js.read())
                    f.write("\n\n")

        for o in last:
            with Path(f"static/dashboard/js/libs/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")

    main_files = get_js_main()
    first = ["vars.js", "main.js"]
    last = ["load.js"]

    with Path("static/dashboard/js/bundle.main.js").open("w") as f:
        for o in first:
            with Path(f"static/dashboard/js/main/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")

        for main_file in main_files:
            file = Path(main_file)

            if (file.name not in first) and (file.name not in last):
                with file.open("r") as js:
                    f.write(js.read())
                    f.write("\n\n")

        for o in last:
            with Path(f"static/dashboard/js/main/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")


if __name__ == "__main__":
    bundle_js()
