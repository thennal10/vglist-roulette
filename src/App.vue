<template>
<div class="scene">
  <div class="glowball"></div>
  <div class="gamesContainer" :style='containerShift'>
    <GameItem v-for="game in gameList" :key="game.id" :id="game.id" 
      :name="game.name" :coverUrl="game.coverUrl" :totalGames="gameList.length" 
      :radius="radius" :rotateAngle="rotateAngle">
    </GameItem>
  </div>
</div>
<a class="button" href="https://vglist.co/settings/oauth/authorize?client_id=zLV--juCNrcmhgrWKMU7-Im0_PndSrqbOrp63I1D8jE&redirect_uri=https://tolocalhost.com&response_type=code&scope=read">
  Authorize
</a>
<button class="button" @click="getAccessToken">Get List</button>
<button class="button" @click="pickRandom">Random</button>
</template>

<script>
import GameItem from './components/GameItem.vue'
const SIZE = 200
const GAP = 30

export default {
  name: 'App',
  components: {
    GameItem
  },
  data() {
    return {
      accessToken: null,
      gameList: [],
      rotateAngle: 0, // Angle to rotate
      oddRotateNum: 0 // Used to include and exclude a rotation offset
    }
  },
  computed: {
    angleDelta() {
      return 360 / this.gameList.length
    },
    radius() {
      return (SIZE + GAP) / Math.tan((Math.PI/180) * (this.angleDelta/2))
    },
    containerShift() {
      return 'transform: translateZ('+ (-this.radius) +'px);'
    }
  },
  methods: {
    getAccessToken() {
      var authorizationCode = window.location.href.match(/code=(.*)/)[1]
      
      var url = 'https://vglist.co/settings/oauth/token',
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: 'zLV--juCNrcmhgrWKMU7-Im0_PndSrqbOrp63I1D8jE',
            code: authorizationCode,
            redirect_uri: 'https://tolocalhost.com'
          })
        }

      fetch(url, options)
        .then(response => response.json())
        .then(data => this.setAccessToken(data.access_token))
    },
    setAccessToken(token) {
      this.accessToken = token
      this.getUserList()
    },
    getUserList() {
      var query = `
        query { 
          currentUser {
            gamePurchases {
              nodes {
                game {
                  name
                  coverUrl
                }
                completionStatus
              }
            }
          }
        }
      `

      var url = 'https://vglist.co/graphql',
        options = {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + this.accessToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query: query
          })
      }

      // Make the HTTP Api request
      fetch(url, options)
        .then(response => response.json())
        .then(data => this.renderUserList(data.data.currentUser.gamePurchases.nodes))
    },
    renderUserList(list) {
      var modifiedList = list.map(item => item.game)
      for (const [index, game] of modifiedList.entries()) {
        game.id = index
      }
      this.gameList = modifiedList
    },
    pickRandom() {
      var randomGame = this.gameList[Math.floor(Math.random() * this.gameList.length)];
      console.log(randomGame.name)
      // The rotation offset spins it around a couple times
      this.oddRotateNum = !this.oddRotateNum
      this.rotateAngle = -((360*6*this.oddRotateNum) + (randomGame.id * this.angleDelta))
    }
  }
}
</script>

<style>
#app {
  text-align: center;
}

.gamesContainer {
  width: 100%;
  height: 100%;
  position: absolute;
  transform-style: preserve-3d;
  transition: transform 1s;
}

.scene {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 80px auto;
  perspective: 500px;
}
</style>
