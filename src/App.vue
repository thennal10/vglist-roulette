<template>

<div v-if="gameList.length" class="scene">
  <transition name="fade">
    <div v-if="resultShowing" class="rays"></div>
  </transition>
  <div class="gamesContainer" :style='containerShift'>
    <GameItem v-for="game in gameList" :key="game.id" :id="game.id" 
      :name="game.name" :coverUrl="game.coverUrl" :totalGames="gameList.length" 
      :radius="radius" :rotateAngle="rotateAngle">
    </GameItem>
  </div>
</div>

<div class="controls">
  <a class="button" href="https://vglist.co/settings/oauth/authorize?client_id=zLV--juCNrcmhgrWKMU7-Im0_PndSrqbOrp63I1D8jE&redirect_uri=https://tolocalhost.com&response_type=code&scope=read">
    Authorize
  </a>
  <button class="button is-info is-large" @click="pickRandom">SPIN</button>
</div>

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
  created() {
    // If the list is already saved in memory
    if (sessionStorage.getItem("gameList")) {
      this.gameList = JSON.parse(sessionStorage.getItem("gameList"))
    }

    // Get auth code from url if available
    try {
      var authorizationCode = window.location.href.match(/code=(.*)/)[1]
      this.getAccessToken(authorizationCode)
    } catch (e) {
      console.log("No authorization code found in url")
    }
  },
  data() {
    return {
      accessToken: null,
      gameList: [],
      rotateAngle: 0, // Angle to rotate
      oddRotateNum: 0, // Used to include and exclude a rotation offset
      resultShowing: false
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
    getAccessToken(authorizationCode) {
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
        .then(data => this.setAccessToken(data))
    },
    setAccessToken(data) {
      if (!data.error) {
        this.accessToken = data.access_token
        this.getUserList()
      }
      else {
        console.log("Invalid authorization token")
      }
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
      sessionStorage.setItem('gameList', JSON.stringify(this.gameList))
    },
    pickRandom() {
      this.resultShowing = false

      var randomGame = this.gameList[Math.floor(Math.random() * this.gameList.length)];
      console.log(randomGame.name)
      // The rotation offset spins it around a couple times
      this.oddRotateNum = !this.oddRotateNum
      this.rotateAngle = -((360*6*this.oddRotateNum) + (randomGame.id * this.angleDelta))

      window.setTimeout(this.setResult, 15000)
    },
    setResult() {
      this.resultShowing = true
    }
  }
}
</script>

<style>
html {
  height: 100%;
}
body {
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(198,195,249);
  background: linear-gradient(60deg, rgba(198,195,249,1) 40%, rgba(35,182,255,1) 80%);
}

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
  margin: auto;
  perspective: 500px;
}

/* keyframes for animation;  simple 0 to 360 */
@keyframes spin {
	from { transform: rotate(0deg) scale(2); }
	to { transform: rotate(360deg) scale(2); }
}

.rays	{ /* with animation properties */
	background: url('./assets/rays-main.png') no-repeat center; 
	position: absolute;
  height: 100%;
  width: 100%;

  animation-name: spin; 
	animation-duration: 40000ms; /* 40 seconds */
	animation-iteration-count: infinite; 
	animation-timing-function: linear;
}

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
