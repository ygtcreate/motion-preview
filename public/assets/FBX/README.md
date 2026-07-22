# FBX files

## Temporary local assets

The FBX files in this directory are temporary assets for local development.
They will be removed from the Git repository after Cloudflare R2 integration.
In production, FBX files must be stored in R2 and their searchable metadata in
Cloudflare D1.

Directory layout:

- `Preview/Character.fbx`: shared preview character (mesh, skeleton, and materials). This file is not offered for download.
- `Motions/*.fbx`: lightweight animation files applied to the shared character and offered for download.

Set each motion record's `url` to `/assets/FBX/Motions/<filename>.fbx`.
Only files registered as motion records are shown in the library and download
UI. The shared character path is configured by
`PREVIEW_CHARACTER_URL` in `app/components/MotionStudio.tsx`.

For production, configure `MOTION_API_URL`; `/api/motions` will proxy the database-backed motion API without changing the viewer UI.
