# Versioned releases

Release source from the default branch with an unused `vX.Y.Z` tag. The `Publish versioned containers` workflow builds the existing Docker recipes for Linux amd64 and arm64 and publishes version, commit, and latest tags to GHCR, with provenance and SBOM metadata. Repository maintainers make new packages public in GitHub package settings before announcing them.

For this release:

```sh
docker pull ghcr.io/piyush-gambhir/typesense-dashboard:1.0.0
```

Use a version tag or the published image digest to choose when to upgrade. Configure service credentials, API origins, and persistent storage according to the repository README and compose examples. Browser public environment values are compiled into Next.js assets; installations needing different browser origins must rebuild with the Dockerfile build arguments. Development containers and legacy deployment scripts are separate from these production image artifacts.
