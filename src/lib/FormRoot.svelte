<script lang="ts">
  import type { Snippet } from "svelte";
  import type { FormStore } from "./form";
  let { form, children }: { form: FormStore<Record<string, unknown>>; children?: Snippet } = $props();
</script>
<form onsubmit={form.submit}>
  {@render children?.()}
  <button type="submit">Submit</button>
</form>
