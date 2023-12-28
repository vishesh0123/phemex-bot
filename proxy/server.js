import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Configuration for public and testnet
const PUBLIC_API_URL = "https://api.phemex.com";
const TESTNET_API_URL = "https://testnet-api.phemex.com";
const PORT = 8080;

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
    }
}));

// Proxy endpoint for testnet API
app.use('/testnet-api', createProxyMiddleware({
    target: TESTNET_API_URL,
    changeOrigin: true,
    pathRewrite: {
        [`^/testnet-api`]: '',
    }
}));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
