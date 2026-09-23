# Mike's Sunday Spin Show

Playable 3D drift / spin homage to Mike's Car Wash on **Plot 10770, Kafue Road, Lusaka**.

King Katra · Sam Sam · Wababa. **Spin · Flex · Repeat.**

Car mesh after [Mike Pan's BMW 335i](https://blendswap.com) (CC-BY) at `public/models/bmw.glb`.

## Controls

- **W / ↑** gas · **S / ↓** brake · **A / D** steer · **Space** handbrake
- Phone: left stick + **Spin**

## Run

This source is the game layer (`src/game/*`). Drop it into a React + Three.js app (`@react-three/fiber`, `@react-three/drei`, `three`, `zustand`, Tailwind v4).

All text source is also concatenated in `SOURCE.txt` for copy-paste.

## Layout

```
src/game/          physics, cars, world, HUD, audio
src/routes/        home route
public/models/     bmw.glb (CC-BY Mike Pan)
SOURCE.txt         every text file in one dump
```
