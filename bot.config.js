const botConfig = {
    endpoints: {
        public: {
            rest: 'https://api.phemex.com',
            websocket: 'wss://ws.phemex.com'
        },
        testnet: {
            rest: 'https://testnet-api.phemex.com',
            websocket: 'wss://testnet-api.phemex.com/ws'
        }
    },
    proxy:{
        public:{
            rest:'http://localhost:8080/public-api'
        },
        testnet:{
            rest:'http://localhost:8080/testnet-api'
        }
    }
}

export default botConfig;