<template>
  <div class="chat-container">
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

  <div class="message-input">
    <input type="text" v-model="message" placeholder="Type your message here ..." @keyup.enter="sendMessage" />
    <button type="submit" @click="sendMessage">Send</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

let id = 1;

const message = ref("")
const messages = ref([{
  id: id++,
  content: "Hello, World!"
}]);

const sendMessage = async () => {
  messages.value.push({
    id: id++,
    content: message.value
  });

  message.value = "";
}

const getClass = (id: number) => {
  return id % 2 == 0 ? "right" : "left"
}

</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
}

#messages {
  margin-bottom: 20px;
  flex-grow: 1;

  ul {
    list-style-type: none;
    padding: 0;

    li {
      color: $secondary-color;
      font-family: $secondary-font;
      /* top | right | bottom | left */
      margin: 10px 15px 10px 15px;
      text-align: right;

      .item {
        display: inline-block;
        max-width: 80%;
        border: 1px solid #fff;
        border-radius: 30px;
        padding: 15px;
        background-color: $background-color;
        word-wrap: break-word;
      }
    }
  }
}

.message-input {
  display: flex;
  gap: 10px;
  margin: 0 20px;

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
</style>
