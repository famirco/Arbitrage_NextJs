module.exports = {
    apps: [{
        name: 'arbitrage-backend',
        script: 'server.ts',
        interpreter: 'node',
        interpreter_args: '-r ts-node/register',
        env: {
            NODE_ENV: 'production',
            PORT: 3001
        }
    }]
}