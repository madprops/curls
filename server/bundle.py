# Standard
from pathlib import Path


def get_js_files() -> list[str]:
    js_files = Path("static/dashboard/js").glob("*.js")
    return [str(f) for f in js_files]


def bundle_js() -> None:
    js_files = get_js_files()
    order = ["vars.js", "main.js"]
    ignore = ["bundle.js"]

    with Path("static/dashboard/js/bundle.js").open("w") as f:
        for o in order:
            with Path(f"static/dashboard/js/{o}").open("r") as js:
                f.write(js.read())
                f.write("\n\n")

        for js_file in js_files:
            file = Path(js_file)

            if file.name in ignore:
                continue

            if file.name not in order:
                with file.open("r") as js:
                    f.write(js.read())
                    f.write("\n\n")


if __name__ == "__main__":
    bundle_js()