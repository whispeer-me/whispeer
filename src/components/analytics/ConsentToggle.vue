<template>
  <div class="consent-toggle">
    <ToggleSwitch
      title="Analytics Tracking"
      :value="consentGiven"
      @change="toggleConsent"
    />
  </div>
</template>

<script>
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";

export default {
  name: "AnalyticsConsentToggle",
  components: {
    ToggleSwitch,
  },
  data() {
    return {
      consentGiven: this.getInitialConsent(),
    };
  },
  methods: {
    getInitialConsent() {
      return localStorage.getItem("analyticsConsent") === "true";
    },
    toggleConsent(newValue) {
      this.consentGiven = newValue;
      localStorage.setItem("analyticsConsent", this.consentGiven.toString());
      if (this.consentGiven) {
        this.$emit("consent-given");
      } else {
        // Handle the case when consent is withdrawn
        // Possibly disabling analytics tracking
      }
    },
  },
};
</script>
