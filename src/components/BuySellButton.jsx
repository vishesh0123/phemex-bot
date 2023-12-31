import { Button } from '@mui/material'
import React from 'react'
import BotConfig from '../../bot.config'
import axios from 'axios'
import CryptoJS from 'crypto-js';

function BuySellButton({ orderType, orderSubType, slSubType, orderInfo, testMode, pairs, selectedPair, apiKey }) {
    const placeOrder = async () => {
        const symbol = pairs[selectedPair].symbol;
        const side = orderType === 'buy' ? 'Buy' : 'Sell';
        const qtyType = orderType === 'buy' ? 'ByQuote' : 'ByBase';
        const quoteQtyEv = orderInfo.Amount * (10 ** 8);
        const baseQtyEv = orderInfo.Amount * (10 ** 8);
        const priceEp = orderInfo.Price * (10 ** pairs[selectedPair].priceScale);
        const stopPxEp = orderInfo.Trigger * (10 ** pairs[selectedPair].priceScale);
        const trigger = "ByLastPrice";
        const ordType = "Market";
        let apiEndPoint = testMode ?
            BotConfig.proxy.testnet.rest + "/spot/orders/create" :
            BotConfig.proxy.public.rest + "/spot/orders/create";

        apiEndPoint = apiEndPoint + `?symbol=${symbol}&side=${side}&qtyType=${qtyType}&quoteQtyEv=${quoteQtyEv}&ordType=${ordType}`

        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 120;
        const sigData = '/spot/orders/create' + `symbol=${symbol}&side=${side}&qtyType=${qtyType}&quoteQtyEv=${quoteQtyEv}&ordType=${ordType}` + currentUnixEpochTime;
        const apiSecret = '_O0ETjZOTVBSNGZ3ena2ZTW078bGrd8L36zEn8BHhiMxMzFhMjNiMy02ODFhLTQwOTgtYTNjMi1hNjIyZjc1OTAxODg'
        const signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();
        console.log(apiEndPoint);
        console.log(sigData);
        console.log(signature);


        const data = await axios.put(apiEndPoint, null, {
            headers: {
                'x-phemex-access-token': apiKey,
                'x-phemex-request-expiry': currentUnixEpochTime,
                'x-phemex-request-signature': signature
            }
        })
        console.log(data);

    }
    return (
        <Button sx={{
            color: 'white',
            border: '1px solid white',
            fontSize: '0.8rem',
            width: '400px',
            ml: '20px',
            mt: '20px',
            bgcolor: orderType === 'buy' ? 'green' : 'red'
        }}
            onClick={async () => { await placeOrder() }}
        >
            {orderType.toUpperCase()}
        </Button>
    )
}

export default BuySellButton