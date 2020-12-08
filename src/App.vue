<template>
<div v-if="gameList.length">
  <div class="scene">
    <transition name="fade">
      <div v-if="resultShowing" class="rays"></div>
    </transition>
    <div class="gamesContainer" :style='containerShift'>
      <GameItem v-for="game in filteredGameList" :key="game.index" :index="game.index" :id="game.id" 
        :name="game.name" :coverUrl="game.coverUrl" :totalGames="filteredGameList.length"
        :radius="radius" :rotateAngle="rotateAngle" :rotateTime="rotateTime">
      </GameItem>
    </div>
  </div>

  <div class="controls buttons has-addons">
    <label for="speedup" :class="'button is-success ' + (!speedy ? 'is-light': '')">Speed up roulette</label>
    <input type="checkbox" id="speedup" v-model="speedy" />
    
    <a class="button" :href="`https://vglist.co/settings/oauth/authorize?client_id=${client_id}&redirect_uri=https://tolocalhost.com&response_type=code`">
      Get List
    </a>

    <button class="button is-info is-large" @click="pickRandom">SPIN</button>
    
    <input type="checkbox" id="unplayedfilter" v-model="unplayedOnly" />
    <label for="unplayedfilter" :class="'button is-warning ' + (!unplayedOnly ? 'is-light': '')">Only unplayed</label>
    
    <input type="checkbox" id="completedfilter" v-model="noCompleted" />
    <label for="completedfilter" :class="'button is-primary ' + (!noCompleted ? 'is-light': '')">No completed</label>
  </div>
</div>
<div v-else>
  <figure>
    <img src="./assets/vglist-logo.svg">
  </figure>
  <p class="title">Connect your vglist account, and spin the wheel!</p>
  <a class="button is-info is-light is-large" :href="`https://vglist.co/settings/oauth/authorize?client_id=${client_id}&redirect_uri=https://tolocalhost.com&response_type=code`">
    <strong>Connect</strong>
  </a>
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
      client_id: 'zLV--juCNrcmhgrWKMU7-Im0_PndSrqbOrp63I1D8jE',
      accessToken: null,
      gameList: [], // Contains all games, unfiltered
      rotateAngle: 0, // Angle to rotate
      oddRotateNum: 0, // Used to include and exclude a rotation offset
      resultShowing: false,
      spinning: false,
      speedy: false,
      unplayedOnly: false,
      noCompleted: false
    }
  },
  computed: {
    filteredGameList() { // Filtered games, used for most things
      // Apply filter
      var filteredList = this.gameList.filter(this.gameListFilter)

      // For when the user more than x games, because the renderer doesn't handle too many well
      if (filteredList.length > 30) {
        filteredList = reduceToSize(30, filteredList)
      }

      // Just updates the indexes for calculating new rotations
      for (const [index, game] of filteredList.entries()) {
        game.index = index
      }
      return filteredList
    },
    angleDelta() {
      return 360 / this.filteredGameList.length
    },
    radius() {
      return (SIZE + GAP) / Math.tan((Math.PI/180) * (this.angleDelta/2))
    },
    containerShift() {
      return 'transform: translateZ('+ (-this.radius) +'px);'
    },
    rotateTime() {
      return this.spinning ? (this.speedy ? 1 : 15) : 0
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
            client_id: this.client_id,
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
                  id
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
    gameListFilter(game) { // Returns a comparison used for filtering
      const unplayedComparison = this.unplayedOnly && game.completionStatus != "UNPLAYED"
      const completedComparison = this.noCompleted && (game.completionStatus == "COMPLETED" || game.completionStatus == "FULLY_COMPLETED")
      return !(unplayedComparison || completedComparison)
    },
    renderUserList(list) {
      this.gameList = list.map(function(item, index) {
        item.game.completionStatus = item.completionStatus
        item.game.index = index
        return item.game
      })
      sessionStorage.setItem('gameList', JSON.stringify(this.gameList))
    },
    pickRandom() {
      this.resultShowing = false
      this.spinning = true
      
      var randomGame = this.filteredGameList[Math.floor(Math.random() * this.filteredGameList.length)];
      
      // The rotation offset spins it around a couple times
      this.oddRotateNum = !this.oddRotateNum
      this.rotateAngle = -((360*6*this.oddRotateNum) + (randomGame.index * this.angleDelta))

      window.setTimeout(this.setResult, this.rotateTime * 1000)
    },
    setResult() {
      this.spinning = false
      this.resultShowing = true
    }
  }
}

function reduceToSize(size, list) {
  const ogLen = list.length
  for (let i = 0; i < ogLen - size; i++) {
    list.splice(Math.floor(Math.random() * (list.length - i + 1)), 1)
  }
  return list
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

/* To prevent the rays overlaying it */
input {
  position: relative;
  display: none;
}

/* keyframes for animation;  simple 0 to 360 */
@keyframes spin {
	from { transform: rotate(0deg) scale(2); }
	to { transform: rotate(360deg) scale(2); }
}

.rays	{ /* with animation properties */
	background: url('./assets/rays-main.png') no-repeat center; 
	position: absolute;
  z-index: -1;
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
