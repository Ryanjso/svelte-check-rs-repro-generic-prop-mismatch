# Repro: Generic Component Props Type Mismatch

## Bug

When a parent component creates a complex generic object (like a form store) and passes
it to a child component, `svelte-check-rs` reports type mismatches that native
`svelte-check` does not.

## What this abstracts

This is a simplified reproduction of a pattern from `sveltekit-superforms`. In that
library, calling `superForm()` returns a deeply generic store object whose type parameter
is the specific form schema (e.g. `SuperForm<{name: string, email: string, age: number}>`).
Components that accept that store declare their prop type as the base constraint
(e.g. `SuperForm<Record<string, unknown>>`).

In our real codebase this pattern produces approximately 350 errors from `svelte-check-rs`.

## How it works here

- `createForm<T>()` in `src/lib/form.ts` returns a `FormStore<{name: string, email: string, age: number}>`.
- `FormRoot.svelte` and `FormField.svelte` accept `FormStore<Record<string, unknown>>` as a prop.
- `+page.svelte` creates the concrete form and passes it to both child components.

The concrete type `{name: string, email: string, age: number}` satisfies the constraint
`Record<string, unknown>`, so the assignment should be valid. Native `svelte-check`
handles this covariance correctly. `svelte-check-rs` rejects it.

## Expected behavior

No type errors. The concrete `FormStore<{name: string, email: string, age: number}>` is
assignable to `FormStore<Record<string, unknown>>` because:

1. `{name: string, email: string, age: number}` extends `Record<string, unknown>`
2. The `Writable<T>` / `Readable<T>` store wrappers are covariant in `T`
3. `Partial<Record<keyof T, ...>>` is also covariant

## Note

If this simplified version does not trigger the exact error in `svelte-check-rs`, the
real-world case involves deeper generic nesting from the superforms library, including
mapped types, conditional types, and more complex store hierarchies. The key pattern is
the same: a generic factory produces a store typed with a specific schema, and child
components accept the store typed with the base constraint.
