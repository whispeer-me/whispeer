// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="chat-container">
    <div
      ref="messagesContainer"
      class="messages-container"
      @scroll="checkScrollPosition"
    >
      <div id="messages">
        <ul>
          <li
            v-for="item in messages"
            :key="item.id"
            :class="getMessageClass(item.id)"
          >
            <ChatMessageItem :message="item.content" />
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div
    v-if="showNewMessageNotification"
    class="new-message-notification"
    @click="scrollToBottom"
  >
    🔔 New message 📨
  </div>
  <div class="message-input">
    <input
      v-model="message"
      type="text"
      placeholder="Type your message here ..."
      :maxlength="maxCharsAllowed"
      required
      @keyup.enter="sendMessage"
    >
    <button type="submit" @click="sendMessage">
      Send
    </button>
  </div>
</template>

<script setup lang="ts">
import useChat from "~/composables/chat/ui";

const {
  message,
  messages,
  sendMessage,
  checkScrollPosition,
  scrollToBottom,
  showNewMessageNotification,
  messagesContainer,
  getMessageClass,
  maxCharsAllowed,
} = useChat();
</script>

<style scoped lang="scss">
@import "@/assets/scss/chat.scss";
</style>
