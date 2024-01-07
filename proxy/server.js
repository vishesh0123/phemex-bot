import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import cryptoRandomString from 'crypto-random-string'
import axios from 'axios';
import CryptoJS from 'crypto-js';

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

let cacheData = {
    date: new Date('2024-01-01').toDateString(),
    logsCounter: 0,
    tradinghalt: false
}

const runEveryMinute = async () => {
    const response = await axios.get('http://localhost:8080/trades-today');
    const today = new Date().toDateString();
    let { discordWebhook, dailyProfitThreshold, dailyLossThreshold } = readApiCredentials();
    if (today !== cacheData.date) {
        cacheData.date = today;
        cacheData.logsCounter = response.data.length;
    }
    if (response.data.length > cacheData.logsCounter) {
        const diff = response.data.length - cacheData.logsCounter;
        io.emit("NewSignal", "");
        for (let i = cacheData.logsCounter; i < response.data.length; i++) {
            const trade = response.data[i];
            const payload = {
                content: `OrderId=${trade.orderID}\nSymbol=${trade.symbol}\nExecPrice=${trade.execPriceRp}\nClosedPnl=${trade.closedPnlRv}\nExecuted Qty=${trade.execQtyRq}\nOrderType=${trade.ordType}\nPosSide=${trade.posSide}`,
            };
            const response1 = await axios.post(discordWebhook, payload);
            console.log(response1.data);

        }
        cacheData.logsCounter = response.data.length;

    }
    const pnl = await axios.get('http://localhost:8080/pnl-today');
    if ((pnl >= Number(dailyProfitThreshold)) || (pnl <= (Number(dailyLossThreshold) * -1))) {
        cacheData.tradinghalt = true;
        closeLastPosition()
    }


}
setInterval(runEveryMinute, 10000);

function readApiCredentials() {
    const fileContents = fs.readFileSync(SETTING, 'utf8');
    return JSON.parse(fileContents);
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
    let apiEndPoint = PUBLIC_API_URL + `/md/v2/ticker/24hr?symbol=${symbol}`;

    const data = await axios.get(apiEndPoint);
    return data.data.result.markPriceRp;

}

const getLastTradeDirection = async () => {
    const response = await axios.get('http://localhost:8080/trades-today');

    const sidee = response.data[0].side;
    const posSidee = response.data[0].posSide;
    const qty = response.data[0].execQtyRq;
    const symbol = response.data[0].symbol;
    return { sidee, posSidee, qty, symbol };
}

const cancleAllOrders = async () => {
    let {
        apiKey,
        apiSecret,
        pair
    } = readApiCredentials();
    let apiEndPoint1 = PUBLIC_API_URL + `/g-orders/all?symbol=${pair}&untriggered=true`
    let apiEndPoint2 = PUBLIC_API_URL + `/g-orders/all?symbol=${pair}&untriggered=false`
    const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
    const sigdata1 = `/g-orders/allsymbol=${pair}&untriggered=true` + currentUnixEpochTime;
    const sigdata2 = `/g-orders/allsymbol=${pair}&untriggered=false` + currentUnixEpochTime;
    const signature1 = CryptoJS.HmacSHA256(sigdata1, apiSecret).toString();
    const signature2 = CryptoJS.HmacSHA256(sigdata2, apiSecret).toString();
    const data1 = await axios.delete(apiEndPoint1, {
        headers: {
            'x-phemex-access-token': apiKey,
            'x-phemex-request-expiry': currentUnixEpochTime,
            'x-phemex-request-signature': signature1
        }
    });
    const data2 = await axios.delete(apiEndPoint2, {
        headers: {
            'x-phemex-access-token': apiKey,
            'x-phemex-request-expiry': currentUnixEpochTime,
            'x-phemex-request-signature': signature2
        }
    });


}

