import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import React from 'react'

function OrderTypeToggle({ orderSubType, setOrderSubType }) {
    const togglesx = {
        color: 'white',
        border: '1px solid white',
        '&.Mui-selected, &.Mui-selected:hover': {
            color: 'white',
            fontWeight: 'bolder',
            border: '1px solid white',
            fontSize:'1.1rem'

        },
        width: '140px',
        height: '30px'
    }
    return (
        <ToggleButtonGroup
            exclusive
            sx={{
                '& .MuiToggleButtonGroup-grouped': {
                    border: '1px solid white',
                },
                marginTop: '2px',
                marginLeft: '20px'
            }}
            value={orderSubType}
            onChange={(event, value) => { if (value !== null) { setOrderSubType(value) } }}
        >
            <ToggleButton value='Limit' sx={togglesx}>Limit</ToggleButton>
            <ToggleButton value='Market' sx={togglesx}>Market</ToggleButton>
            <ToggleButton value='Conditional' sx={togglesx}>Conditional</ToggleButton>

        </ToggleButtonGroup>
    )
}

export default OrderTypeToggle