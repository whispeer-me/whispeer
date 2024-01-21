<script setup lang="ts">
import { ref, onMounted, defineEmits } from "vue";

const show = ref(false);
const consentGiven = ref(false);
const showOptInOptOutFeature = ref(false);

const emit = defineEmits<{
  (e: "consent-given"): void;
  (e: "consent-denied"): void;
}>();

onMounted(() => {
  preferenceService.getAnalyticsConsent().then((value) => {
    if (value === null) {
      show.value = true;
    }
  });
});

function giveConsent() {
  consentGiven.value = true;
  show.value = false;
  updatePreference();
  emit("consent-given");
}

function declineConsent() {
  consentGiven.value = false;
  show.value = false;
  updatePreference();
  emit("consent-denied");
}

function toggleConsent(newValue: boolean) {
  consentGiven.value = newValue;
  updatePreference();
  if (newValue) {
    emit("consent-given");
  } else {
    emit("consent-denied");
  }
}

function updatePreference() {
  preferenceService.updateAnalyticsConsent(consentGiven.value);
}
</script>

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

<style lang="scss" scoped>
@import "@/assets/scss/consent.scss";
</style>
