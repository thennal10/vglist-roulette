<template>
  <div class="container is-align-items-center is-flex" :style="style" >
    <a :href="'https://vglist.co/games/' + id">
      <img v-if="coverUrl" :src="'https://vglist.co' + coverUrl">
      <p v-else class="has-text-centered is-size-2"><strong>{{name}}</strong></p>
    </a>
  </div>
</template>

<script>
export default {
  name: 'GameItem',
  props: {
    index: Number,
    id: Number,
    name: String,
    coverUrl: String,
    totalGames: Number,
    radius: Number,
    rotateAngle: Number
  },
  computed: {
    angle () {
      return (this.index * 360)/this.totalGames
    },
    style () {
      return 'transform: rotateY(' + (this.angle + this.rotateAngle) + 
        'deg) translateZ(' + this.radius + 'px);' //+
        //'background : hsla(' + this.angle + ', 100%, 50%, 0.8)'
    }
  }
}
</script>

<style scoped>
  .container {
    position: absolute;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 15s cubic-bezier(.2,-0.05,0,1);
  }

  a {
    height: 100%; /* So that object-fit: contain works */
  }
  
  img {
    height: 100%;
    width: 100%;
    object-fit: contain;
    transition: transform 0.4s ease-out
  }

  img:hover {
    transform: scale3d(1.1, 1.1, 1.1);
  }

  p {
    text-shadow: 0 0 5px white;
  }
</style>
