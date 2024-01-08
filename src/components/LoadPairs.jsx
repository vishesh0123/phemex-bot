import { Button } from '@mui/material'
import React from 'react'
import BotConfig from '../../bot.config'
import axios from 'axios'
import file from '../../settings.json';

function LoadPairs({ setPairs }) {

  const loadPairs = async () => {
    const apiEndPoint = file.testnet ?
      BotConfig.proxy.testnet.rest + "/public/products" :
      BotConfig.proxy.public.rest + "/public/products";

    const data = await axios.get(apiEndPoint)

    setPairs(data.data.data.perpProductsV2)

  }



  return (
    <Button sx={{
      color: 'white',
      border: '1px solid white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      ml: '10px'
    }}
      onClick={async () => { await loadPairs() }}
    >
      Load Pairs
    </Button>
  )
}

export default LoadPairs