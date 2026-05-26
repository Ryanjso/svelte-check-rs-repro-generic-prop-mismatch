<script lang="ts">
  import type { FormStore } from "./form";
  let { form, name }: { form: FormStore<Record<string, unknown>>; name: string } = $props();
</script>
<label>
  {name}
  <input type="text" />
</label>
