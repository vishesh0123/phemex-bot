import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import WebSocket from 'ws';
import crypto from 'crypto';
import path from 'path';



const app = express();
app.use(express.text());

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

// Configuration for public and testnet
const PUBLIC_API_URL = "https://api.phemex.com";
// const TESTNET_API_URL = "https://testnet-api.phemex.com";
const TESTNET_API_URL = "https://api.phemex.com/moc";
const PORT = 8080;
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const SETTING = path.join(__dirname, '..', 'settings.json');

// Add headers for preflight requests
app.use((req, res, next) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    // Include the 'x-phemex-access-token' in the allowed headers
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-phemex-request-expiry, x-phemex-request-signature, x-phemex-access-token');
    if (req.method === 'OPTIONS') {
        // Respond OK to preflight (OPTIONS) requests
        res.sendStatus(200);
    } else {
        next();
    }
});

// Proxy endpoint for public API
app.use('/public-api', createProxyMiddleware({
    target: PUBLIC_API_URL,
    changeOrigin: true,
    pathRewrite: {
        [`^/public-api`]: '',
    },
    onProxyReq: (proxyReq, req, res) => {
        // Ensure the headers are set on the outgoing request to the API
        if (req.headers['x-phemex-access-token']) {
            proxyReq.setHeader('x-phemex-access-token', req.headers['x-phemex-access-token']);
        }
        if (req.headers['x-phemex-request-expiry']) {
            proxyReq.setHeader('x-phemex-request-expiry', req.headers['x-phemex-request-expiry']);
        }
        if (req.headers['x-phemex-request-signature']) {
            proxyReq.setHeader('x-phemex-request-signature', req.headers['x-phemex-request-signature']);
        }
    }
}));

// Proxy endpoint for testnet API
app.use('/testnet-api', createProxyMiddleware({
    target: TESTNET_API_URL,
    changeOrigin: true,
    pathRewrite: {
        [`^/testnet-api`]: '',
    },
    onProxyReq: (proxyReq, req, res) => {
        // Ensure the headers are set on the outgoing request to the API
        if (req.headers['x-phemex-access-token']) {
            proxyReq.setHeader('x-phemex-access-token', req.headers['x-phemex-access-token']);
        }
        if (req.headers['x-phemex-request-expiry']) {
            proxyReq.setHeader('x-phemex-request-expiry', req.headers['x-phemex-request-expiry']);
        }
        if (req.headers['x-phemex-request-signature']) {
            proxyReq.setHeader('x-phemex-request-signature', req.headers['x-phemex-request-signature']);
        }
    }
}));

// New endpoint to handle saving the merged configuration file
app.post('/save-config', express.json(), (req, res) => {
    try {
        const mergedConfig = req.body; // Assuming the merged configuration is sent in the request body
        const configFileContent = JSON.stringify(mergedConfig, null, 2);

        // Save the configuration to a file (adjust the file path as needed)
        fs.writeFileSync('settings.json', configFileContent);

        res.status(200).json({ success: true, message: 'Configuration saved successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

function readApiCredentials() {
    const fileContents = fs.readFileSync(SETTING, 'utf8');
    return JSON.parse(fileContents);
}

function generateSignature(apiKey, apiSecret) {
    const expiry = Math.floor(Date.now() / 1000) + 2 * 60; // 2 minutes into the future
    const signature = crypto.createHmac('sha256', apiSecret).update(`${apiKey}${expiry}`).digest('hex');
    return { signature, expiry };
}

// function subscribeToAOP(ws) {
//     const subscribeMessage = JSON.stringify({
//         "id": 8956,
//         "method": "aop_p.subscribe",
//         "params": []
//     });

//     ws.send(subscribeMessage);
//     console.log('Subscription request sent');
// }

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    const phemex = new WebSocket("wss://ws.phemex.com");

    phemex.on('open', () => {
        console.log("Connected To Phemex WS");
        const { apiKey, apiSecret } = readApiCredentials();
        if (apiKey !== undefined && apiKey !== undefined) {
            const { signature, expiry } = generateSignature(apiKey, apiSecret);
            const authMessage = JSON.stringify({
                method: "user.auth",
                params: ["API", apiKey, signature, expiry],
                id: 1234
            });
            phemex.send(authMessage);

        }


        setInterval(() => {
            if (phemex.readyState === WebSocket.OPEN) {
                phemex.ping();
                // console.log('Ping sent to Phemex');
            }
        }, 5000);
    })

    phemex.on('pong', () => {
        // console.log('Pong received from Phemex');
    });

    phemex.on('close', () => {
        console.log("Disconnected Phemex");
    })

    phemex.on('message', (msg) => {
        const response = JSON.parse(msg);
        if (response.id === 1234) {
            if (response.result && response.result.status === 'success') {
                // subscribeToAOP(phemex);
                console.log('Successfully authenticated with Phemex');
            } else {
                console.error('Failed to authenticate:', response.error);
            }
        }
        if (response.id === 8956) {
            if (response.result && response.result.status === 'success') {
                console.log('Successfully Subscribed To aop');
            } else {
                console.error('Failed to authenticate:', response.error);
            }
        }

    })



    socket.on('message', (data) => {
        console.log('Message received:', data);

        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


app.post('/trade', (req, res) => {
    console.log(req.body === 'LONG');

})

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
