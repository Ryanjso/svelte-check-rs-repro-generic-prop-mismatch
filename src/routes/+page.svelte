<script lang="ts">
  import { createForm } from "$lib/form";
  import FormRoot from "$lib/FormRoot.svelte";
  import FormField from "$lib/FormField.svelte";

  const form = createForm({ name: "", email: "", age: 0 });
</script>

<FormRoot {form}>
  <FormField {form} name="name" />
  <FormField {form} name="email" />
</FormRoot>
