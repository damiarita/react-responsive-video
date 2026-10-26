# AGENTS.md

Guide for AI agents and developers working on `@damiarita/react-responsive-video`.
Read this before changing code. It is meant to save you from re-deriving how the
library works.

## ⚠️ Maintenance rule (mandatory)

**Every commit that changes code (`src/`, `__tests__/`, build/test/lint config,
CI workflows, `package.json` scripts or dependencies policy) must, in the same
commit, update this file if anything described here is no longer accurate.**
That includes: architecture, file map, behaviour/lifecycle, commands,
conventions, gotchas, and the _Possible improvements & known issues_ list (tick
off or remove items that you fix, add new ones you discover). If nothing here
is affected, no update is needed. Commits that only bump dependencies
(Dependabot) or regenerate `docs/` are exempt.

## What the library does

A single React component, `ReactResponsiveVideo`, that lets a `<video>` have
different sources per media query (which HTML does not support natively) while
downloading **only one** poster image and **one** video.

1. **SSR / first render**: renders a `<picture>` with a `<source>` for every
   poster of every size, so the browser picks the right poster with no JS.
2. **After mount (client)**: also renders a hidden (`display:none`) `<video>`
   containing only the `<source>`s of the first `Size` whose `mediaQuery`
   matches (or has no `mediaQuery`). Being in the DOM makes the browser start
   fetching the video.
3. **Once the poster image is ready (or failed), or the video has its first
   frame (`loadeddata`)**: the `<picture>` is removed and the `<video>` is
   shown with `poster` set to the URL the browser actually picked (no
   `poster` if the image failed).

The user is expected to style `<picture>` and `<video>` similarly (e.g.
`width:100%;height:auto`) so the swap doesn't shift layout.

## Commands

| Task                          | Command                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| Install                       | `npm ci`                                                           |
| Build (also the type check)   | `npm run build` (`tsc` → `dist/`, CJS + `.d.ts` + maps)            |
| Full test (what CI runs)      | `npm test` = `eslint .` → `prettier --check .` → `jest` (coverage) |
| Run one test file             | `npx jest __tests__/client_tests.tsx --coverage=false`             |
| Update snapshots              | `npx jest -u` (review the diff in `__tests__/__snapshots__/`)      |
| Format                        | `npm run format`                                                   |
| Regenerate API docs (TypeDoc) | `npm run docs` → `docs/` (markdown)                                |

Notes:

- `prettier --check .` covers **all** files, Markdown included (`AGENTS.md`,
  `readme.md`). Run `npm run format` before committing or `npm test` fails.
- `npm test` takes ~30 s (jsdom + coverage on every run).
- `tsc` only includes `src/`; tests are type-checked by nobody (Babel strips
  types) and are excluded from ESLint.

## File map

```
src/
  index.ts                     Public entry. Default export = component; re-exports prop/data types.
  components/
    responsiveVideo.tsx        'use client'. Orchestrates Poster ↔ Video swap. Public props type + big JSDoc.
    poster.tsx                 <picture> with all poster <source>s (SSR-safe, no hooks). Attaches the `imgRef` it
                               receives to its <img>. Exports PictureProps, ImageProps.
    video.tsx                  Client-only <video> for the `size` it receives; reloads when it changes.
                               Exports VideoProps (video attrs minus poster/height/width).
  hooks/
    useIsClient.ts             false on server and first client render, true after mount (hydration-safe).
    useLoadedUrl.ts            Poster URL for the selected size + whether it settled. decode() on Poster's real
                               <img> while it exists, a detached <picture> after the swap. Cancels stale results.
    useSelectedSize.ts         The first Size whose mediaQuery matches (undefined until mounted). Re-evaluates on
                               `sizes` change and `window` resize.
    useStableSizes.ts          Returns the previous `sizes` reference while its JSON content is unchanged
                               (so inline array literals don't re-trigger effects).
  utils/
    createPosterImage.ts       Detached <picture> with one size's posterSources; returns its <img> (the browser
                               picks the format and starts loading).
  types/
    size.ts                    Size = { height?, width?, mediaQuery?, videoSources: Source[], posterSources: Source[] }
    source.ts                  Source = { url, format? (MIME type) }
__tests__/
  client_tests.tsx             jsdom tests (mocks matchMedia, HTMLVideoElement.load/play, HTMLImageElement.decode).
  ssr_tests.tsx                `@jest-environment node` + renderToStaticMarkup snapshot tests.
  data/{fullProps,minProps,invalidProps}.ts   Shared fixtures.
  __snapshots__/               Jest snapshots (committed).
docs/                          Generated by TypeDoc (do not hand-edit; CI opens a PR to update it).
dist/                          Build output (git-ignored, the only thing published to npm).
```

