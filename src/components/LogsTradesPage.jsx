import { Box } from '@mui/material'
import React, { useEffect } from 'react'
import { io } from 'socket.io-client'
import BotConfig from '../../bot.config'
import axios from 'axios'
import file from '../../settings.json'
import CryptoJS from 'crypto-js';

function LogsTradesPage() {
    const getTxInfo = async (symbol, id, clOrdID) => {
        const api = BotConfig.proxy.public.rest + `/api-data/g-futures/orders/by-order-id?symbol=${symbol}&orderID=${id}&clOrdID=${clOrdID}`
        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
        const sigdata = `/api-data/g-futures/orders/by-order-idsymbol=${symbol}&orderID=${id}&clOrdID=${clOrdID}` + currentUnixEpochTime;
        const signature = CryptoJS.HmacSHA256(sigdata, file.apiSecret).toString();
        const data = await axios.get(api, {
            headers: {
                'x-phemex-access-token': file.apiKey,
                'x-phemex-request-expiry': currentUnixEpochTime,
                'x-phemex-request-signature': signature
            }
        })
        console.log(data);
    }

    useEffect(() => {
        const socket = io('http://127.0.0.1:8080')

        socket.on('NewSignal', async (args) => {
            console.log("Signal Received");
            console.log(args);
            await getTxInfo(args[2], args[1].orderID, args[1].clOrdID)
        })

    })
    return (
        <Box display='flex'
            flexDirection='column'
            ml='640px'
            mt='15px'
            width='610px'
            height='690px'
            position='fixed'
        >
        </Box>
    )
}

export default LogsTradesPage