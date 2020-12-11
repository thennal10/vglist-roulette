<template>
  <div>
  </div>
</template>

<script>
export default {
  name: 'Loading'
}
</script>

<style scoped>
div {
  display: inline-block;
  width: 160px;
  height: 160px;
}
div:after {
  content: " ";
  display: block;
  width: 128px;
  height: 128px;
  margin: 16px;
  border-radius: 50%;
  border: 12px solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>