## Runtime behaviour in detail

`ReactResponsiveVideo` ([src/components/responsiveVideo.tsx](src/components/responsiveVideo.tsx)):

- `sizes = useStableSizes(sizesProp)` runs first, and **everything below
  (Poster, useSelectedSize) receives this stabilised array**. Its
  reference only changes when `JSON.stringify(sizes)` changes, so
  parents may pass `sizes` inline without reloading the video.
- `isClient = useIsClient()` → `<Video>` is rendered only after mount, so the
  server HTML and the first client render match (no hydration mismatch).
- `selectedSize = useSelectedSize(sizes)` is the **single source of truth**
  for the active breakpoint: `sizes.find(s => !s.mediaQuery ||
matchMedia(s.mediaQuery).matches)`. **Order matters**: first match wins, so
  put the most specific queries first and a query-less fallback last. It is
  `undefined` on the server and first client render (set in an effect,
  batched with `useIsClient`, so `<Video>` mounts with it already set).
  Re-evaluated on `sizes` change and `window` `resize`. React bails out when
  the same `Size` object is returned, so most resize ticks are no-ops.
- `poster = useLoadedUrl(posterImgRef, selectedSize)` → `{ isSettled, url? }`,
  re-run whenever `selectedSize` changes. While `<Poster>` is mounted it
  awaits `img.decode()` on the **real** poster `<img>` (ref passed to
  `<Poster>`). Unlike `load`/`error` events, `decode()` also settles for an
  image that loaded or failed **before hydration**, so an already-painted
  SSR poster is detected right away. Resolve → `{ isSettled: true, url:
currentSrc }`; reject → `{ isSettled: true }` (no poster). After the swap
  (`<Poster>` unmounted), a new `selectedSize` (breakpoint crossed or
  `sizes` changed) loads that size's posters in a detached `<picture>`
  (`createPosterImage`) so the browser still negotiates the format. The old
  poster is **kept until the new one decodes**, then replaced; on failure, or
  if no size matches, `url` is cleared.
- `videoIsLoaded` becomes `true` on the video's `loadeddata` event (first
  frame available), **not** `loadstart`, so the swap never replaces a
  painted poster with an empty video. The user's own
  `videoProps.onLoadedData` is wrapped and still called.
- `somethingIsLoaded = poster.isSettled || videoIsLoaded` → hides `<Poster>`
  and passes `show` to `<Video>`. If the browser never preloads the video
  (iOS, `preload="none"`) the poster path alone triggers the swap.

`Video` ([src/components/video.tsx](src/components/video.tsx)):

- Receives `size` (the `selectedSize`); it does no media query work itself.
- Whenever `size` changes (including on mount) it calls
  `video.load()`, restores `currentTime` and resumes playback if it was playing.
- `videoProps.children` (e.g. `<track>`) are rendered after the generated
  `<source>`s. When hidden, `style` is **replaced** by `{display:'none'}`.
- `poster`, `height` and `width` are computed, which is why `VideoProps` omits them.

`Poster` ([src/components/poster.tsx](src/components/poster.tsx)): pure render;
`<source>`s get `media`, `srcSet`, `type`, `width`, `height`. The `<img>` only
gets `imgProps` (no `src` is generated, so there is no fallback for browsers
that match no `<source>`).

