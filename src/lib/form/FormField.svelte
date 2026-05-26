<script generics="T extends Record<string, unknown>" lang="ts">
  import type { SuperForm } from "sveltekit-superforms";

  let {
    form,
  }: {
    form: SuperForm<T>;
  } = $props();
</script>

<label>
  <input type="text" />
</label>
