<template>
  <div class="container is-max-desktop has-background-grey-lighter">
      <p class="title">{{name}}</p>
  </div>
</template>

<script>
export default {
  name: 'GameItem',
  props: {
    name: String,
  }
}
</script>

<style scoped>
  .container {
    transition: all 1s ease-in-out;
  }
</style>
