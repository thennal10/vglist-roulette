<template>
  <div :class="`buttons ${addons ? 'has-addons is-right': 'is-centered'}`">
    <button :disabled="isSpinning" class="button is-dark" 
      @click="$emit('recompute')"
      >Get new set of games
    </button>

    <a class="button is-link" href="https://github.com/thennal10/vglist-roulette">About</a>

    <a class="button is-info" :href="`https://vglist.co/settings/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`">
      Reset list
    </a>
  </div>
</template>

<script>
export default {
  name: 'MiscButtons',
  props: {
    addons: Boolean,
    isSpinning: Boolean,
    client_id: String,
    redirect_uri: String
  }
}
</script>

<style scoped>
</style>
