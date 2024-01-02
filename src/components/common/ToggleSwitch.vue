<template>
  <div class="toggle-switch">
    <span>{{ title }}</span>
    <label class="switch">
      <input type="checkbox" v-model="checked" @change="onChange" />
      <span class="slider round"></span>
    </label>
  </div>
</template>

<script>
export default {
  name: "ToggleSwitch",
  props: {
    title: {
      type: String,
      default: "Toggle",
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      checked: this.value,
    };
  },
  methods: {
    onChange() {
      this.$emit("change", this.checked);
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

.toggle-switch {
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    margin-right: 10px;
  }

  .switch {
    @extend %switch-style;
  }
}
</style>
