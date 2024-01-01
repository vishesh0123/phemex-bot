import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import React from 'react'

function ConditionalOrderTypes({ slSubType, setSlSubType }) {
    const togglesx = {
        color: 'white',
        border: '1px solid white',
        '&.Mui-selected, &.Mui-selected:hover': {
            color: 'white',
            fontWeight: 'bolder',
            border: '1px solid white',
            fontSize: '1.1rem'

        },
        width: '100px',
        height: '15px'
    }
    return (

        < ToggleButtonGroup
            exclusive
            sx={{
                '& .MuiToggleButtonGroup-grouped': {
                    border: '1px solid white',
                },
                marginTop: '20px',
                marginLeft: '20px'
            }}
            value={slSubType}
            onChange={(event) => {setSlSubType(event.target.value)}}
        >
            <ToggleButton value='Limit' sx={togglesx}>Limit</ToggleButton>
            <ToggleButton value='Market' sx={togglesx}>Market</ToggleButton>

        </ToggleButtonGroup >
    )
}

export default ConditionalOrderTypes