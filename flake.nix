{
  description = "Curls - minimalist text status host";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems =
        f:
        nixpkgs.lib.genAttrs systems (
          system:
          let
            pkgs = nixpkgs.legacyPackages.${system};
          in
          f pkgs
        );
    in
    {
      packages = forAllSystems (
        pkgs:
        let
          python3Packages = pkgs.python3Packages;

          flask-simple-captcha = python3Packages.buildPythonPackage rec {
            pname = "flask-simple-captcha";
            version = "5.5.5";
            pyproject = true;

            src = pkgs.fetchPypi {
              inherit pname version;
              hash = "sha256-a4K2iQRx0ZPtzzJPcWrWVK2ngllopQrwnQ8k91SBzAg=";
            };

            build-system = [ python3Packages.setuptools ];

            dependencies = with python3Packages; [
              pillow
              pyjwt
              werkzeug
            ];

            doCheck = false;
            pythonImportsCheck = [ "flask_simple_captcha" ];
          };

          pythonEnv = pkgs.python3.withPackages (
            ps: with ps; [
              flask
              flask-cors
              flask-limiter
              flask-simple-captcha
              gunicorn
              redis
            ]
          );

          resolveServerDir = ''
            SERVER_DIR="''${CURLS_SERVER_DIR:-}"
            if [ -z "$SERVER_DIR" ]; then
              if [ -f "$PWD/server/app.py" ]; then
                SERVER_DIR="$PWD/server"
              elif [ -f "$PWD/app.py" ]; then
                SERVER_DIR="$PWD"
              else
                echo "Error: Run this command from the curls repo root or set CURLS_SERVER_DIR." >&2
                exit 1
              fi
            fi
            cd "$SERVER_DIR"
          '';

          curls-server = pkgs.writeShellApplication {
            name = "curls-server";
            runtimeInputs = [ pythonEnv ];
            text = ''
              ${resolveServerDir}

              if [ -z "''${CURLS_CAPTCHA_KEY:-}" ] && [ ! -f "captcha_key.txt" ]; then
                echo "Error: Set CURLS_CAPTCHA_KEY or create $SERVER_DIR/captcha_key.txt (min 16 chars)." >&2
                exit 1
              fi

              if [ ! -f "curls.db" ]; then
                python -m flask --app app init-db
              fi

              python bundle.py

              HOST="''${HOST:-127.0.0.1}"
              PORT="''${PORT:-5000}"
              WORKERS="''${WORKERS:-4}"

              exec gunicorn \
                --workers "$WORKERS" \
                --bind "$HOST:$PORT" \
                app:app "$@"
            '';
          };

          curls-dev = pkgs.writeShellApplication {
            name = "curls-dev";
            runtimeInputs = [ pythonEnv ];
            text = ''
              ${resolveServerDir}

              export CURLS_PROXY_COUNT="''${CURLS_PROXY_COUNT:-0}"

              if [ -z "''${CURLS_CAPTCHA_KEY:-}" ] && [ ! -f "captcha_key.txt" ]; then
                umask 077
                python -c "import secrets; print(secrets.token_hex(32))" > captcha_key.txt
                echo "Generated local dev secret in $SERVER_DIR/captcha_key.txt"
              fi

              if [ ! -f "curls.db" ]; then
                python -m flask --app app init-db
              fi

              HOST="''${HOST:-127.0.0.1}"
              PORT="''${PORT:-5000}"

              exec python -m flask --app app run --debug --host "$HOST" --port "$PORT" "$@"
            '';
          };

          curls-init-db = pkgs.writeShellApplication {
            name = "curls-init-db";
            runtimeInputs = [ pythonEnv ];
            text = ''
              ${resolveServerDir}
              exec python -m flask --app app init-db "$@"
            '';
          };
        in
        {
          default = curls-server;
          server = curls-server;
          dev = curls-dev;
          init-db = curls-init-db;
          inherit flask-simple-captcha pythonEnv;
        }
      );

      apps = forAllSystems (
        pkgs:
        let
          selfPkgs = self.packages.${pkgs.stdenv.hostPlatform.system};
        in
        {
          default = {
            type = "app";
            program = "${selfPkgs.server}/bin/curls-server";
          };
          dev = {
            type = "app";
            program = "${selfPkgs.dev}/bin/curls-dev";
          };
          init-db = {
            type = "app";
            program = "${selfPkgs.init-db}/bin/curls-init-db";
          };
        }
      );

      devShells = forAllSystems (
        pkgs:
        let
          selfPkgs = self.packages.${pkgs.stdenv.hostPlatform.system};
        in
        {
          default = pkgs.mkShell {
            packages = [
              selfPkgs.pythonEnv
              pkgs.redis
              pkgs.sqlite
              pkgs.ruff
              pkgs.mypy
              pkgs.pyright
              pkgs.nodejs
            ];

            shellHook = ''
              echo "Curls dev shell ready."
              echo "  Run dev server:  nix run .#dev"
              echo "  Run prod server: nix run ."
              echo "  Init database:   nix run .#init-db"
            '';
          };
        }
      );
    };
}

