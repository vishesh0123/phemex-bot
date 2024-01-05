import { Box } from '@mui/material'
import React from 'react'
import RecentTrades from './RecentTrades'
import Logs from './Logs'

function LogsTradesPage() {
    return (
        <Box display='flex'
            flexDirection='column'
            ml='640px'
            mt='15px'
            width='610px'
            height='690px'
            position='fixed'
        >
            <RecentTrades />
            <Logs />
        </Box>
    )
}

export default LogsTradesPage