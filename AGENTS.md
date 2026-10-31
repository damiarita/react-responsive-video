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

| Task                        | Command                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Install                     | `npm ci`                                                                                                    |
| Build (also the type check) | `npm run build` (`tsc` → `dist/`, CJS + `.d.ts` + maps)                                                     |
| Full test (what CI runs)    | `npm test` = `eslint .` → `prettier --check .` → `jest` (coverage)                                          |
| Run one test file           | `npx jest __tests__/client_tests.tsx --coverage=false`                                                      |
| Update snapshots            | `npx jest -u` (review the diff in `__tests__/__snapshots__/`)                                               |
| Format                      | `npm run format`                                                                                            |
| Preview API docs (TypeDoc)  | `npm run docs` → `docs/` (local preview only, then `git checkout -- docs`)                                  |
| Check with React 18         | `npm i --no-save react@18 react-dom@18 @types/react@18 && npx tsc --noEmit -p . && npx jest`, then `npm ci` |

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
    responsiveVideo.tsx        'use client'. Orchestrates Poster ↔ Video swap. forwardRef (ref → the <video>).
                               Public props type + big JSDoc.
    poster.tsx                 <picture> with all poster <source>s (SSR-safe, no hooks). Attaches the `imgRef` it
                               receives to its <img>. Exports PictureProps, ImageProps, ImgRef.
    video.tsx                  Client-only <video> for the `size` it receives; reloads when it changes. Merges
                               its own ref with the user's. Exports VideoProps (video attrs minus
                               poster/height/width/ref).
  hooks/
    useIsClient.ts             false on server and first client render, true after mount (hydration-safe).
    useLoadedUrl.ts            Poster URL for the selected size + whether it settled. decode() on Poster's real
                               <img> while it exists, a detached <picture> after the swap. Cancels stale results.
    useSelectedSize.ts         The first Size whose mediaQuery matches (undefined until mounted). Re-evaluates on
                               `sizes` change and on `change` of each query's MediaQueryList.
    useStableSizes.ts          Returns the previous `sizes` reference while its JSON content is unchanged
                               (so inline array literals don't re-trigger effects).
  utils/
    createPosterImage.ts       Detached <picture> with one size's posterSources; returns its <img> (the browser
                               picks the format and starts loading).
  types/
    env.d.ts                   Ambient type for `process.env.NODE_ENV` only (dev-only checks). Not emitted.
    size.ts                    Size = { height?, width?, mediaQuery?, videoSources: Source[], posterSources: Source[] }
    source.ts                  Source = { url, format? (MIME type) }
__tests__/
  client_tests.tsx             jsdom tests (mocks matchMedia, HTMLVideoElement.load/play, HTMLImageElement.decode).
  ssr_tests.tsx                `@jest-environment node` + renderToStaticMarkup snapshot tests.
  data/{fullProps,minProps,invalidProps}.ts   Shared fixtures.
  __snapshots__/               Jest snapshots (committed).
