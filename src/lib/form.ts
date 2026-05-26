import { writable, type Writable, type Readable, readable } from "svelte/store";

export interface FormStore<T extends Record<string, unknown>> {
  data: Writable<T>;
  errors: Writable<Partial<Record<keyof T, string[]>>>;
  submit: () => Promise<void>;
  reset: () => void;
  submitting: Readable<boolean>;
  valid: Readable<boolean>;
  tainted: Writable<Partial<Record<keyof T, boolean>>>;
  options: Partial<{
    id: string;
    resetForm: boolean;
    invalidateAll: boolean;
    onSubmit: (data: T) => Promise<void>;
    onResult: (result: { success: boolean }) => void;
  }>;
}

export function createForm<T extends Record<string, unknown>>(defaults: T): FormStore<T> {
  return {
    data: writable(defaults),
    errors: writable({}),
    submit: async () => {},
    reset: () => {},
    submitting: readable(false),
    valid: readable(true),
    tainted: writable({}),
    options: {},
  };
}
