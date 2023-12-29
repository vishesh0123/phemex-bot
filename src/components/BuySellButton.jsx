import { Button } from '@mui/material'
import React from 'react'

function BuySellButton() {
    return (
        <Button sx={{
            color: 'white',
            border: '1px solid white',
            fontSize: '0.8rem',
            width: '400px',
            ml:'20px',
            mt:'20px',
            bgcolor:'green'
        }}
        >
            BUY
        </Button>
    )
}

export default BuySellButton