const closeLastPosition = async () => {
    const { sidee, posSidee, qty, symbol } = await getLastTradeDirection();
    let {
        apiKey,
        apiSecret
    } = readApiCredentials();
    let apiEndPoint = PUBLIC_API_URL + "/g-orders/create";
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

const cancleOrderById = async (id) => {

}

const placeTrailingSl = async (symboll, qty, direction) => {
    let {
        apiKey,
        apiSecret,
        trailingStopLoss

    } = readApiCredentials();
    const clOrdID = cryptoRandomString({ length: 40 })
    const closeOnTrigger = true;
    const currentPrice = parseFloat(await getCurrentPrice(symboll));
    const stopPxRp = currentPrice - (currentPrice * parseFloat(trailingStopLoss) / 100);
    const ordType = 'Stop';
    const orderQtyRq = qty;
    let pegOffsetProportionRr = parseFloat(trailingStopLoss) / 100;
    let pegPriceType = 'TrailingStopByProportionPeg';
    const posSide = direction;
    const side = direction === 'Long' ? 'Sell' : 'Buy';
    const symbol = symboll;
    pegOffsetProportionRr = posSide === 'Long' ? pegOffsetProportionRr * -1 : pegOffsetProportionRr;
    const timeInForce = 'ImmediateOrCancel';
    const triggerType = 'ByLastPrice';
    let apiEndPoint = PUBLIC_API_URL + "/g-orders/create";
    apiEndPoint = apiEndPoint + `?clOrdID=${clOrdID}&stopPxRp=${stopPxRp}&closeOnTrigger=${closeOnTrigger}&ordType=${ordType}&pegOffsetProportionRr=${pegOffsetProportionRr}&pegPriceType=${pegPriceType}&posSide=${posSide}&side=${side}&symbol=${symbol}&timeInForce=${timeInForce}&triggerType=${triggerType}`;
    const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
    const sigData = "/g-orders/create" + `clOrdID=${clOrdID}&stopPxRp=${stopPxRp}&closeOnTrigger=${closeOnTrigger}&ordType=${ordType}&pegOffsetProportionRr=${pegOffsetProportionRr}&pegPriceType=${pegPriceType}&posSide=${posSide}&side=${side}&symbol=${symbol}&timeInForce=${timeInForce}&triggerType=${triggerType}` + currentUnixEpochTime;
    const signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();
    const data = await axios.put(apiEndPoint, null, {
        headers: {
            'x-phemex-access-token': apiKey,
            'x-phemex-request-expiry': currentUnixEpochTime,
            'x-phemex-request-signature': signature
        }
    })
    console.log(data.data);


}

app.post('/trade', async (req, res) => {

    if (cacheData.tradinghalt === true) {
        res.status(400).json({ error: 'Bad Request', message: 'Profit/Loss Threshold Reached' });

    } else {
        const { sidee, posSidee } = await getLastTradeDirection();
        let executeTrade = false;
        if ((sidee === 'Buy' && posSidee === 'Long') || (sidee === 'Sell' && posSidee === 'Short')) {
            if (posSidee.toUpperCase() === req.body) {
                res.status(400).json({ error: 'Bad Request', message: 'Your request is invalid.' });

            } else {
                await closeLastPosition();
                executeTrade = true;
            }

        } else {
            await cancleAllOrders();
            executeTrade = true;
        }


        if (executeTrade === true) {
            let {
                apiKey,
                apiSecret,
                orderType,
                pair,
                takeProfit,
                stopLoss,
                limitPrice,
                limitDistance,
                maxUSDTperTrade,
                trailingStopLoss

            } = readApiCredentials();
            takeProfit = parseFloat(takeProfit);
            stopLoss = parseFloat(stopLoss)
            limitPrice = parseFloat(limitPrice)
            limitDistance = parseFloat(limitDistance)
            maxUSDTperTrade = parseFloat(maxUSDTperTrade)
            let apiEndPoint = PUBLIC_API_URL + "/g-orders/create";
            const clOrdID = cryptoRandomString({ length: 40 })
            const symbol = pair;
            const reduceOnly = false;
            const closeOnTrigger = false;
            const currentPrice = parseFloat(await getCurrentPrice(pair));
            const orderQtyRq = maxUSDTperTrade / currentPrice;
            const ordType = orderType === 1 ? 'Market' : 'Limit'
            let priceRp = req.body === 'LONG' ?
                currentPrice - (currentPrice * limitPrice / 100) :
                currentPrice + (currentPrice * limitPrice / 100);
            priceRp = orderType !== 1 ? priceRp : null;
            let side = req.body === 'LONG' ? 'Buy' : 'Sell';
            const posSide = req.body === 'LONG' ? 'Long' : 'Short';
            const timeInForce = orderType === 1 ? 'ImmediateOrCancel' : 'GoodTillCancel';
            let takeProfitRp = req.body === 'LONG' ?
                (orderType === 1 ? (currentPrice + (currentPrice * takeProfit / 100)) : (priceRp + (priceRp * takeProfit / 100))) :
                (orderType === 1 ? (currentPrice - (currentPrice * takeProfit / 100)) : (priceRp - (priceRp * takeProfit / 100)));
            let stopLossRp = req.body === 'LONG' ?
                (orderType === 1 ? (currentPrice - (currentPrice * stopLoss / 100)) : (priceRp - (priceRp * stopLoss / 100))) :
                (orderType === 1 ? (currentPrice + (currentPrice * stopLoss / 100)) : (priceRp + (priceRp * stopLoss / 100)));
            priceRp = orderType === 3 ?
                (
                    req.body === 'LONG' ?
                        priceRp - (priceRp * limitDistance / 100) :
                        priceRp + (priceRp * limitDistance / 100)
                ) :
                priceRp;
            takeProfitRp = orderType === 3 ?
                (
                    req.body === 'LONG' ?
                        (priceRp + (priceRp * takeProfit / 100)) :
                        (priceRp - (priceRp * takeProfit / 100))
                ) :
                takeProfitRp;
            stopLossRp = orderType === 3 ?
                (
                    req.body === 'LONG' ?
                        (priceRp - (priceRp * stopLoss / 100)) :
                        (priceRp + (priceRp * stopLoss / 100))
                ) :
                stopLossRp;
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
            const data = await axios.put(apiEndPoint, null, {
                headers: {
                    'x-phemex-access-token': apiKey,
                    'x-phemex-request-expiry': currentUnixEpochTime,
                    'x-phemex-request-signature': signature
                }
            })
            await placeTrailingSl(pair, orderQtyRq, posSide);
            console.log(data.data);
            if (data.data && data.data.code == 0) {
                io.emit("NewSignal", [req.body, data.data.data, pair]);
                await runEveryMinute();

            }
        }
    }




})

app.get('/trades-today', async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unixTimestamp = Math.floor(today.getTime());
    let {
        apiKey,
        apiSecret,
        pair
    } = readApiCredentials();
    const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
    let api = PUBLIC_API_URL + `/api-data/g-futures/trades?symbol=${pair}&start=${unixTimestamp}&limit=200`

    const sigdata = `/api-data/g-futures/tradessymbol=${pair}&start=${unixTimestamp}&limit=200` + currentUnixEpochTime;
    const signature = CryptoJS.HmacSHA256(sigdata, apiSecret).toString();
    const data = await axios.get(api, {
        headers: {
            'x-phemex-access-token': apiKey,
            'x-phemex-request-expiry': currentUnixEpochTime,
            'x-phemex-request-signature': signature
        }
    });
    res.json(data.data.data.rows);

})

