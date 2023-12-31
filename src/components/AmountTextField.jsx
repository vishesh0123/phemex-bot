import { InputAdornment, TextField } from '@mui/material'
import React from 'react'

function AmountTextField({ orderInfo, setOrderInfo, displayText, displayToken }) {

    const handleInput = (event) => {
        setOrderInfo({ ...orderInfo, [displayText]: parseFloat(event.target.value) })
    }
    return (
        <TextField
            id="outlined-start-adornment"
            sx={{
                width: '300px',
                mt: 3,
                ml: '20px',
                '& .MuiOutlinedInput-root': {
                    height: '40px',
                    color: 'white', // Text color
                    '& fieldset': {
                        borderColor: 'white', // Border color
                    },
                    '&:hover fieldset': {
                        borderColor: 'white', // Border color (hover state)
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'white', // Border color (focused state)
                    },
                },
                '& .MuiTypography-root': {
                    color: 'white'
                }

            }}
            onChange={(event) => { handleInput(event) }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start" >
                        {displayText}
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end" >
                        {displayToken}
                    </InputAdornment>
                ),
            }}
        />
    )
}

export default AmountTextField