// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <p class="expire-info">
    This message will expire in
    <span class="highlight">{{ message.expires_in }}</span>
  </p>
  <p class="view-count">
    View Count: <span class="highlight">{{ message.view_count + 1 }}</span>
  </p>
</template>

<script setup lang="ts">
defineProps<{
  message: {
    content: null;
    view_count: number;
    created_at: null;
    expires_in: null;
  };
}>();
</script>
