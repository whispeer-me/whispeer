<template>
  <div class="home">
    <h1>Welcome to Whispeer</h1>

    <p class="intro">
      Whispeer is an innovative platform that allows you to create and share
      encrypted messages securely. Whether you're sharing sensitive information
      or just having a private conversation, Whispeer ensures your communication
      remains confidential and secure.
    </p>

    <div class="statistics">
      <div class="stat-item">
        <h2 :key="totalMessages">{{ formatNumber(totalMessages) }}</h2>
        <p>Total Messages Created</p>
      </div>
      <div class="stat-item">
        <h2 :key="messagesExpiring">{{ formatNumber(messagesExpiring) }}</h2>
        <p>Messages Expiring in 24 Hours</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  data() {
    return {
      totalMessages: 0,
      messagesExpiring: 0,
    };
  },
  created() {
    this.fetchData();
    // 30-second interval to fetch data
    this.interval = setInterval(this.fetchData, 30000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    fetchData() {
      // For demonstration purposes
      this.totalMessages = Math.floor(Math.random() * 1000000);
      this.messagesExpiring = Math.floor(Math.random() * 5000);
    },
    formatNumber(num) {
      if (num < 1000) return num.toString();
      if (num < 1000000) return (num / 1000).toFixed(1) + "K";
      return (num / 1000000).toFixed(1) + "M";
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

.home {
  text-align: center;
  color: #ffffff;

  .intro {
    margin: 20px auto;
    max-width: 600px;
    line-height: 1.6;
    font-size: $text-font-size;
    color: $secondary-color;
  }

  .statistics {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    color: $primary-color;

    .stat-item {
      margin: 0 20px;
      text-align: center;

      h2 {
        font-size: $heading-font-size;
        margin-bottom: 0.5em;
        transition: transform 0.5s ease-in-out;
      }

      h2.leave-active {
        animation: pop 0.5s;
      }

      p {
        font-size: $text-font-size;
        color: $secondary-color;
      }
    }
  }

  @keyframes pop {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }
}
</style>
