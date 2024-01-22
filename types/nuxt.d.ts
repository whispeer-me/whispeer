// This extends the NuxtApp interface from Nuxt 3
declare module "#app" {
  interface NuxtApp {
    $initAnalytics: () => void;
    $stopAnalytics: () => void;
  }
}
