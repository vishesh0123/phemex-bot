import { Box } from '@mui/material'
import React, { useEffect } from 'react'
import { io } from 'socket.io-client'

function LogsTradesPage() {
    useEffect(() => {
        const socket = io('http://127.0.0.1:8080')

        socket.on('NewSignal', (args) => {
            console.log(args);
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