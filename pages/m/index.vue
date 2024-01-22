<template>
  <h1>Message View Page</h1>
  <ChiperDisplay message="Hello" />
</template>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

.chiper-display {
  margin-top: 16px;
  margin-bottom: 16px;
}

.passphrase-modal {
  font-family: $secondary-font;
}

.passphrase-input {
  @extend %input-style;
  width: 80%;
  margin: 20px;
  padding: 10px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  button {
    margin-left: 8px;
  }
}

.expire-info,
.view-count {
  color: $secondary-color;
  margin-bottom: 10px;
}
</style>
