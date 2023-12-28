import { Button } from '@mui/material'
import React from 'react'
import BotConfig from '../../bot.config'
import axios from 'axios'
import CryptoJS from 'crypto-js';

function LoadPairs({ testMode, tradingType, apiKey, setPairs }) {

  const loadPairs = async () => {
    const apiEndPoint = testMode ?
      BotConfig.proxy.testnet.rest + "/public/products" :
      BotConfig.proxy.public.rest + "/public/products";

    const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
    const sigData = "/public/products" + currentUnixEpochTime;
    const signature = CryptoJS.HmacSHA256(sigData, apiKey).toString();

    const data = await axios.get(apiEndPoint, {
      headers: {
        'x-phemex-access-token': apiKey,
        'x-phemex-request-expiry': currentUnixEpochTime,
        'x-phemex-request-signature': signature
      }
    })

    if (tradingType == 4) {
      setPairs(data.data.data.perpProductsV2)
    } else {
      setPairs(data.data.data.products)
    }
  }



  return (
    <Button sx={{
      color: 'white',
      border: '1px solid white',
      fontSize: '0.8rem'
    }}
      onClick={async () => { await loadPairs() }}
    >
      Load Pairs
    </Button>
  )
}

export default LoadPairs