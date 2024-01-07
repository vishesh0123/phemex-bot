import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import KeyInput from './KeyInput'
import PairsMenu from './PairsMenu'
import SwitchMode from './SwitchMode'
import TradingMode from './TradingMode'
import PlaceOrderPerps from './PlaceOrderPerps'
import BotSettingPage from './BotSettingPage'
import axios from 'axios'

function HomePage({ ml, mt }) {
    const [tradingType, setTradingType] = useState(4)
    const [pairs, setPairs] = useState({})
    const [selectedPair, setSelectedPair] = useState('')
    const [pnl, setpnl] = useState(0);

    const getPNL = async () => {
        const data = await axios.get('http://127.0.0.1:8080/pnl-today');
        setpnl(data.data.pnl);

    }

    useEffect(() => {
        getPNL();
        const intervalId = setInterval(getPNL, 10000);
        return () => clearInterval(intervalId);

    }, []);

    return (
        <>
            <Box sx={{
                width: '500px',
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
                <Box width='450px' display='flex' justifyContent='space-between' alignItems='center'>
                    <BotSettingPage />
                </Box>

                <Box width='450px' display='flex' justifyContent='space-between' alignItems='center'>
                    <TradingMode tradingType={tradingType} setTradingType={setTradingType} />
                    <PairsMenu
                        tradingType={tradingType}
                        pairs={pairs}
                        setPairs={setPairs}
                        selectedPair={selectedPair}
                        setSelectedPair={setSelectedPair}
                    />
                </Box>


                {<PlaceOrderPerps pairs={pairs} selectedPair={selectedPair} />}
                <Box sx={{ height: '50px' }}>
                    <Typography
                        sx=
                        {{
                            'fontSize': '40px',
                            'color': parseFloat(pnl) > 0 ? 'green' : 'red'
                        }}
                    >PNL : {pnl.toString().slice(0, 6) + ` USDT`}</Typography>

                </Box>

            </Box>
        </>
    )
}

export default HomePage