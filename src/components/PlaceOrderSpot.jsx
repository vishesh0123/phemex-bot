import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import BuySellToggleButton from './BuySellToggleButton'
import OrderTypeToggle from './OrderTypeToggle'
import AmountTextField from './AmountTextField'
import BuySellButton from './BuySellButton'
import ConditionalOrderTypes from './ConditionalOrderTypes'

function PlaceOrderSpot({ pairs, selectedPair, testMode, apiKey }) {
    const [orderType, setOrderType] = useState('buy')
    const [orderSubType, setOrderSubType] = useState('market')
    const [slSubType, setSlSubType] = useState('market')
    const [orderInfo, setOrderInfo] = useState({})

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
            {(selectedPair !== '') && orderSubType === 'limit' && (<>
                <AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText='Price' displayToken={orderType === 'buy' ? pairs[selectedPair].quoteCurrency : pairs[selectedPair].baseCurrency} />
                <AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText='Amount' displayToken={orderType === 'buy' ? pairs[selectedPair].quoteCurrency : pairs[selectedPair].baseCurrency} />
            </>)}
            {(selectedPair !== '') && orderSubType === 'market' && (<AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText='Amount' displayToken={orderType === 'buy' ? pairs[selectedPair].quoteCurrency : pairs[selectedPair].baseCurrency} />)}
            {(selectedPair !== '') && orderSubType === 'conditional' && (<>
                <ConditionalOrderTypes slSubType={slSubType} setSlSubType={setSlSubType} />
                <AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText={'Trigger'} displayToken={pairs[selectedPair].quoteCurrency} />
                {slSubType === 'limit' && (<AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText='Price' displayToken={pairs[selectedPair].quoteCurrency} />)}
                <AmountTextField orderInfo={orderInfo} setOrderInfo={setOrderInfo} displayText={orderType === 'buy' ? 'Amount' : 'Size'} displayToken={orderType === 'buy' ? pairs[selectedPair].quoteCurrency : pairs[selectedPair].baseCurrency} />
            </>)}

            <BuySellButton orderType={orderType} orderSubType={orderSubType} slSubType={slSubType} orderInfo={orderInfo} testMode={testMode} pairs={pairs} selectedPair={selectedPair} apiKey={apiKey} />

        </Box>
    )
}

export default PlaceOrderSpot