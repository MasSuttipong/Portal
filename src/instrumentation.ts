import { validateRuntimeEnv } from "@/lib/runtime-env";

export async function register() {
  validateRuntimeEnv();
}
