<template>
  <div :class="`buttons ${addons ? 'has-addons is-left': 'is-centered'}`">
    <FilterButton id="speedy-filter" text="Speed Up" colorClass="success" 
        @update:checked="$emit('update:speedy', $event)" 
        :checked="speedy" :disabled="disabled" />

    <FilterButton id="unplayed-filter" text="Only Unplayed" colorClass="warning" 
        @update:checked="$emit('update:unplayedOnly', $event)" 
        :checked="unplayedOnly" :disabled="disabled" />

    <FilterButton id="completed-filter" text="No Completed" colorClass="primary" 
        @update:checked="$emit('update:noCompleted', $event)" 
        :checked="noCompleted" :disabled="disabled" :endButton="true"/>
  </div>
</template>

<script>
import FilterButton from './FilterButton'
export default {
  name: 'FiltersContainer',
  components: {
    FilterButton
  },
  props: {
    addons: Boolean,
    speedy: Boolean,
    unplayedOnly: Boolean,
    noCompleted: Boolean,
    disabled: Boolean
  }
}
</script>

<style scoped>
</style>