import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import React from 'react'

function ConditionalOrderTypes() {
    const togglesx = {
        color: 'white',
        border: '1px solid white',
        '&.Mui-selected, &.Mui-selected:hover': {
            color: 'white',
            fontWeight: 'bolder',
            border: '1px solid white',
            fontSize: '1.1rem'

        },
        width: '150px',
        height: '30px'
    }
    return (

        < ToggleButtonGroup
            exclusive
            sx={{
                '& .MuiToggleButtonGroup-grouped': {
                    border: '1px solid white',
                },
                marginTop: '2px',
                marginLeft: '20px'
            }}
        >
            <ToggleButton value='limit' sx={togglesx}>Limit</ToggleButton>
            <ToggleButton value='market' sx={togglesx}>Market</ToggleButton>

        </ToggleButtonGroup >
    )
}

export default ConditionalOrderTypes