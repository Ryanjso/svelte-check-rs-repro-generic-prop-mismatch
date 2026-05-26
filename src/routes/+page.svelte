<script lang="ts">
  import { z } from "zod";
  import { createForm } from "$lib/form";
  import FormWrapper from "$lib/FormWrapper.svelte";

  const schema = z.object({
    name: z.string(),
    email: z.string(),
  });

  const form = createForm(schema);
</script>

<FormWrapper {form} />
