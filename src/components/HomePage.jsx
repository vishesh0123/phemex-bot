import { Box } from '@mui/material'
import React, { useState } from 'react'
import KeyInput from './KeyInput'
import PairsMenu from './PairsMenu'
import SwitchMode from './SwitchMode'
import TradingMode from './TradingMode'
import PlaceOrderSpot from './PlaceOrderSpot'

function HomePage({ ml, mt }) {
    const [apiKey, setApiKey] = useState('')
    const [testMode, setTestMode] = useState(false)
    const [tradingType, setTradingType] = useState(1)
    const [pairs, setPairs] = useState({})
    const [selectedPair, setSelectedPair] = useState('')

    return (
        <Box sx={{
            width: '600px',
            height: '680px',
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
            <Box width='550px' display='flex' justifyContent='space-between' alignItems='center'>
                <KeyInput setApiKey={setApiKey} />
                <SwitchMode setTestMode={setTestMode} />
            </Box>

            <Box width='550px' display='flex' justifyContent='space-between' alignItems='center'>
                <TradingMode tradingType={tradingType} setTradingType={setTradingType} />
                <PairsMenu
                    testMode={testMode}
                    tradingType={tradingType}
                    apiKey={apiKey}
                    pairs={pairs}
                    setPairs={setPairs}
                    selectedPair={selectedPair}
                    setSelectedPair={setSelectedPair}
                />
            </Box>


            <PlaceOrderSpot pairs={pairs} selectedPair={selectedPair} testMode={testMode} apiKey={apiKey} />

        </Box>
    )
}

export default HomePage