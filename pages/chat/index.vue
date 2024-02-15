<template>
  <div class="chat-container">
    <div class="messages-container" ref="messagesContainer" @scroll="checkScrollPosition">
      <div id="messages">
        <ul>
          <li v-for="message in messages" :key="message.id" :class="getMessageClass(message.id)">
            <div class="item">
              {{ message.content }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-if="showNewMessageNotification" class="new-message-notification" @click="scrollToBottom">
    🔔 New message 📨
  </div>
  <div class="message-input">
    <input type="text" v-model="message" placeholder="Type your message here ..." :maxlength="maxCharsAllowed" required
      @keyup.enter="sendMessage" />
    <button type="submit" @click="sendMessage">Send</button>
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
