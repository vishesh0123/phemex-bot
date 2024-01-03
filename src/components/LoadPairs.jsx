import { Button } from '@mui/material'
import React from 'react'
import BotConfig from '../../bot.config'
import axios from 'axios'
import CryptoJS from 'crypto-js';

function LoadPairs({ testMode, tradingType, setPairs }) {

  const loadPairs = async () => {
    const apiEndPoint = testMode ?
      BotConfig.proxy.testnet.rest + "/public/products" :
      BotConfig.proxy.public.rest + "/public/products";

    const data = await axios.get(apiEndPoint)

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
      fontSize: '0.8rem',
      fontWeight:'bold',
      ml:'10px'
    }}
      onClick={async () => { await loadPairs() }}
    >
      Load Pairs
    </Button>
  )
}

export default LoadPairs