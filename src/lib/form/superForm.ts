import type { SuperForm } from "sveltekit-superforms";
import { defaults, superForm } from "sveltekit-superforms";
import { type ZodValidationSchema, zod4 } from "sveltekit-superforms/adapters";
import type { Infer } from "sveltekit-superforms";

export type FormExtended<T extends ZodValidationSchema> = SuperForm<
  Infer<T, "zod4">,
  unknown
>;

export function createForm<T extends ZodValidationSchema>(schema: T): FormExtended<T> {
  return superForm(defaults(zod4(schema)), {
    SPA: true,
    validators: zod4(schema),
  });
}