app.get('/orders-today', async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unixTimestamp = Math.floor(today.getTime());
    let {
        apiKey,
        apiSecret,
        pair
    } = readApiCredentials();
    let api = PUBLIC_API_URL + `/api-data/g-futures/orders?symbol=${pair}&start=${unixTimestamp}&limit=200`
    const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
    const sigdata = `/api-data/g-futures/orderssymbol=${pair}&start=${unixTimestamp}&limit=200` + currentUnixEpochTime;
    const signature = CryptoJS.HmacSHA256(sigdata, apiSecret).toString();
    const data = await axios.get(api, {
        headers: {
            'x-phemex-access-token': apiKey,
            'x-phemex-request-expiry': currentUnixEpochTime,
            'x-phemex-request-signature': signature
        }
    });
    res.json(data.data);

})

app.get('/pnl-today', async (req, res) => {
    const { sidee, posSidee } = await getLastTradeDirection();
    const response = await axios.get('http://localhost:8080/trades-today');
    let pnl = 0;
    let amt = 0;

    response.data.forEach((trade) => {
        if (trade.side === 'Sell') {
            pnl = pnl + parseFloat(trade.closedPnlRv);

        }
        amt = amt + parseFloat(trade.execFeeRv);
    })

    if (sidee === 'Buy') {
        const recentTrade = response.data[0];
        const price = parseFloat(recentTrade.execPriceRp)
        const currentPrice = parseFloat(await getCurrentPrice(recentTrade.symbol))
        const qty = parseFloat(recentTrade.execValueRv);
        const percentChange = ((currentPrice - price) * 100) / price
        if (posSidee === 'Long') {
            pnl = pnl + (qty * percentChange / 100)

        } else {
            pnl = pnl - (qty * percentChange / 100)
        }
    }

    res.json({ "pnl": pnl - amt });




})

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
