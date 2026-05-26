# svelte-check-rs bug: generic component props type mismatch

## Bug

When a component accepts a generic prop typed with a base constraint (e.g. `FormStore<Record<string, unknown>>`) and a parent passes a concrete instantiation (e.g. `FormStore<{ name: string; email: string; age: number }>`), `svelte-check-rs` reports false type errors:

```
src/routes/+page.svelte:9:11
Error: Type 'FormStore<{ name: string; email: string; age: number; }>'
  is not assignable to type 'FormStore<Record<string, unknown>>'. (ts(TS2322))
```

This error appears 3 times (once per component receiving the `form` prop). Native `svelte-check` handles this correctly.

## What this abstracts

This reproduces a pattern from `sveltekit-superforms`. `superForm()` returns a deeply generic store typed with the specific form schema. Child components (`Form.Root`, `Form.Field`) accept the base constraint type. In our real codebase this causes ~32 false errors.

## How it works

- `createForm<T>()` in `src/lib/form.ts` returns `FormStore<{ name: string; email: string; age: number }>`.
- `FormRoot.svelte` and `FormField.svelte` accept `FormStore<Record<string, unknown>>`.
- `+page.svelte` creates the concrete form and passes it to both child components.

The concrete type satisfies `Record<string, unknown>`, so the assignment should be valid.

## Reproduce

```bash
pnpm install
npx svelte-check-rs
```

## Environment

- svelte-check-rs 0.9.16
- Svelte 5 / SvelteKit 2
