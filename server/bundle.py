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
    order = ["needcontext.js", "dom.js", "jdenticon.js", "dateformat.js"]

    with Path("static/dashboard/js/bundle.libs.js").open("w") as f:
        for o in order:
            with Path(f"static/dashboard/js/libs/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")

        for lib_file in lib_files:
            file = Path(lib_file)

            if file.name not in order:
                with file.open("r") as js:
                    f.write(js.read())
                    f.write("\n\n")

    main_files = get_js_main()
    order = ["load.js", "vars.js", "main.js"]

    with Path("static/dashboard/js/bundle.main.js").open("w") as f:
        for o in order:
            with Path(f"static/dashboard/js/main/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")

        for main_file in main_files:
            file = Path(main_file)

            if file.name not in order:
                with file.open("r") as js:
                    f.write(js.read())
                    f.write("\n\n")


if __name__ == "__main__":
    bundle_js()
