import { Box } from '@mui/material'
import React, { useEffect } from 'react'
import io from 'socket.io-client';

function RecentTrades() {
  const SERVER_URL = 'http://localhost:8080';

  useEffect(() => {
    const newSocket = io(SERVER_URL);

    newSocket.on('phemex',(arg)=> {
      console.log(arg);
    })
  }, []);

  return (
    <Box border='5px solid purple'
      height='450px'
    >

    </Box>
  )
}

export default RecentTrades