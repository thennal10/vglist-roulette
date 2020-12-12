<template>
  <button :class="buttonClass" :style="additionalStyle" :disabled="disabled">
    <label :for="id"> {{text}} </label>
  </button>
  <input type="checkbox" :id="id" :checked="checked"
      @input="$emit('update:checked', $event.target.checked)" :disabled="disabled"/>
</template>

<script>
export default {
  name: 'FilterButton',
  props: {
    id: String,
    text: String,
    colorClass: String,
    checked: Boolean,
    disabled: Boolean,
    endButton: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonClass() {
      return `button is-${this.colorClass} ${this.checked ? '' : 'is-light'}`
    },
    additionalStyle() { // Because input at the end fucks with the has-addons class on the container
        return this.endButton ? 'border-bottom-right-radius: 4px; border-top-right-radius: 4px;': ''
    }
  }
}
</script>

<style scoped>
input {
  display: none;
}

label {
  cursor: pointer;
}

button[disabled] > label {
  cursor: not-allowed;
}
</style>
