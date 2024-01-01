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

function PlaceOrderPerps({ pairs, selectedPair, testMode }) {
    const [orderType, setOrderType] = useState('Buy')
    const [orderSubType, setOrderSubType] = useState('Market')
    const [slSubType, setSlSubType] = useState('Market')
    const [orderInfo, setOrderInfo] = useState({})

    const getCurrentPrice = async (symbol) => {
        let apiEndPoint = testMode ?
            BotConfig.proxy.testnet.rest + `/md/v2/ticker/24hr?symbol=${symbol}` :
            BotConfig.proxy.public.rest + `/md/v2/ticker/24hr?symbol=${symbol}`;

        const data = await axios.get(apiEndPoint);
        return data.data.result.markPriceRp;

    }

    const placeOrder = async () => {
        let apiEndPoint = testMode ?
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
        const side = orderType
        const posSide = orderType === 'Buy' ? 'Long' : 'Short'
        let timeInForce = (orderSubType === 'Market' || (orderSubType === 'Conditional' && slSubType === 'Market')) ? 'ImmediateOrCancel' : 'GoodTillCancel'
        apiEndPoint = apiEndPoint + `?clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}`
        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
        const apiKey = 'e9149b6c-2e48-48c9-8799-36a018269104'
        const apiSecret = '_O0ETjZOTVBSNGZ3ena2ZTW078bGrd8L36zEn8BHhiMxMzFhMjNiMy02ODFhLTQwOTgtYTNjMi1hNjIyZjc1OTAxODg'
        const add = testMode ? '/moc' : ''
        let signature;
        if (orderSubType === 'Market') {
            const sigData = add + '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}` + currentUnixEpochTime;
            signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

        } else if (orderSubType === 'Limit') {
            apiEndPoint = apiEndPoint + `&priceRp=${priceRp}`
            const sigData = add + '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}&priceRp=${priceRp}` + currentUnixEpochTime;
            signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

        } else {
            if (slSubType === 'Market') {
                apiEndPoint = apiEndPoint + `&stopPxRp=${stopPxRp}`
                const sigData = add + '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}&stopPxRp=${stopPxRp}` + currentUnixEpochTime;
                signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();
            } else {
                apiEndPoint = apiEndPoint + `&stopPxRp=${stopPxRp}&priceRp=${priceRp}`
                const sigData = add + '/g-orders/create' + `clOrdID=${clOrdID}&symbol=${symbol}&reduceOnly=${reduceOnly}&closeOnTrigger=${closeOnTrigger}&orderQtyRq=${orderQtyRq}&ordType=${ordType}&side=${side}&posSide=${posSide}&timeInForce=${timeInForce}&stopPxRp=${stopPxRp}&priceRp=${priceRp}` + currentUnixEpochTime;
                signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

            }
        }

        console.log(apiEndPoint);
        console.log(signature);
        console.log(timeInForce);
        console.log(orderSubType);
        console.log(stopPxRp);
        console.log(orderInfo);

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
            width='550px'
            border='1px solid white'
            height='480px'
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