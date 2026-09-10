module.exports = {
  apps: [
    {
      name: 'edutorai-quiz-portal',
      script: 'server/index.js',
      instances: 'max', // Spawns 1 worker per CPU core
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000
      }
    }
  ]
};
