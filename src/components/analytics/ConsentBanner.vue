<template>
  <div v-if="show" class="analytics-consent-banner">
    <p>
      Can we collect analytics data during your visit? <br />
      Any concern? Read our
      <router-link to="/privacy-policy" class="footer-link"
        >Privacy Policy</router-link
      >.
    </p>

    <button class="consent-button yes-button" @click="giveConsent">Yes</button>
    <button class="consent-button no-button" @click="declineConsent">No</button>
  </div>

  <div v-else class="consent-toggle">
    <ToggleSwitch
      v-if="showOptInOptOutFeature"
      title="Analytics Tracking"
      :value="consentGiven"
      @change="toggleConsent"
    />
  </div>
</template>

<script>
import PreferenceService from "@/services/PreferenceService";
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";

export default {
  name: "AnalyticsConsentBanner",
  components: {
    ToggleSwitch,
  },
  data() {
    return {
      show: false,
      consentGiven: false,
      showOptInOptOutFeature: false,
    };
  },
  mounted() {
    PreferenceService.getAnalyticsConsent().then((value) => {
      if (value === null) {
        this.show = true;
      }
    });
  },
  methods: {
    giveConsent() {
      this.consentGiven = true;
      this.show = false;
      this.updatePreference();
      this.$emit("consent-given");
    },
    declineConsent() {
      this.consentGiven = false;
      this.show = false;
      this.updatePreference();
      this.$emit("consent-denied");
    },
    toggleConsent(newValue) {
      this.consentGiven = newValue;
      this.updatePreference();
      if (newValue) {
        this.$emit("consent-given");
      } else {
        this.$emit("consent-denied");
      }
    },
    updatePreference() {
      PreferenceService.updateAnalyticsConsent(this.consentGiven);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/app.scss";

.analytics-consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: $primary-color;
  color: white;
  text-align: center;
  z-index: 1000;
  font-size: 14px;
  font-family: $secondary-font;
  padding-bottom: 16px;

  p {
    line-height: 1.5;
    padding: 16px;
  }

  .consent-button {
    @extend %button-style;
    margin: 0 10px;
  }

  .yes-button {
    &:hover {
      background-color: darken($primary-color, 10%);
    }
  }

  .no-button {
    background-color: $secondary-color;
    color: $primary-color;

    &:hover {
      background-color: lighten($secondary-color, 10%);
      color: darken($primary-color, 10%);
    }
  }
}
</style>
