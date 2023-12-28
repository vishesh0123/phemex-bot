import { Box } from '@mui/material'
import React, { useState } from 'react'
import KeyInput from './KeyInput'
import PairsMenu from './PairsMenu'
import SwitchMode from './SwitchMode'
import TradingMode from './TradingMode'

function HomePage({ ml, mt }) {
    const [apiKey, setApiKey] = useState('')
    const [testMode, setTestMode] = useState(false)
    const [tradingType, setTradingType] = useState(1)

    return (
        <Box sx={{
            width: '600px',
            height: '650px',
            border: '5px solid white',
            marginLeft: ml,
            marginTop: mt,
            position: 'fixed',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexDirection: 'column'
        }}
        >
            <SwitchMode setTestMode={setTestMode} />
            <KeyInput setApiKey={setApiKey} />
            <PairsMenu testMode={testMode} tradingType={tradingType} apiKey={apiKey} />
            <TradingMode tradingType={tradingType} setTradingType={setTradingType} />

        </Box>
    )
}

export default HomePage