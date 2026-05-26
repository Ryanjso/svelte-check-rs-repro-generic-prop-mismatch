<script generics="T extends Record<string, unknown>" lang="ts">
  import type { SuperForm } from "sveltekit-superforms";
  import FormField from "$lib/form/FormField.svelte";

  let {
    form,
  }: {
    form: SuperForm<T>;
  } = $props();
</script>

<form>
  <FormField {form} />
  <button type="submit">Submit</button>
</form>
