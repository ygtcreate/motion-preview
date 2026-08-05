# FBX storage

FBX binaries are stored in the private Cloudflare R2 bucket
`motion-preview-fbx`; they are intentionally not committed to Git.

R2 object layout:

- `Preview/Character.fbx`: shared preview character.
- `Motions/Idle.fbx`: idle animation.
- `Motions/Walking.fbx`: walking animation.
- `Motions/Jump.fbx`: jump animation.

The Worker exposes these private objects through `/api/files/<R2 key>`.
Motion metadata is currently returned by `/api/motions` and will be moved to
Cloudflare D1. Keep backup copies outside this repository before replacing or
deleting R2 objects.
