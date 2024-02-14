<template>
  <div id="messages">
    <ul>
      <li v-for="message in messages" :key="message.id">
        <div class="item">
          {{ message.content }}
        </div>
      </li>
    </ul>
  </div>

  <div>
    <input type="text" v-model="message" placeholder="Type your message here ..." @keyup.enter="sendMessage" />

    <button type="submit" @click="sendMessage">
      Send
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const message = ref("")
const messages = ref([{
  id: 0,
  content: "Hello, World!"
}]);
let id = 1;
const sendMessage = async () => {
  messages.value.push({
    id,
    content: message.value
  });

  id++;

  message.value = "";
}

</script>

<style scoped lang="scss">
#messages {
  ul {
    list-style-type: none;

    li {
      color: $secondary-color;
      font-family: $secondary-font;
      text-align: right;
      margin-top: 12px;

      .item {
        border: 1px solid #fff;
        border-radius: 30px;
        padding: 15px;
      }
    }
  }
}
</style>
