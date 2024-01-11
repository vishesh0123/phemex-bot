import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import cryptoRandomString from 'crypto-random-string'
import axios from 'axios';
import CryptoJS from 'crypto-js';
import axiosRetry from 'axios-retry';

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

axiosRetry(axios, {
    retries: 3, // Number of retry attempts
    retryDelay: (retryCount) => {
        return retryCount * 2000; // Time between retries increases with the retry count
    },
    retryCondition: (error) => {
        // Retry on network errors or if the response status code is 503 (Service Unavailable)
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response.status === 503;
    },
});

// Configuration for public and testnet
const PUBLIC_API_URL = "https://api.phemex.com";
const TESTNET_API_URL = "https://testnet-api.phemex.com";
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
        io.emit("error", "Failed To Save Configuration");
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

let cacheData = {
    date: new Date('2024-01-01').toDateString(),
    logsCounter: 0,
    tradinghalt: false,
    testnet: false
};

const runEveryMinute = async () => {
    try {
        const today = new Date().toDateString();
        let { discordWebhook, dailyProfitThreshold, dailyLossThreshold, testnet } = readApiCredentials();

        // Handling errors for HTTP request to get trades of today
        const response = await axios.get('http://localhost:8080/trades-today').catch(err => {
            throw new Error(`Failed to fetch trades: ${err.message}`);
        });

        if (today !== cacheData.date) {
            cacheData.date = today;
            cacheData.logsCounter = response.data.length;
            cacheData.testnet = testnet;
        }

        if (cacheData.testnet !== testnet) {
            cacheData.logsCounter = response.data.length;
        }

        if (response.data.length > cacheData.logsCounter) {
            const diff = response.data.length - cacheData.logsCounter;
            io.emit("NewSignal", "");
            for (let i = diff - 1; i >= 0; i--) {
                const trade = response.data[i];
                const payload = {
                    content: `OrderId=${trade.orderID}\nSymbol=${trade.symbol}\nExecPrice=${trade.execPriceRp}\nClosedPnl=${trade.closedPnlRv}\nExecuted Qty=${trade.execQtyRq}\nOrderType=${trade.ordType}\nPosSide=${trade.posSide}`,
                };
                // Handling errors for HTTP request to post to Discord webhook
                const response1 = await axios.post(discordWebhook, payload).catch(err => {
                    console.error(`Failed to post to Discord: ${err.message}`);
                });
                console.log(response1?.data);
            }
            cacheData.logsCounter = response.data.length;
        }

        // Handling errors for HTTP request to get today's PnL
        const pnlResponse = await axios.get('http://localhost:8080/pnl-today').catch(err => {
            throw new Error(`Failed to fetch PnL: ${err.message}`);
        });
        const pnl = pnlResponse.data;

        if ((pnl >= Number(dailyProfitThreshold)) || (pnl <= (Number(dailyLossThreshold) * -1))) {
            cacheData.tradinghalt = true;
            closeLastPosition();
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
        // Handle the error appropriately here (e.g., retry mechanism, alerting, etc.)
    }
};

setInterval(runEveryMinute, 10000);

function readApiCredentials() {
    try {
        // Read the file contents
        const fileContents = fs.readFileSync(SETTING, 'utf8');

        // Try parsing the file contents as JSON
        try {
            const credentials = JSON.parse(fileContents);
            return credentials;
        } catch (parseError) {
            // Handle JSON parsing errors
            console.error('Failed to parse the API credentials file as JSON:', parseError);
            throw new Error('Invalid JSON format in API credentials file.');
        }
    } catch (readError) {
        // Handle file reading errors
        if (readError.code === 'ENOENT') {
            console.error(`API credentials file not found: ${SETTING}`);
        } else {
            console.error(`Error reading the API credentials file: ${readError}`);
        }
        throw readError;  // Re-throw the error to handle it further up the call stack
    }
}

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('message', (data) => {
        console.log('Message received:', data);

        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const getCurrentPrice = async (symbol) => {
    try {
        // Attempt to read the API credentials
        let { testnet } = readApiCredentials(); // Make sure the readApiCredentials function is properly error-handled.
        let URL = testnet === false ? PUBLIC_API_URL : TESTNET_API_URL;
        let apiEndPoint = URL + `/md/v2/ticker/24hr?symbol=${symbol}`;

        // Attempt to make the HTTP request
        const response = await axios.get(apiEndPoint);

        // Check if the required data is present
        if (response.data && response.data.result && response.data.result.markPriceRp) {
            return response.data.result.closeRp;
        } else {
            // Handle the case where the data structure is not as expected
            throw new Error('Unexpected response structure');
        }

    } catch (error) {
        // Log the error
        console.error(`Failed to get the current price for ${symbol}:`, error);

        // Depending on your application's needs, you might want to re-throw the error, return null, or handle it in some other way
        throw error; // or return null; or any other error handling mechanism
    }
};

const getLastTradeDirection = async (pair) => {
    const response = await axios.get('http://localhost:8080/trades-today');
    let sidee = 'Sell';
    let posSidee = 'Long';
    let qty = '0.01';
    let symbol = pair;
    let index = -1;

    if (response.data && response.data.length > 0) {
        for (let i = 0; i < response.data.length; i++) {
            if (response.data[i].symbol === pair) {
                index = i;
                break;
            }

        }

    }

    if (index > -1) {
        sidee = response.data[index].side
        posSidee = response.data[index].posSide
        qty = response.data[index].orderQtyRq
        symbol = response.data[index].symbol

    }


    return { sidee, posSidee, qty, symbol }
}

const cancelAllOrders = async (pair) => {
    try {
        // Attempt to read the API credentials
        let { apiKey, apiSecret, testnet } = readApiCredentials(); // Ensure readApiCredentials() is properly error-handled.
        let URL = testnet === false ? PUBLIC_API_URL : TESTNET_API_URL;
        let apiEndPoint1 = URL + `/g-orders/all?symbol=${pair}&untriggered=true`;
        let apiEndPoint2 = URL + `/g-orders/all?symbol=${pair}&untriggered=false`;
        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
        const sigdata1 = `/g-orders/allsymbol=${pair}&untriggered=true` + currentUnixEpochTime;
        const sigdata2 = `/g-orders/allsymbol=${pair}&untriggered=false` + currentUnixEpochTime;
        const signature1 = CryptoJS.HmacSHA256(sigdata1, apiSecret).toString();
        const signature2 = CryptoJS.HmacSHA256(sigdata2, apiSecret).toString();

        // Make two delete requests in parallel
        const [response1, response2] = await Promise.all([
            axios.delete(apiEndPoint1, {
                headers: {
                    'x-phemex-access-token': apiKey,
                    'x-phemex-request-expiry': currentUnixEpochTime,
                    'x-phemex-request-signature': signature1
                }
            }),
            axios.delete(apiEndPoint2, {
                headers: {
                    'x-phemex-access-token': apiKey,
                    'x-phemex-request-expiry': currentUnixEpochTime,
                    'x-phemex-request-signature': signature2
                }
            })
        ]);


    } catch (error) {
        // Log the error
        console.error(`Failed to cancel all orders for ${pair}:`, error);

        // Depending on your application's needs, you might want to re-throw the error, return a status, or handle it in some other way
        throw error; // or return some error status; or any other error handling mechanism
    }
};

const closeLastPosition = async (pair) => {
    const { posSidee, qty, symbol } = await getLastTradeDirection(pair);
    let {
        apiKey,
        apiSecret,
        testnet
    } = readApiCredentials();
    let URL = testnet === false ? PUBLIC_API_URL : TESTNET_API_URL;
    let apiEndPoint = URL + "/g-orders/create";
    const clOrdID = cryptoRandomString({ length: 40 })
    const reduceOnly = false;
    const closeOnTrigger = false;
    const orderQtyRq = qty;
    const ordType = 'Market';
    const side = posSidee === 'Long' ? 'Sell' : 'Buy';
    const posSide = posSidee;
    const timeInForce = 'ImmediateOrCancel';
    const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
    apiEndPoint = apiEndPoint + `?clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}`;

    const sigData = '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}` + currentUnixEpochTime;
    const signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();
    const data = await axios.put(apiEndPoint, null, {
        headers: {
            'x-phemex-access-token': apiKey,
            'x-phemex-request-expiry': currentUnixEpochTime,
            'x-phemex-request-signature': signature
        }
    })

}



const placeTrailingSl = async (symbol, qty, direction) => {
    // Attempt to read the API credentials
    let { apiKey, apiSecret, trailingStopLoss, testnet } = readApiCredentials(); // Ensure readApiCredentials() is properly error-handled.
    const clOrdID = cryptoRandomString({ length: 40 });
    const closeOnTrigger = true;
    const currentPrice = parseFloat(await getCurrentPrice(symbol).catch(err => { throw new Error(`Failed to fetch current price: ${err.message}`); }));
    const stopPxRp = direction === 'Long' ? currentPrice - (currentPrice * parseFloat(trailingStopLoss) / 100) : currentPrice + (currentPrice * parseFloat(trailingStopLoss) / 100);
    const ordType = 'Stop';
    // const orderQtyRq = qty;
    let pegOffsetProportionRr = parseFloat(trailingStopLoss) / 100;
    let pegPriceType = 'TrailingStopByProportionPeg';
    const posSide = direction;
    const side = direction === 'Long' ? 'Sell' : 'Buy';
    pegOffsetProportionRr = posSide === 'Long' ? pegOffsetProportionRr * -1 : pegOffsetProportionRr;
    const timeInForce = 'ImmediateOrCancel';
    const triggerType = 'ByLastPrice';
    let URL = testnet === false ? PUBLIC_API_URL : TESTNET_API_URL;
    let apiEndPoint = `${URL}/g-orders/create?clOrdID=${clOrdID}&stopPxRp=${stopPxRp}&closeOnTrigger=${closeOnTrigger}&ordType=${ordType}&pegOffsetProportionRr=${pegOffsetProportionRr}&pegPriceType=${pegPriceType}&posSide=${posSide}&side=${side}&symbol=${symbol}&timeInForce=${timeInForce}&triggerType=${triggerType}`;
    const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
    const sigData = `/g-orders/createclOrdID=${clOrdID}&stopPxRp=${stopPxRp}&closeOnTrigger=${closeOnTrigger}&ordType=${ordType}&pegOffsetProportionRr=${pegOffsetProportionRr}&pegPriceType=${pegPriceType}&posSide=${posSide}&side=${side}&symbol=${symbol}&timeInForce=${timeInForce}&triggerType=${triggerType}` + currentUnixEpochTime;
    const signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

    // Make the PUT request
    const response = await axios.put(apiEndPoint, null, {
        headers: {
            'x-phemex-access-token': apiKey,
            'x-phemex-request-expiry': currentUnixEpochTime,
            'x-phemex-request-signature': signature
        }
    });

    // Do something with the response if needed
    console.log('Order placed:', response.data);
};

const setLeverage = async (symbol) => {
    try {
        let {
            testnet,
            leverage,
            marginMode,
            posMode,
            apiKey,
            apiSecret
        } = readApiCredentials();  // Ensure readApiCredentials() is properly error-handled.
        posMode = 2;

        const URL = testnet === false ? PUBLIC_API_URL : TESTNET_API_URL;
        let apiEndPoint = `${URL}/g-positions/leverage`;
        let leverageRr = Number(leverage);
        if (isNaN(leverageRr)) {
            throw new Error('Invalid leverage value');
        }
        if (marginMode === 1) {
            leverageRr = (leverageRr * -1);
        }

        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
        let signature;
        let sigData;

        if (posMode === 1) {
            apiEndPoint += `?symbol=${symbol}&leverageRr=${leverageRr}`;
            sigData = `/g-positions/leveragesymbol=${symbol}&leverageRr=${leverageRr}` + currentUnixEpochTime;
        } else {
            apiEndPoint += `?symbol=${symbol}&longLeverageRr=${leverageRr}&shortLeverageRr=${leverageRr}`;
            sigData = `/g-positions/leveragesymbol=${symbol}&longLeverageRr=${leverageRr}&shortLeverageRr=${leverageRr}` + currentUnixEpochTime;
        }

        signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

        try {
            const response = await axios.put(apiEndPoint, null, {
                headers: {
                    'x-phemex-access-token': apiKey,
                    'x-phemex-request-expiry': currentUnixEpochTime,
                    'x-phemex-request-signature': signature
                }
            });
        } catch (networkError) {
            console.error(`Network error: ${networkError.message}`);

        }
    } catch (error) {
        console.error(`Failed to process leverage setting: ${error.message}`);
    }
};

const cancleLimitOrder = async (id, pair, posSide) => {

    // Attempt to read the API credentials
    let { apiKey, apiSecret, testnet } = readApiCredentials(); // Ensure readApiCredentials() is properly error-handled.
    let URL = testnet === false ? PUBLIC_API_URL : TESTNET_API_URL;
    let apiEndPoint1 = URL + `/g-orders/cancel?clOrdID=${id}&symbol=${pair}&posSide=${posSide}`;
    const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
    const sigdata1 = `/g-orders/cancelclOrdID=${id}&symbol=${pair}&posSide=${posSide}` + currentUnixEpochTime;
    const signature1 = CryptoJS.HmacSHA256(sigdata1, apiSecret).toString();


    // Make two delete requests in parallel
    const [response1] = await Promise.all([
        axios.delete(apiEndPoint1, {
            headers: {
                'x-phemex-access-token': apiKey,
                'x-phemex-request-expiry': currentUnixEpochTime,
                'x-phemex-request-signature': signature1
            }
        }),
    ]);


}

app.post('/trade', async (req, res) => {
    try {

        let parsedBody;
        try {
            parsedBody = JSON.parse('{' + req.body + '}');
        } catch (parseError) {
            console.error(parseError);
        }

        let pair = parsedBody.symbol;
        if (pair.slice(-3) === 'USD') {
            pair = pair + 'T';

        }
        // const close = parseFloat(parsedBody.price);
        const signal = parsedBody.direction === '{{long}}' ? 'Long' : 'Short';
        await setLeverage(pair);

        const { sidee, posSidee } = await getLastTradeDirection(pair);
        let executeTrade = false;
        if ((sidee === 'Buy' && posSidee === 'Long') || (sidee === 'Sell' && posSidee === 'Short')) {
            if (posSidee !== signal) {
                await closeLastPosition(pair);
                executeTrade = true;

            }

        } else {
            await cancelAllOrders(pair);
            executeTrade = true;
        }

        if (cacheData.tradinghalt === true) {
            executeTrade = false;
            console.error('Trading Halted');
            return res.status(400).json({ error: 'Bad Request', message: 'Profit/Loss Threshold Reached' });
        }

        if (executeTrade === true) {
            let {
                apiKey,
                apiSecret,
                orderType,
                takeProfit,
                stopLoss,
                limitDistance,
                maxUSDTperTrade,
                testnet,
                trailingStopLoss,
                canclelimitOrderTime,
                leverage,
                discordWebhook
            } = readApiCredentials();

            leverage = Number(leverage);
            takeProfit = parseFloat(takeProfit);
            stopLoss = parseFloat(stopLoss)
            limitDistance = parseFloat(limitDistance)
            maxUSDTperTrade = parseFloat(maxUSDTperTrade)
            const URL = testnet === false ? PUBLIC_API_URL : TESTNET_API_URL;
            let apiEndPoint = URL + "/g-orders/create";
            const clOrdID = cryptoRandomString({ length: 40 })
            const currentPrice = parseFloat(await getCurrentPrice(pair));
            const symbol = pair;
            const reduceOnly = false;
            const closeOnTrigger = false;
            const ordType = orderType === 1 ? 'Market' : 'Limit'
            let orderQtyRq = maxUSDTperTrade * leverage / currentPrice;
            let factor = 0.00000001;
            if (currentPrice >= 0.00001) {
                factor = 0.0000001;
            }
            if (currentPrice >= 0.0001) {
                factor = 0.000001;
            }
            if (currentPrice >= 0.001) {
                factor = 0.00001;
            }
            if (currentPrice >= 0.01) {
                factor = 0.0001;
            }
            if (currentPrice >= 0.1) {
                factor = 0.001;
            }
            if (currentPrice >= 1) {
                factor = 0.01
            }
            if (currentPrice >= 10) {
                factor = 0.1
            }
            if (currentPrice >= 100) {
                factor = 1
            }
            if (currentPrice >= 1000) {
                factor = 10
            }
            if (currentPrice >= 10000) {
                factor = 20
            }
            let priceRp = signal === 'Long' ? currentPrice + factor : currentPrice - factor;
            priceRp = orderType !== 1 ? priceRp : null;

            let side = signal === 'Long' ? 'Buy' : 'Sell';
            const posSide = signal;
            const timeInForce = orderType === 1 ? 'ImmediateOrCancel' : 'GoodTillCancel';

            let takeProfitRp = signal === 'Long' ? (currentPrice + (currentPrice * takeProfit / (leverage * 100))) : (currentPrice - (currentPrice * takeProfit / (leverage * 100)));
            let stopLossRp = signal === 'Long' ? (currentPrice - (currentPrice * stopLoss / (leverage * 100))) : (currentPrice + (currentPrice * stopLoss / (leverage * 100)));

            //limit distance
            priceRp = orderType === 3 ?
                (
                    signal === 'Long' ?
                        currentPrice - (currentPrice * limitDistance / 100) :
                        currentPrice + (currentPrice * limitDistance / 100)
                ) :
                priceRp;
            takeProfitRp = orderType === 3 ?
                (
                    signal === 'Long' ?
                        (priceRp + (priceRp * takeProfit / (leverage * 100))) :
                        (priceRp - (priceRp * takeProfit / (leverage * 100)))
                ) :
                takeProfitRp;
            stopLossRp = orderType === 3 ?
                (
                    signal === 'Long' ?
                        (priceRp - (priceRp * stopLoss / (leverage * 100))) :
                        (priceRp + (priceRp * stopLoss / (leverage * 100)))
                ) :
                stopLossRp;
            orderQtyRq = orderType === 3 ? (maxUSDTperTrade / priceRp) : orderQtyRq;

            const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
            let signature;
            apiEndPoint = apiEndPoint + `?clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}&takeProfitRp=${takeProfitRp}&stopLossRp=${stopLossRp}`;
            if (orderType === 1) {
                const sigData = '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}&takeProfitRp=${takeProfitRp}&stopLossRp=${stopLossRp}` + currentUnixEpochTime;
                signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

            } else {
                apiEndPoint = apiEndPoint + `&priceRp=${priceRp}`
                const sigData = '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}&takeProfitRp=${takeProfitRp}&stopLossRp=${stopLossRp}&priceRp=${priceRp}` + currentUnixEpochTime;
                signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();
            }

            try {
                console.log(apiEndPoint);
                const data = await axios.put(apiEndPoint, null, {
                    headers: {
                        'x-phemex-access-token': apiKey,
                        'x-phemex-request-expiry': currentUnixEpochTime,
                        'x-phemex-request-signature': signature
                    }
                });
                if (Number(trailingStopLoss) !== 0) {
                    await placeTrailingSl(pair, orderQtyRq, signal);
                }
                res.json(data.data);
                if (data.data.code && data.data.code !== 0) {
                    const payload = {
                        content: "Trade Could not be processed due to .." + data.data.msg + "  Error from backend (No issues at bot side)"
                    };
                    const response1 = await axios.post(discordWebhook, payload).catch(err => {
                        console.error(`Failed to post to Discord: ${err.message}`);
                    });

                }
                if (orderType === 3) {
                    setTimeout(async () => {
                        await cancleLimitOrder(clOrdID, pair, posSide);
                    }, Number(canclelimitOrderTime) * 1000);
                }
            } catch (networkError) {
                console.error(`Network error: ${networkError.message}`);

            }
        }
    } catch (error) {
        let {
            discordWebhook
        } = readApiCredentials();
        const payload = {
            content: "Trade Could not be processed due to .." + error.message
        };
        const response1 = await axios.post(discordWebhook, payload).catch(err => {
            console.error(`Failed to post to Discord: ${err.message}`);
        });
        console.error(`Failed to process trade: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error', message: 'An error occurred while processing the trade.' });
    }
});



app.get('/trades-today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const unixTimestamp = Math.floor(today.getTime());
        let { apiKey, apiSecret, testnet } = readApiCredentials(); // Ensure readApiCredentials() is properly error-handled.
        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
        let URL = testnet === false ? PUBLIC_API_URL : TESTNET_API_URL;
        let api = `${URL}/api-data/g-futures/trades?currency=USDT&start=${unixTimestamp}&offset=0&limit=200`

        const sigdata = `/api-data/g-futures/tradescurrency=USDT&start=${unixTimestamp}&offset=0&limit=200` + currentUnixEpochTime;
        const signature = CryptoJS.HmacSHA256(sigdata, apiSecret).toString();

        // Make the GET request
        const response = await axios.get(api, {
            headers: {
                'x-phemex-access-token': apiKey,
                'x-phemex-request-expiry': currentUnixEpochTime,
                'x-phemex-request-signature': signature
            }
        });

        // Check if the required data is present
        if (response.data && response.data.data && response.data.data.rows) {
            res.json(response.data.data.rows);
        } else {
            // Handle the case where the data structure is not as expected
            throw new Error('Unexpected response structure');
        }
    } catch (error) {
        // Log the error
        console.error(`Failed to fetch trades for today:`, error);

        // Respond with an error message
        res.status(500).json({ error: 'An error occurred while fetching trades for today.' });
    }
});


app.get('/orders-today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const unixTimestamp = Math.floor(today.getTime());
        let { apiKey, apiSecret, testnet } = readApiCredentials();  // Ensure this function is properly error-handled.
        let URL = testnet === false ? PUBLIC_API_URL : TESTNET_API_URL;
        let api = `${URL}/api-data/g-futures/orders?currency=USDT&start=${unixTimestamp}&limit=200`;
        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
        const sigdata = `/api-data/g-futures/orderscurrency=USDT&start=${unixTimestamp}&limit=200` + currentUnixEpochTime;
        const signature = CryptoJS.HmacSHA256(sigdata, apiSecret).toString();

        // Make the GET request
        const response = await axios.get(api, {
            headers: {
                'x-phemex-access-token': apiKey,
                'x-phemex-request-expiry': currentUnixEpochTime,
                'x-phemex-request-signature': signature
            }
        });

        // Check if the required data is present
        if (response.data) {
            res.json(response.data);
        } else {
            // Handle the case where the data structure is not as expected
            throw new Error('Unexpected response structure');
        }
    } catch (error) {
        // Log the error
        console.error(`Failed to fetch orders for today:`, error);

        // Respond with an error message
        res.status(500).json({ error: 'An error occurred while fetching orders for today.' });
    }
});

app.get('/pnl-today', async (req, res) => {
    try {
        // Attempt to make the HTTP request
        const response = await axios.get('http://localhost:8080/trades-today');

        // Verify the response data structure
        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Unexpected response structure from trades-today API');
        }

        let pnl = 0;
        let amt = 0;

        response.data.forEach((trade) => {
            const closedPnlRv = parseFloat(trade.closedPnlRv);
            const execFeeRv = parseFloat(trade.execFeeRv);

            // Check for parsing errors
            if (isNaN(closedPnlRv) || isNaN(execFeeRv)) {
                throw new Error('Invalid trade data encountered');
            }

            pnl += closedPnlRv;
            amt += execFeeRv;
        });

        res.json({ "pnl": pnl - amt });
    } catch (error) {
        // Log the error
        console.error(`Failed to calculate PnL for today: ${error.message}`);

        // Respond with an error message
        res.status(500).json({ error: 'Internal Server Error', message: 'An error occurred while calculating PnL for today.' });
    }
});


httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
