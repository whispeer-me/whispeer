import { defineNuxtModule } from "@nuxt/kit";
import { setupDependencies } from "./dependency.config";

export default defineNuxtModule({
  setup() {
    setupDependencies();
    console.log("Dependencies are configured.");
  },
});
