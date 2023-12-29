import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import React from 'react'

function BuySellToggleButton({ orderType, setOrderType }) {
    const togglesx = {
        color: 'white',
        border: '1px solid white',
        '&.Mui-selected, &.Mui-selected:hover': {
            color: 'white',
            bgcolor: orderType == 'buy' ? 'green' : 'red',
            fontWeight:'bold'
            
        },
        width:'200px',
        height:'30px'
    }
    return (
        <ToggleButtonGroup
            exclusive
            sx={{
                '& .MuiToggleButtonGroup-grouped': {
                    border: '1px solid white',
                },
                margin: '20px',
            }}
            value={orderType}
            onChange={(event, value) => { if (value !== null) { setOrderType(value) } }}
        >
            <ToggleButton value='buy' sx={togglesx}>Buy</ToggleButton>
            <ToggleButton value='sell' sx={togglesx}>Sell</ToggleButton>
        </ToggleButtonGroup>
    )
}

export default BuySellToggleButton