<template>
  <div class="scene">
    <Rays :showRays="showRays" />
    <div class="gamesContainer" :style='containerShift'>
      <GameItem v-for="game in renderList" :key="game.index" :index="game.index" :id="game.id" 
        :name="game.name" :coverUrl="game.coverUrl" :totalGames="renderList.length"
        :radius="radius" :rotateAngle="rotateAngle" :rotateTime="rotateTime">
      </GameItem>
    </div>
  </div>
</template>

<script>
import GameItem from './GameItem'
import Rays from './Rays'

export default {
  name: 'FiltersContainer',
  components: {
    GameItem,
    Rays
  },
  props: {
    renderList: Array,
    speedy: Boolean
  },
  created() {
    window.addEventListener('resize', () => {this.windowWidth = window.innerWidth})
  },
  data() {
    return {
      windowWidth: window.innerWidth, // Just stores the current width
      rotateAngle: 0, // Angle to rotate
      numberOfSpins: 0,
      showRays: false
    }
  },
  computed: {
    gameSize() { // Half of actual size, set in scene
    return this.windowWidth > 768 ? 200 : 100 
    },
    gameGap() { // Between two games
      return this.windowWidth > 768 ? 30 : 10
    },
    angleDelta() {
      return 360 / this.renderList.length
    },
    radius() {
      return (this.gameSize + this.gameGap) / Math.tan((Math.PI/180) * (this.angleDelta/2))
    },
    containerShift() {
      return 'transform: translateZ('+ (-this.radius) +'px);'
    },
    rotateTime() {
      return !this.showRays && (this.numberOfSpins != 0) ? (this.speedy ? 1 : 15) : 0
    }
  },
  methods: {
    pickRandom() {
      this.showRays = false
      
      var randomGame = this.renderList[Math.floor(Math.random() * this.renderList.length)];
      
      // The rotation offset spins it around a couple times
      this.numberOfSpins += 1
      let isOdd = this.numberOfSpins % 2
      this.rotateAngle = -((360*6*isOdd) + (randomGame.index * this.angleDelta))

      window.setTimeout(this.setResult, this.rotateTime * 1000)
    },
    setResult() {
      this.showRays = true
    }
  }
}
</script>

<style scoped>
.gamesContainer {
  width: 100%;
  height: 100%;
  position: absolute;
  transform-style: preserve-3d;
  transition: transform 1s;
}

@media (min-width: 768px) {
  .scene {
    position: relative;
    width: 400px;
    height: 400px;
    margin: auto;
    perspective: 500px;
  }
}

@media (max-width: 768px) {
  .scene {
    position: relative;
    width: 200px;
    height: 200px;
    margin: auto;
    perspective: 500px;
  }
}
</style>