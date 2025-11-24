// based on https://docs.doppler.com/docs/pm2
// This enables zero downtime restarts
module.exports = {
  apps: [
    {
      name: 'template-app.com',
      script: './dist/apps/backend/src/index.js',
      instances: 2,
      exec_mode: 'cluster',
      node_args: '--enable-source-maps',
    },
  ],
}
