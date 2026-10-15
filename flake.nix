{
  description = "sirati's fork of the CLIProxyAPI management panel: single-file management.html";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs, ... }:
    let
      systems = [ "x86_64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
      mkPackage =
        pkgs:
        pkgs.callPackage ./package.nix {
          src = self;
          rev = self.shortRev or self.dirtyShortRev or "dirty";
        };
    in
    {
      packages = forAllSystems (
        system:
        let
          management-panel = mkPackage nixpkgs.legacyPackages.${system};
        in
        {
          inherit management-panel;
          default = management-panel;
        }
      );

      overlays.default = final: _prev: {
        cliproxyapi-management-panel = mkPackage final;
      };
    };
}