docs/                          Generated by TypeDoc in CI. Never edit, regenerate or commit it (see Gotchas).
dist/                          Build output (git-ignored, the only thing published to npm).
```

## Runtime behaviour in detail

`ReactResponsiveVideo` ([src/components/responsiveVideo.tsx](src/components/responsiveVideo.tsx)):

- It is a `forwardRef` component (needed for React < 19). The user's `ref`
  is passed to `<Video>` as `forwardedRef` and points to the `<video>`
  element: `null` on the server and until mount, then set even while the
  video is still hidden behind the poster. Because the default export is a
  variable now, TypeDoc puts it in `docs/variables/default.md`. Link to
  `docs/globals.md` (stable) from the README, not to that page.

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
  Re-evaluated on `sizes` change and on the `change` event of a
  `matchMedia(query)` list per distinct `mediaQuery` (not `resize`): it fires
  only when a query flips, and also covers zoom, rotation and non-width
  queries. Listeners are removed on unmount and when `sizes` changes. If
  **no size matches**, the video has no sources and stays empty. In
  development it then logs a `console.warn` (once per `sizes` value, listing
  the media queries).
- `poster = useLoadedUrl(posterImgRef, selectedSize)` → `{ isSettled, url? }`,
  re-run whenever `selectedSize` changes. While `<Poster>` is mounted it
  awaits `img.decode()` on the **real** poster `<img>` (ref passed to
  `<Poster>`). Unlike `load`/`error` events, `decode()` also settles for an
  image that loaded or failed **before hydration**, so an already-painted
  SSR poster is detected right away. Resolve → `{ isSettled: true, url:
currentSrc }`; reject → `{ isSettled: true }` (no poster), **unless
  `currentSrc` changed** during the wait: `decode()` also rejects when the
  browser switches to another source mid-load (a poster breakpoint crossed,
  zoom...), so it then waits for the new source with another `decode()`. After the swap
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
- `poster`, `height` and `width` are computed, which is why `VideoProps` omits
  them. `ref` is omitted too: the ref goes on `<ReactResponsiveVideo>`.
- Its `ref` is a callback (`setVideoRef`) that sets both the internal
  `videoRef` (used to reload on size changes) and the user's
  `forwardedRef` (object or callback).

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
- Development-only code (warnings) is gated by
  `process.env.NODE_ENV !== 'production'`, like React itself, so consumer
  bundlers strip it. Its type comes from
  [src/types/env.d.ts](src/types/env.d.ts): TypeScript 6 no longer loads
  `@types/*` automatically, and Node types are kept out of `src/` on
  purpose. Don't add `"types": ["node"]` (it would also clash with that
  declaration).
- New public types must be re-exported from [src/index.ts](src/index.ts).
- `package.json` declares `"sideEffects": false`, a promise to bundlers that
  importing any file of the package does nothing by itself. Modules in `src/`
  must not run code on import: no top-level DOM or global changes, polyfills
  or CSS imports. If one ever has to, list it in a `"sideEffects": [...]`
  array instead of breaking the promise.
- `peerDependencies.react` is `>=16.14.0` because `"jsx": "react-jsx"` makes
  every compiled component `require("react/jsx-runtime")`, which first shipped
  in React 16.14. Don't switch to the classic runtime (`"jsx": "react"`) to
  widen it: React 19 logs an "outdated JSX transform" warning for such code.
  Raise the range if you use a newer React API.
- Tests: behaviour on the client goes in `client_tests.tsx` (drive the
  poster via the `decode()` mock's `mockOnLoad`/`mockOnError`, the video
  via `fireEvent(video, new Event('loadeddata'))`, breakpoints via `setWindowWidth(n)` inside `act`, which fires `change`
  only on the media query lists that flip, like a browser; set
  `mockWindowWidth` directly only before `render`); server output
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
  support them. Keep coupled packages in the same group. Every group must set
  `update-types`: a wildcard group without it loses its packages to the
  pattern-less `minor-and-patch` group, and each major then gets its own PR.

## Gotchas

- `useSelectedSize` depends on `[sizes]`; `useLoadedUrl` and `Video` depend on
  the identity of the selected `Size` object. They are only safe because
  `ReactResponsiveVideo` passes them the output of `useStableSizes`. Never pass the raw `sizes` prop
  to new hooks/children. In tests, a "changed sizes" scenario needs
  **different content**, not just a new array (equal content is covered by
  the `does not reload when re-rendered with an equal but new sizes array`
  test).
- Ref types differ between React 18 and 19 typings. With React 19 types (the
  devDeps), `useRef<T>(null)` returns `RefObject<T | null>`, which React
  18's DOM `ref` rejects; React 18's `RefObject<T>` fails with React 19. For a
  ref prop that ends up on a DOM element, use a structural type like
  `ImgRef = { current: HTMLImageElement | null }` (see `poster.tsx`), and
  for ones you get from users, `ForwardedRef<T>`. Check both typings with the
  "Check with React 18" command: Jest won't catch type errors (Babel strips
  types), only `tsc` does.
- After Dependabot merges, local `node_modules` can be stale (e.g. still
  React 18 while the lockfile has 19). Run `npm ci` before trusting local
  build/test results.
- **Never change `docs/`**, not even by running `npm run docs` and committing
  the result. CI's [build-docs.yml](.github/workflows/build-docs.yml) builds it
  from the JSDoc and `readme.md` after each push to `master` and opens the
  `docs/update-typedocs` PR. To fix something in `docs/`, fix the JSDoc or
  `readme.md`. `docs/README.md` lags behind `readme.md` until that PR is
  merged, which is expected.
- `MediaQueryList.addEventListener` needs Safari/iOS 14+ (older Safari only
  has the deprecated `addListener`). There is no fallback on purpose: those
  versions are long unsupported. Add one if a user reports it.
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
  sync `act` is not enough). `mockOnSourceSwitch(url)` simulates the browser
  switching source mid-load (sets `currentSrc`, then rejects). They settle the
  **latest** `decode()` call;
  `mockDecodeFn.mock.contexts.at(-1)` is the `<img>` it was called on (the
  page one or a detached one).
- `console.warn` is mocked in every client test (`warnSpy`) to keep the
  "no matching size" warning out of the output. Assert on `warnSpy` to test
  warnings. Warnings you don't expect are silenced too.

## Possible improvements & known issues

Ordered roughly by user impact. When you fix one, remove it (or update it) in
the same commit. The user-facing **Roadmap** section of
[readme.md](readme.md) summarises the items users would notice. Keep it in
sync when items are fixed or added. The README also documents current
behaviour (what triggers the swap, inline `sizes` being safe, the React
version requirement), so update it whenever that behaviour changes.

### Bugs / behavioural issues

1. **Unhandled promise from `video.play()`** in `video.tsx` (autoplay
   policies reject it). Add `.catch(() => {})` or surface it.
2. **`video.load()` is called on mount** even though the browser already
   loads the initial sources, which may cause a duplicate request. Skip the
   first run of that effect.
3. **Real `sizes` changes reload even when the chosen sources don't.**
   `useStableSizes` compares the whole array, so e.g. adding a size for
   another breakpoint still reloads the playing video. Keying the reload
   effect on the selected size's `videoSources` would avoid that.

### API / DX improvements

4. Use `export type { … }` in [src/index.ts](src/index.ts) so the package
   works with `isolatedModules`/`verbatimModuleSyntax` toolchains.
5. Give hooks named functions (`useIsClient`, `useLoadedUrl`,
   `useSelectedSize`, `useStableSizes`) for nicer stack traces and DevTools names.
6. Accessibility: the `<img alt>` disappears when the video replaces it.
   The README tells users to pass `aria-label` via `videoProps`; the
   component could derive one from `imgProps.alt` instead.
7. Optional `fallbackSrc` / auto `src` on the SSR `<img>` (e.g. the last
   poster) for robustness when no `<source>` matches.

### Packaging / tooling

8. Ship an ESM build next to CJS (`"sideEffects": false` is already set).
   **Low priority**: the package is one component that uses every internal
   file (~16 KB unminified), so tree shaking gains little. If done, note
   that `tsc` emits extensionless imports, which plain Node ESM can't
   resolve. Expose the ESM build to bundlers only, through the `"module"`
   export condition (not `"import"`), and keep Node on CJS. `target: es2016`
   could be raised too.
9. Lint and type-check `__tests__/` (currently ignored by ESLint and outside
   `tsconfig` `include`; e.g. the `decode()` mock's `mockOnLoad`/`mockOnError` are implicit `any`).
10. Add tests for the issues above (e.g. `play()` rejection). Real browser
    behaviour (`decode()` before/after hydration, `loadeddata` vs poster
    race) is not covered by jsdom. A small Playwright suite would catch it.
11. CI: test against a React version matrix (16.14, 17, 18, 19; devDeps
    pin React 19, so older versions are untested); `publish.yml` should
    run `npm test` before publishing; `test.yml` runs twice for PR branches
    (`push` + `pull_request`); Node versions differ (22 vs 24).
12. `.npmignore` is redundant with `"files": ["dist"]` and lists
    non-existent files (`.eslintrc.json`, `.eslintignore`). Remove it.
13. Narrow `modulePathIgnorePatterns` to `<rootDir>/__tests__/data/` and
    consider disabling `collectCoverage` by default (opt-in via a
    `test:coverage` script) to speed up local runs.

### Documentation

14. Typos in JSDoc (responsiveVideo.tsx: "pucture", "devide", "sice",
    "give", "the the"); `VideoProps` doc sentence is truncated ("…are
    examples of valid").
