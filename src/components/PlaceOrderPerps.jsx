import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import BuySellToggleButton from './BuySellToggleButton'
import OrderTypeToggle from './OrderTypeToggle'
import AmountTextField from './AmountTextField'
import BotConfig from '../../bot.config'
import ConditionalOrderTypes from './ConditionalOrderTypes'
import cryptoRandomString from 'crypto-random-string'
import axios from 'axios'
import CryptoJS from 'crypto-js';
import file from '../../settings.json';

function PlaceOrderPerps({ pairs, selectedPair }) {
    const [orderType, setOrderType] = useState('Buy')
    const [orderSubType, setOrderSubType] = useState('Market')
    const [slSubType, setSlSubType] = useState('Market')
    const [orderInfo, setOrderInfo] = useState({})

    const getCurrentPrice = async (symbol) => {
        let apiEndPoint = file.testnet ?
            BotConfig.proxy.testnet.rest + `/md/v2/ticker/24hr?symbol=${symbol}` :
            BotConfig.proxy.public.rest + `/md/v2/ticker/24hr?symbol=${symbol}`;

        const data = await axios.get(apiEndPoint);
        return data.data.result.markPriceRp;

    }

    const placeOrder = async () => {
        let apiEndPoint = file.testnet ?
            BotConfig.proxy.testnet.rest + "/g-orders/create" :
            BotConfig.proxy.public.rest + "/g-orders/create";
        const clOrdID = cryptoRandomString({ length: 40 })
        const symbol = pairs[selectedPair].symbol
        const reduceOnly = false
        const closeOnTrigger = false
        const orderQtyRq = orderInfo.Qty
        let ordType = orderSubType
        const stopPxRp = orderInfo['Trigger Price']
        if (orderSubType === 'Conditional') {
            let cp = await getCurrentPrice(pairs[selectedPair].symbol)
            if (orderType === 'Buy') {
                if (slSubType === 'Market') {
                    ordType = stopPxRp > cp ? 'Stop' : 'MarketIfTouched'

                } else {
                    ordType = stopPxRp > cp ? 'StopLimit' : 'LimitIfTouched'

                }

            } else {
                if (slSubType === 'Market') {
                    ordType = stopPxRp < cp ? 'Stop' : 'MarketIfTouched'

                } else {
                    ordType = stopPxRp < cp ? 'StopLimit' : 'LimitIfTouched'
                }

            }

        }
        const priceRp = orderInfo['Limit Price']
        const side = orderType === 'Buy' ? 'Buy' : 'Sell';
        const posSide = orderType === 'Buy' ? 'Long' : 'Short'
        let timeInForce = (orderSubType === 'Market' || (orderSubType === 'Conditional' && slSubType === 'Market')) ? 'ImmediateOrCancel' : 'GoodTillCancel'
        apiEndPoint = apiEndPoint + `?clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}`
        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
        const apiKey = file.apiKey;
        const apiSecret = file.apiSecret;
        let signature;
        if (orderSubType === 'Market') {
            const sigData = '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}` + currentUnixEpochTime;
            signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

        } else if (orderSubType === 'Limit') {
            apiEndPoint = apiEndPoint + `&priceRp=${priceRp}`
            const sigData = '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}&priceRp=${priceRp}` + currentUnixEpochTime;
            signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

        } else {
            if (slSubType === 'Market') {
                apiEndPoint = apiEndPoint + `&stopPxRp=${stopPxRp}&triggerType=ByLastPrice`
                const sigData = '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}&stopPxRp=${stopPxRp}&triggerType=ByLastPrice` + currentUnixEpochTime;
                signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();
            } else {
                apiEndPoint = apiEndPoint + `&stopPxRp=${stopPxRp}&priceRp=${priceRp}&triggerType=ByLastPrice`
                const sigData = '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}&stopPxRp=${stopPxRp}&priceRp=${priceRp}&triggerType=ByLastPrice` + currentUnixEpochTime;
                signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

            }
        }
        console.log(apiEndPoint);

        const data = await axios.put(apiEndPoint, null, {
            headers: {
                'x-phemex-access-token': apiKey,
                'x-phemex-request-expiry': currentUnixEpochTime,
                'x-phemex-request-signature': signature
            }
        })
        console.log(data);

    }

    useEffect(() => {
        setOrderInfo({})
    }, [orderType, orderSubType, slSubType])

    return (

        <Box
            width='450px'
            border='1px solid white'
            height='280px'
            display='flex'
            flexDirection='column'

        >
            <BuySellToggleButton orderType={orderType} setOrderType={setOrderType} />
            <OrderTypeToggle orderSubType={orderSubType} setOrderSubType={setOrderSubType} />
            {(selectedPair !== '') && orderSubType === 'Limit' && (<>
                <AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText='Limit Price' displayToken={pairs[selectedPair].quoteCurrency} />
                <AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText='Qty' displayToken={pairs[selectedPair].baseCurrency} />
            </>)}
            {(selectedPair !== '') && orderSubType === 'Market' && (<AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText='Qty' displayToken={pairs[selectedPair].baseCurrency} />)}
            {(selectedPair !== '') && orderSubType === 'Conditional' && (<>
                <ConditionalOrderTypes slSubType={slSubType} setSlSubType={setSlSubType} />
                <AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText={'Trigger Price'} displayToken={pairs[selectedPair].quoteCurrency} />
                {slSubType === 'Limit' && (<AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText='Limit Price' displayToken={pairs[selectedPair].quoteCurrency} />)}
                <AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText='Qty' displayToken={pairs[selectedPair].baseCurrency} />
            </>)}

            <Button sx={{
                color: 'white',
                border: '1px solid white',
                fontSize: '0.8rem',
                width: '400px',
                ml: '20px',
                mt: '20px',
                bgcolor: orderType === 'Buy' ? 'green' : 'red'
            }}
                onClick={async () => { await placeOrder() }}
            >
                {orderType.toUpperCase()}
            </Button>

        </Box>
    )
}

export default PlaceOrderPerps