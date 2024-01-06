<template>
  <div class="home">
    <h1>Welcome to Whispeer</h1>

    <p class="intro">
      Create and share secure, encrypted messages that auto-expires in 24 hours.
    </p>

    <button class="cta-button" @click="redirectToCreateMessagePage">
      {{ ctaButtonTitle }}
    </button>

    <div class="statistics">
      <h2 class="stats-title">Messages</h2>
      <div class="stat-groups">
        <div class="stat-item">
          <span class="stat-value">{{ formatNumber(totalMessages) }}</span>
          <p>Total Created</p>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ formatNumber(messagesExpiring) }}</span>
          <p>Expiring Soon</p>
        </div>
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
      ctaButtonTitle: "Create a secure message",
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

    redirectToCreateMessagePage() {
      this.$router.push({ name: "new-message", query: { ref: "cta" } });
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
    font-family: $secondary-font;
  }

  .cta-button {
    @extend %button-style;
    margin-top: 20px;
  }

  .statistics {
    text-align: center;
    margin-top: 60px;
    color: $primary-color;

    .stats-title {
      font-size: 2em;
      margin-bottom: 20px;
    }

    .stat-groups {
      display: flex;
      justify-content: center;

      .stat-item {
        margin: 0 20px;
        text-align: center;

        .stat-value {
          font-size: $heading-font-size;
          margin-bottom: 0.5em;
          transition: transform 0.5s ease-in-out;
        }

        p {
          font-size: $text-font-size;
          color: $secondary-color;
        }
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
