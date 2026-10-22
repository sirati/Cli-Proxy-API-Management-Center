# Builds the single-file management panel as $out/management.html, the name
# CLIProxyAPI serves from MANAGEMENT_STATIC_PATH.
{
  lib,
  stdenvNoCC,
  bun,
  nodejs_24,
  src,
  rev ? "dirty",
}:

let
  pname = "cli-proxy-api-management-center";
  version = "0-sirati+${rev}";

  # bun.lock pins every package; the fixed-output hash covers the platform's
  # optional native binaries (esbuild, rollup), so it is per system.
  nodeModules = stdenvNoCC.mkDerivation {
    pname = "${pname}-node_modules";
    inherit version src;

    nativeBuildInputs = [ bun ];

    dontConfigure = true;
    dontFixup = true;

    buildPhase = ''
      runHook preBuild
      export HOME=$TMPDIR
      bun install --frozen-lockfile --no-progress --ignore-scripts
      runHook postBuild
    '';

    installPhase = ''
      runHook preInstall
      rm -rf node_modules/.cache
      cp -R node_modules $out
      runHook postInstall
    '';

    outputHash =
      {
        x86_64-linux = "sha256-8rStX4P5EfxfOYTRw0iic99Lool/s3WfP0avgPJtgnQ=";
      }
      .${stdenvNoCC.hostPlatform.system}
        or (throw "${pname}: no node_modules hash for ${stdenvNoCC.hostPlatform.system}");
    outputHashMode = "recursive";
  };
in
stdenvNoCC.mkDerivation {
  inherit pname version src;

  nativeBuildInputs = [ nodejs_24 ];

  # vite.config.ts reads VERSION before falling back to git tags.
  env.VERSION = version;

  configurePhase = ''
    runHook preConfigure
    cp -R ${nodeModules} node_modules
    chmod -R u+w node_modules
    patchShebangs node_modules
    runHook postConfigure
  '';

  buildPhase = ''
    runHook preBuild
    node node_modules/typescript/bin/tsc
    node node_modules/vite/bin/vite.js build
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    install -Dm444 dist/index.html $out/management.html
    runHook postInstall
  '';

  passthru = { inherit nodeModules; };

  meta = {
    description = "sirati's fork of the CLIProxyAPI management panel";
    homepage = "https://github.com/router-for-me/Cli-Proxy-API-Management-Center";
    license = lib.licenses.mit;
    platforms = [ "x86_64-linux" ];
  };
}
