# svelte-check-rs bug: rootDirs causes SuperForm type identity split (TS2719)

## Bug

In a large SvelteKit project, `svelte-check-rs` produces TS2719 errors when generic Svelte components pass `SuperForm<T>` (from `sveltekit-superforms`) to child generic components. The error message shows two **identical** import paths declared "unrelated":

```
src/lib/components/Benefits/rules/MatchRuleForm.svelte:46:11
Error: Type 'import(".../sveltekit-superforms/dist/client/superForm").SuperForm<T>'
  is not assignable to type
  'import(".../sveltekit-superforms/dist/client/superForm").SuperForm<T>'.
  Two different types with this name exist, but they are unrelated. (ts(TS2719))
```

Native `svelte-check` produces no errors for the same code.

## Root cause

`svelte-check-rs` generates a `tsconfig.tsgo.json` with two `rootDirs`:

```json
{
  "rootDirs": [
    "/project/node_modules/.cache/svelte-check-rs/<hash>",
    "/project"
  ]
}
```

Generated `.svelte.ts` files live in the cache rootDir, while regular `.ts` files (barrel exports, utility modules) live in the project rootDir. Both import `SuperForm` from the same `sveltekit-superforms` package, resolving to the same physical `.d.ts` file.

However, `tsgo` creates **separate type identity symbols** for the `SuperForm` type depending on which rootDir the importing file belongs to. When a type flows across the rootDir boundary (e.g., a generated `.svelte.ts` in the cache imports a barrel `.ts` from the project, which re-exports a generated component), the two `SuperForm` symbols are treated as unrelated.

## Pattern that triggers it

This only manifests in **large projects** (~3000+ files). It cannot be reproduced in a minimal standalone project — the same generated code and rootDirs configuration produces no TS2719 when the project is small. The bug appears to be scale-dependent, likely triggered by how `tsgo` manages type caches at scale.

### Component structure

A generic wrapper component accepts `SuperForm<T>` and passes it to a generic child:

```svelte
<!-- FormWrapper.svelte -->
<script generics="T extends Record<string, unknown>" lang="ts">
  import type { SuperForm } from "sveltekit-superforms";
  import FormField from "$lib/form/FormField.svelte";
  let { form }: { form: SuperForm<T> } = $props();
</script>

<FormField {form} />  <!-- TS2719 here in large projects -->
```

```svelte
<!-- FormField.svelte -->
<script generics="T extends Record<string, unknown>" lang="ts">
  import type { SuperForm } from "sveltekit-superforms";
  let { form }: { form: SuperForm<T> } = $props();
</script>
```

A parent creates a form via a wrapper function (regular `.ts` file in project dir) and passes it:

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { createForm } from "$lib/form";
  import FormWrapper from "$lib/FormWrapper.svelte";
  const form = createForm(schema);
</script>

<FormWrapper {form} />  <!-- TS2322 here: FormExtended<...> not assignable to SuperForm<T> -->
```

### Why it crosses rootDirs

1. `FormWrapper.svelte.ts` (cache rootDir) imports `$lib/form` barrel
2. The barrel `index.ts` only exists in the project rootDir (not cached)
3. The barrel re-exports `FormField.svelte` which resolves to the cache rootDir via rootDirs
4. `SuperForm<T>` flowing through this chain acquires different type identities

## Confirmed behavior

Running `tsgo` directly against the generated `tsconfig.tsgo.json` from a large project reproduces the errors:

```bash
npx tsgo --project node_modules/.cache/svelte-check-rs/<hash>/tsconfig.tsgo.json --noEmit
# → 5 TS2719 errors on SuperForm<T> identity splits
```

Running the same tsconfig with a subset of files (e.g., 11 instead of 3359) produces 0 TS2719 errors.

## Reproduce

This repo demonstrates the **pattern** but does not trigger the TS2719 in isolation due to the scale dependency:

```bash
pnpm install
npx svelte-check-rs   # no TS2719 (project too small)
npx svelte-check      # no errors
```

To reproduce the actual bug, run `svelte-check-rs` on a large SvelteKit project that uses `sveltekit-superforms` with generic form components.

## Environment

- svelte-check-rs 0.9.16
- tsgo (`@typescript/native-preview`) 7.0.0-dev.20260505.1
- Svelte 5 / SvelteKit 2
- sveltekit-superforms 2.30.x