## Conventions

- TypeScript `strict` plus `noUncheckedIndexedAccess`,
  `noPropertyAccessFromIndexSignature`, `noUnusedLocals/Parameters`.
- Prettier: single quotes, semicolons, trailing commas, width 80. Husky
  `pre-commit` runs `lint-staged` (prettier on staged files); `pre-push` refuses
  to push if the branch is behind `origin`.
- Public types use `type` aliases (not `interface`) with JSDoc `@typedef`/`@property`
  comments; TypeDoc builds `docs/` from them, so **document every public
  prop/type in JSDoc** when you add or change it.
- Components are default-exported function components; hooks are anonymous
  default exports. Files are camelCase.
- `'use client'` sits at the top of any module using hooks (for Next.js App Router).
- New public types must be re-exported from [src/index.ts](src/index.ts).
- Tests: behaviour on the client goes in `client_tests.tsx` (drive the
  poster via the `decode()` mock's `mockOnLoad`/`mockOnError`, the video
  via `fireEvent(video, new Event('loadeddata'))`, breakpoints via `mockWindowWidth` + a `resize` event); server output
  goes in `ssr_tests.tsx`. The `matchMedia` mock only understands
  `(min-width: Npx)`.

## Release & CI

- `package.json` has **no `version` field**. Publishing happens when a GitHub
  Release is published: [publish.yml](.github/workflows/publish.yml) runs
  `npm version <release tag>` (not committed back), `npm run build`,
  `npm publish` via npm Trusted Publishing (OIDC). It does not run tests.
- [test.yml](.github/workflows/test.yml): on every push and PR, `npm ci`,
  `npm run build`, `npm test` (Node 22).
- [build-docs.yml](.github/workflows/build-docs.yml): on push to `master`,
  regenerates TypeDoc and opens/updates the `docs/update-typedocs` PR.
- Dependabot ([dependabot.yml](.github/dependabot.yml)) groups minor/patch
  updates together and majors by ecosystem (babel, eslint, jest, react,
  typescript). ESLint 10 and TypeScript ≥7 majors are ignored until plugins
  support them. Keep coupled packages in the same group.

## Gotchas

- `useSelectedSize` depends on `[sizes]`; `useLoadedUrl` and `Video` depend on
  the identity of the selected `Size` object. They are only safe because
  `ReactResponsiveVideo` passes them the output of `useStableSizes`. Never pass the raw `sizes` prop
  to new hooks/children. In tests, a "changed sizes" scenario needs
  **different content**, not just a new array (equal content is covered by
  the `does not reload when re-rendered with an equal but new sizes array`
  test).
- `imgProps.ref` is ignored: `<Poster>` sets its own `ref` on the `<img>`.
- `npm run build` (`tsc`) does not clean `dist/`, so files deleted from `src/`
  stay in a local `dist/` until you remove them (CI builds from scratch).
- The client test mocks `document.createElement` globally for `video`; if you
  create videos elsewhere in tests they'll get the mocked `load/play/pause`.
- `jest.config.js` has `modulePathIgnorePatterns: ['data']`, a regex that
  ignores **any** path containing `data` (not only `__tests__/data`). Avoid that
  substring in new file/dir names or narrow the pattern.
- jsdom has no `img.decode()`; `client_tests.tsx` defines it on
  `HTMLImageElement.prototype`. Settle it with `mockOnLoad(url)` /
  `mockOnError()` inside `await act(async () => …)` (it is a promise, so a
  sync `act` is not enough). They settle the **latest** `decode()` call;
  `mockDecodeFn.mock.contexts.at(-1)` is the `<img>` it was called on (the
  page one or a detached one).

## Possible improvements & known issues

Ordered roughly by user impact. When you fix one, remove it (or update it) in
the same commit. The user-facing **Roadmap** section of
[readme.md](readme.md) summarises the items users would notice. Keep it in
sync when items are fixed or added. The README also documents current
behaviour (what triggers the swap, inline `sizes` being safe, the React
version requirement), so update it whenever that behaviour changes.

