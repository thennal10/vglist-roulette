<template>
  <div class="container is-align-items-center is-flex" :style="style" >
    <a :href="'https://vglist.co/games/' + id">
      <div class="title-container" :style="coverUrl ? 'opacity: 0' : 'opacity: 1'">
        <p class="is-size-2 has-text-white"><strong>{{name}}</strong></p>
      </div>
      <img v-if="coverUrl" :src="'https://vglist.co' + coverUrl">
    </a>
  </div>
</template>

<script>
export default {
  name: 'GameItem',
  props: {
    index: Number,
    id: String,
    name: String,
    coverUrl: String,
    totalGames: Number,
    radius: Number,
    rotateAngle: Number,
    rotateTime: Number 
  },
  computed: {
    angle () {
      return (this.index * 360)/this.totalGames
    },
    style () {
      return `transform: rotateY(${this.angle + this.rotateAngle}deg) translateZ(${this.radius}px);
        transition: transform ${this.rotateTime}s cubic-bezier(.2,-0.05,0,1);`
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
  }

  a {
    /* So that object-fit: contain works */
    height: 100%; 
    width: 100%;

    transition: all 0.4s ease-out
  }

  a:hover {
    transform: scale3d(1.1, 1.1, 1.1);
  }

  a:hover img{
    filter: brightness(0.5);
  }

  img {
    height: 100%;
    width: 100%;
    object-fit: contain;

    transition: all 0.4s ease-out
  }

  .title-container {
    z-index: 1;
    position: absolute;
    height: 100%;
    width: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    transition: opacity 0.4s ease-out
  }

  a:hover .title-container {
    /* Important to override the style tag which has higher specificity */
    opacity: 1 !important;
  }
</style>
