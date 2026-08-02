module.exports = {
  apps: [{
    name: "KAT",
    script: "./index.js",
    watch: false,
    env: {
      NODE_ENV: "production",
    }
  }]
}