### Bugs / behavioural issues

1. **`decode()` can reject if the browser switches source mid-load** (the
   viewport crosses a poster breakpoint before the on-page image is ready).
   Partly mitigated: the new `selectedSize` re-runs `decode()` on the
   on-page `<img>`. But if the browser swaps the `<img>` request _after_ that
   call, it still rejects, which is treated as a failure, so the video is
   shown without a poster. Could retry `decode()` when `img.currentSrc`
   changed.
2. **No matching `Size`** (no fallback without `mediaQuery`): the video
   renders with no sources and no dimensions; nothing warns the user. Add
   a dev-mode `console.warn`, or document the requirement more prominently.
3. **Unhandled promise from `video.play()`** in `video.tsx` (autoplay
   policies reject it). Add `.catch(() => {})` or surface it.
4. **`video.load()` is called on mount** even though the browser already
   loads the initial sources, which may cause a duplicate request. Skip the
   first run of that effect.
5. **Real `sizes` changes reload even when the chosen sources don't.**
   `useStableSizes` compares the whole array, so e.g. adding a size for
   another breakpoint still reloads the playing video. Keying the reload
   effect on the selected size's `videoSources` would avoid that.
6. **`peerDependencies.react: ">=16.8"` is inaccurate.** The build uses
   `"jsx": "react-jsx"`, which requires `react/jsx-runtime` (React ≥16.14 /
   17). Either narrow the range or switch to the classic runtime. React 19 is
   not tested (devDeps pin React 18).

### API / DX improvements

7. Forward a `ref` to the `<video>` (`forwardRef`, or a `ref` prop for React 19) so consumers can call `play()`/`pause()` imperatively.
8. Use `matchMedia(q).addEventListener('change', …)` per query instead of the
   global `resize` listener in `useSelectedSize`: it fires only when a breakpoint is crossed,
   and it also covers zoom and orientation changes without polling.
9. Use `export type { … }` in [src/index.ts](src/index.ts) so the package
   works with `isolatedModules`/`verbatimModuleSyntax` toolchains.
10. Give hooks named functions (`useIsClient`, `useLoadedUrl`,
    `useSelectedSize`, `useStableSizes`) for nicer stack traces and DevTools names.
11. Accessibility: the `<img alt>` disappears when the video replaces it.
    The README tells users to pass `aria-label` via `videoProps`; the
    component could derive one from `imgProps.alt` instead.
12. Optional `fallbackSrc` / auto `src` on the SSR `<img>` (e.g. the last
    poster) for robustness when no `<source>` matches.

### Packaging / tooling

13. Ship an ESM build (plus `"sideEffects": false`) next to CJS for tree
    shaking; `target: es2016` could be raised.
14. Lint and type-check `__tests__/` (currently ignored by ESLint and outside
    `tsconfig` `include`; e.g. the `decode()` mock's `mockOnLoad`/`mockOnError` are implicit `any`).
15. Add tests for the issues above (e.g. `play()` rejection). Real browser
    behaviour (`decode()` before/after hydration, `loadeddata` vs poster
    race) is not covered by jsdom. A small Playwright suite would catch it.
16. CI: test against a React version matrix (18, 19); `publish.yml` should
    run `npm test` before publishing; `test.yml` runs twice for PR branches
    (`push` + `pull_request`); Node versions differ (22 vs 24).
17. `.npmignore` is redundant with `"files": ["dist"]` and lists
    non-existent files (`.eslintrc.json`, `.eslintignore`). Remove it.
18. Narrow `modulePathIgnorePatterns` to `<rootDir>/__tests__/data/` and
    consider disabling `collectCoverage` by default (opt-in via a
    `test:coverage` script) to speed up local runs.

### Documentation

19. Typos in JSDoc (responsiveVideo.tsx: "pucture", "devide", "sice",
    "give", "the the"); `VideoProps` doc sentence is truncated ("…are
    examples of valid").
