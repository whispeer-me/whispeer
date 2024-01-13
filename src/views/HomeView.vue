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
          <span class="stat-value">{{ formatNumber(this.created_count) }}</span>
          <p>Created</p>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ formatNumber(this.view_count) }}</span>
          <p>Viewed</p>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{
            formatNumber(this.expiring_soon_count)
          }}</span>
          <p>Expiring Soon</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MessageService from "@/services/MessageService";

export default {
  name: "HomeView",
  metaInfo: {
    title: "Whispeer - Secure, Private Messaging",
    meta: [
      {
        vmid: "description",
        name: "description",
        content:
          "Whispeer offers a secure way to create and share encrypted messages that auto-expire in 24 hours, ensuring your privacy and data security.",
      },
      {
        vmid: "keywords",
        name: "keywords",
        content:
          "secure messaging, private communication, encrypted messaging, message encryption, auto-expiring messages, data security, privacy, anonymous messaging",
      },
    ],
  },
  data() {
    return {
      created_count: 0,
      expiring_soon_count: 0,
      view_count: 0,
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
    async fetchData() {
      try {
        const { created_count, expiring_soon_count, view_count } = (
          await MessageService.getStats()
        ).data;
        this.created_count = created_count;
        this.expiring_soon_count = expiring_soon_count;
        this.view_count = view_count;
      } catch (err) {
        // do nothing
      }
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
    margin-top: 100px;
    color: $primary-color;

    .stats-title {
      font-size: 2em;
      margin-bottom: 20px;
    }

    .stat-groups {
      display: flex;
      justify-content: center;

      @media (max-width: 480px) {
        width: 80%; /* Adjust the width as needed for smaller screens */
        margin: 0 auto; /* Center the stat-groups container */
      }

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
          @media (max-width: 480px) {
            font-size: 20px;
          }
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
