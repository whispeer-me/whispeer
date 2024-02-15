<template>
  <div class="chat-container">
    <div class="messages-container" ref="messagesContainer" @scroll="checkScrollPosition">
      <div id="messages">
        <ul>
          <li v-for="message in messages" :key="message.id" :class="getClass(message.id)">
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
    <input type="text" v-model="message" placeholder="Type your message here ..." @keyup.enter="sendMessage" />
    <button type="submit" @click="sendMessage">Send</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

let id = 1;

const message = ref("")
const messages = ref([{
  id: id++,
  content: "Hello, World!"
}]);

const messagesContainer = ref(null);
const userHasScrolledUp = ref(false);
const showNewMessageNotification = ref(false);

const sendMessage = async () => {
  messages.value.push({
    id: id++,
    content: message.value
  });

  message.value = "";
  maybeScrollToBottom();
}

const getClass = (id: number) => {
  return id % 2 == 0 ? "sender" : "receiver"
}

const checkScrollPosition = () => {
  // How far from the bottom should consider user wants to see old message
  // So that we won't scroll to bottom on new message arrives
  // But we want to notify them on new message arrives in such case
  const threshold = 100;
  const position = messagesContainer.value.scrollHeight - messagesContainer.value.scrollTop - messagesContainer.value.clientHeight;
  userHasScrolledUp.value = position > threshold;
  // Shall notify the user?
  if (!userHasScrolledUp.value) {
    showNewMessageNotification.value = userHasScrolledUp.value;
  }
}

const maybeScrollToBottom = async () => {
  await nextTick();
  if (!userHasScrolledUp.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    showNewMessageNotification.value = false;
  } else {
    showNewMessageNotification.value = true;
  }
};

const scrollToBottom = async () => {
  await nextTick();
  messagesContainer.value.scrollTo({
    top: messagesContainer.value.scrollHeight,
    behavior: "smooth"
  });
  showNewMessageNotification.value = false;
}


</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.messages-container {
  flex-grow: 1;
  overflow-y: auto;
}

#messages {
  margin-bottom: 20px;
  flex-grow: 1;

  ul {
    list-style-type: none;
    padding: 0;
  }

  .item {
    display: inline-block;
    max-width: 80%;
    border: 1px solid;
    border-radius: 30px;
    padding: 15px;
    background-color: #fff;
    color: #000;
    word-wrap: break-word;
  }
}

.sender {
  @extend %message-style;
  text-align: right;
}

.receiver {
  @extend %message-style;
  text-align: left;
}

.message-input {
  display: flex;
  gap: 10px;
  margin: 0 20px;
  align-self: flex-end;

  input {
    flex-grow: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  button {
    padding: 10px 20px;
    border: none;
    cursor: pointer;
  }
}

.new-message-notification {
  color: #fff;
  font-family: $secondary-font;
  border: 1px solid #fff;
  border-radius: 100px;
  margin: 20px auto;
  padding: 10px;
  width: 200px;
  cursor: pointer;
}
</style>
