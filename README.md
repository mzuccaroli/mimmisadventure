# Mimmi's Adventure

Open source platform game project built with Kaplay/Vite.
This repository is used for personal and study purposes.

Public project URL:
https://github.com/mzuccaroli/mimmisadventure

## Tech stack

- JavaScript (ES modules)
- [Kaplay](https://kaplayjs.com/) for game logic/rendering
- Vite for development/build

## Project structure

- `src/` application source code
- `src/levels/` level modules and level dialogs
- `public/` static assets (sprites, tilesets, character sheets, licenses)
- `dist/` production build output

## Run locally

Install dependencies:

```sh
npm install
```

Start development server:

```sh
npm run dev
```

Build production bundle:

```sh
npm run build
```

Create zip package:

```sh
npm run zip
```

## License

This project is licensed under:

- **Creative Commons Attribution 4.0 International (CC BY 4.0)**
- Full text and notes: [license.txt](./license.txt)
- Official license URL: https://creativecommons.org/licenses/by/4.0/

## Third-party assets and credits

Some assets are distributed under their own licenses. Keep original notices when redistributing.

### Kenney Pixel Platformer assets

- Package: `public/sprites/kenney_pixel-platformer/`
- Author: Kenney (www.kenney.nl)
- License: **CC0 1.0 (Public Domain)**
- Source license file: `public/sprites/kenney_pixel-platformer/License.txt`
- License URL: http://creativecommons.org/publicdomain/zero/1.0/

### 24x32 character pack references (NPC sheets)

Based on “24x32 characters big pack” by **Svetlana Kushnariova**
(`lana-chan@yandex.ru`), licensed under:

- **Creative Commons Attribution 3.0**
- **OGA-BY 3.0**

Original links:

- http://opengameart.org/content/24x32-characters-with-faces-big-pack
- http://opengameart.org/content/24x32-bases

## Notes

- Game assets from different sources may have different attribution requirements.
- Before publishing builds, verify that all third-party license obligations are respected.
