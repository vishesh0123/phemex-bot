import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import PairsMenu from './PairsMenu'
import TradingMode from './TradingMode'
import PlaceOrderPerps from './PlaceOrderPerps'
import BotSettingPage from './BotSettingPage'
import axios from 'axios'
import file from '../../settings.json';
import BotConfig from '../../bot.config';
import CryptoJS from 'crypto-js';

function HomePage({ ml, mt }) {
    const [pairs, setPairs] = useState({})
    const [selectedPair, setSelectedPair] = useState('')
    const [pnl, setpnl] = useState(0);
    const [balance, setBalance] = useState('');
    const [usedBalance, setUsedBalance] = useState('');
    const [server, setServer] = useState(true);

    const getPNL = async () => {
        try {
            const data = await axios.get('http://127.0.0.1:8080/pnl-today');
            setpnl(data.data.pnl);
        } catch {
            setServer(false);
        }

    }

    const getUSDTBalance = async () => {
        let apiEndPoint = file.testnet ?
            BotConfig.proxy.testnet.rest + "/g-accounts/positions?currency=USDT" :
            BotConfig.proxy.public.rest + "/g-accounts/positions?currency=USDT";
        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
        const apiKey = file.apiKey;
        const apiSecret = file.apiSecret;

        const sigData = "/g-accounts/positionscurrency=USDT" + currentUnixEpochTime;
        const signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

        const data = await axios.get(apiEndPoint, {
            headers: {
                'x-phemex-access-token': apiKey,
                'x-phemex-request-expiry': currentUnixEpochTime,
                'x-phemex-request-signature': signature
            }
        })
        setBalance(data.data.data.account.accountBalanceRv);
        setUsedBalance(data.data.data.account.totalUsedBalanceRv);
    }

    useEffect(() => {
        getPNL();
        getUSDTBalance();
        const intervalId = setInterval(getPNL, 10000);
        return () => clearInterval(intervalId);

    }, []);

    return (
        <>
            <Box sx={{
                width: `${(window.innerWidth * (1 / 3))}px`,
                // height: `${window.innerHeight - 20}px`,
                // marginLeft: ml,
                marginTop: mt,
                pr:'30px',
                position: 'fixed',
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'start',
                flexDirection: 'column',
                overflowY: 'auto',
            }}
            >
                {/* <Box sx={{ height: '50px' }}>
                    <Typography
                        sx=
                        {{
                            'fontSize': '20px',
                            'color': parseFloat(pnl) > 0 ? 'green' : 'red',
                            fontWeight: 'bold'
                        }}
                    >PNL : {pnl.toString().slice(0, 6) + ` USDT`}</Typography>
                    <Typography sx={{ 'fontWeight': 'bold' , color:'black' }}>USDT : {balance} &nbsp; USED : {usedBalance}</Typography>
                    <Typography sx={{ 'fontWeight': 'bold', color: server ? 'green' : 'red' }}>SERVER STATUS: {server ? 'Live' : 'Not Working'}  &nbsp;</Typography>


                </Box> */}
                {/* <Box width='450px' display='flex' justifyContent='space-between' alignItems='center'> */}
                    <BotSettingPage />
                {/* </Box> */}

                {/* <Box width='450px' display='flex' justifyContent='space-between' alignItems='center'>
                    <TradingMode />
                    <PairsMenu
                        pairs={pairs}
                        setPairs={setPairs}
                        selectedPair={selectedPair}
                        setSelectedPair={setSelectedPair}
                    />
                </Box> */}


                {/* {<PlaceOrderPerps pairs={pairs} selectedPair={selectedPair} />} */}
                

            </Box>
        </>
    )
}

export default HomePage