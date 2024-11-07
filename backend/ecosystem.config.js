module.exports = {
    apps: [
      {
        name: 'arbitrage-backend',
        script: 'server.ts',
        interpreter: 'node',
        interpreter_args: '-r ts-node/register',
        instances: 1,
        exec_mode: 'fork',
        watch: false,
        max_memory_restart: '500M',
        env: {
          NODE_ENV: 'production',
          PORT: 3001
        }
      },
      
    ]
  };