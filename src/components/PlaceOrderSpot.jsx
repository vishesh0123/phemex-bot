import { Box } from '@mui/material'
import React, { useState } from 'react'
import BuySellToggleButton from './BuySellToggleButton'
import OrderTypeToggle from './OrderTypeToggle'
import AmountTextField from './AmountTextField'
import BuySellButton from './BuySellButton'

function PlaceOrderSpot() {
    const [orderType, setOrderType] = useState('buy')
    const [orderSubType, setOrderSubType] = useState('market')
    return (
        <Box
            width='550px'
            border='1px solid white'
            height='400px'
            display='flex'
            flexDirection='column'

        >
            <BuySellToggleButton orderType={orderType} setOrderType={setOrderType} />
            <OrderTypeToggle orderSubType={orderSubType} setOrderSubType={setOrderSubType} />
            {orderSubType === 'limit' && (<AmountTextField />)}
            {orderSubType === 'market' && (<AmountTextField />)}
            {orderSubType === 'conditional' && (<AmountTextField />)}

            <BuySellButton />

        </Box>
    )
}

export default PlaceOrderSpot