<template>
  <transition name="fade">
    <div v-if="showRays" class="rays"></div>
  </transition>
</template>

<script>
export default {
  name: 'Rays',
  props: {
    showRays: Boolean
  }
}
</script>

<style scoped>
/* keyframes for animation;  simple 0 to 360 */
/* scale included here so this doesn't override it */
@keyframes spin {
	from { transform: rotate(0deg) scale(2); }
	to { transform: rotate(360deg) scale(2); }
}

.rays	{ /* with animation properties */
	background: url('./../assets/rays-main.png') no-repeat center;
  background-size: contain;
	position: absolute;
  z-index: -1;
  height: 100%;
  width: 100%;

  animation-name: spin; 
	animation-duration: 40000ms; /* 40 seconds */
	animation-iteration-count: infinite; 
	animation-timing-function: linear;
}

/* Fade transition */
.fade-enter-active {
  transition: all .6s ease-in
}
.fade-leave-active {
  transition: all .3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>