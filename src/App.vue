<template>
<p class="is-size-1 mb-6 has-text-white"><b>vg</b>list roulette</p>
<div v-if="gameList.length" class="container">
  <Spinner v-if="filteredGameList.length" :renderList="filteredGameList" 
    :speedy="speedy" @spinning="isSpinning = $event" ref="spinner" />
  <p v-else class="is-size-3 has-text-white">No games in your library match the filters currently activated :(</p>
  <div class="columns is-vcentered mt-6">
    <div class="column is-hidden-mobile">
      <MiscButtons :addons="true" :isSpinning="isSpinning" 
        :client_id="client_id" :redirect_uri="redirect_uri" @recompute="recomputeFilteredGameList"/>
    </div>

    <div class="column is-2">
      <button :disabled="isSpinning" class="button is-danger is-large" @click="this.$refs.spinner.pickRandom"><b>SPIN</b></button>
    </div>

    <div class="column is-hidden-mobile">
      <FiltersContainer :disabled="isSpinning" :addons="true" v-model:speedy="speedy" v-model:unplayedOnly="unplayedOnly" v-model:noCompleted="noCompleted" />
    </div>
  </div>
</div>

<Loading v-else-if="showLoading === true"/>

<div v-else>
  <p v-if="showLoading === null" class="title">Connect your vglist account, and spin the wheel!</p>
  <p v-if="showLoading === false" class="title">Invalid authorization code, please try again.</p>
  <a class="button is-info is-light is-large" :href="`https://vglist.co/settings/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`">
    <strong>Connect</strong>
  </a>
</div>
<div class="menu-icon is-hidden-tablet" @click="showModal = true">
  <span class="line"></span>
  <span class="line"></span>
  <span class="line"></span>
</div>
<div v-if="showModal" class="modal is-active">
  <div class="modal-background" @click="showModal = false"></div>
  <div class="modal-content box has-background-white">
    <p class="subtitle">Options:</p>
    <FiltersContainer :disabled="isSpinning" :addons="false" v-model:speedy="speedy" v-model:unplayedOnly="unplayedOnly" v-model:noCompleted="noCompleted" />
    <p class="subtitle">Misc:</p>
    <MiscButtons :addons="false" :isSpinning="isSpinning" 
      :client_id="client_id" :redirect_uri="redirect_uri" @recompute="recomputeFilteredGameList"/>
  </div>
  <button class="modal-close is-large" @click="showModal = false" aria-label="close"></button>
</div>
</template>

<script>
import Spinner from './components/Spinner'
import FiltersContainer from './components/FiltersContainer'
import MiscButtons from './components/MiscButtons'
import Loading from './components/Loading'

export default {
  name: 'App',
  components: {
    Spinner,
    FiltersContainer,
    MiscButtons,
    Loading
  },
  created() {
    // If the list is already saved in memory
    if (sessionStorage.getItem("gameList")) {
      this.gameList = JSON.parse(sessionStorage.getItem("gameList"))
    }

    // Get auth code from url if available
    try {
      var authorizationCode = window.location.href.match(/code=(.*)/)[1]
      this.showLoading = true
      this.getAccessToken(authorizationCode)
    } catch (e) {
      console.log("No authorization code found in url")
    }
  },
  data() {
    return {
      client_id: 'L386b78YE2Xp0XcPLo51KtzTMHatcA7O4R-h4yHLb7g',
      redirect_uri: 'https://thennal10.github.io/vglist-roulette',
      showLoading: null,
      accessToken: null,
      gameList: [], // Contains all games, unfiltered
      showModal: false,
      isSpinning: false,
      // Filters
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
            redirect_uri: this.redirect_uri
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
        this.showLoading = false
        console.log("Invalid authorization token")
      }
    },
    getUserList(startCursor="") {
      var query = `
        query ($startCursor: String) { 
          currentUser {
            gamePurchases (after: $startCursor) {
              pageInfo {
                endCursor
                hasNextPage
              }
              nodes {
                game {
                  id
                  name
                  coverUrl(size: LARGE)
                }
                completionStatus
              }
            }
          }
        }
      `
      var variables = {startCursor: startCursor}
      var url = 'https://vglist.co/graphql',
        options = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            variables: variables
          })
      }

      // Make the HTTP Api request
      fetch(url, options)
        .then(response => response.json())
        .then(data => this.chainQuery(data.data.currentUser.gamePurchases))
    },
    chainQuery(data) {
      this.gameList.push(...data.nodes) // temp storage, saveUserList will map it properly
      if (data.pageInfo.hasNextPage) {
        this.getUserList(data.pageInfo.endCursor)
      }
      else {
        this.saveUserList(this.gameList)
      }
    },
    gameListFilter(game) { // Returns a comparison used for filtering
      const unplayedComparison = this.unplayedOnly && game.completionStatus != "UNPLAYED"
      const completedComparison = this.noCompleted && (game.completionStatus == "COMPLETED" || game.completionStatus == "FULLY_COMPLETED")
      return !(unplayedComparison || completedComparison)
    },
    saveUserList(list) {
      this.gameList = list.map(function(item, index) {
        item.game.completionStatus = item.completionStatus
        item.game.index = index
        return item.game
      })
      sessionStorage.setItem('gameList', JSON.stringify(this.gameList))
    },
    recomputeFilteredGameList() {
      // Just forces the computed property to recompute
      // There isn't a clean way of doing this without reorganizing the entire thing
      this.unplayedOnly = !this.unplayedOnly
      this.unplayedOnly = !this.unplayedOnly
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
@import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;700&display=swap');

html {
  height: 100%;
}

/* Center everything */
body {
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Because touch devices need this, for some reason */
  background: rgb(198,195,249);
  background: linear-gradient(60deg, rgba(198,195,249,1) 40%, rgba(35,182,255,1) 80%);
}

#app {
  text-align: center;
  width: 100%;
}

p, div, a, button {
  font-family: 'Zilla Slab', serif;
}

.menu-icon {
  height: 32px;
  width: 32px;
  position: fixed;
  right: 10px;
  top: 10px;
}

.menu-icon > .line {
    background-color: white;
    height: 3px;
    display: block;
}
.menu-icon > .line + .line {
    margin-top: 8px;
}
</style>
