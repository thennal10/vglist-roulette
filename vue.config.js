module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/vglist-roulette/'
    : '/',
  chainWebpack: config => {
    config
        .plugin('html')
        .tap(args => {
            args[0].title = "vglist roulette";
            return args;
        })
    }
  }
  