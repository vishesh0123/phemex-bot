import { InputAdornment, TextField } from '@mui/material'
import React from 'react'

function AmountTextField({ displayText, displayToken }) {
    return (
        <TextField
            id="outlined-start-adornment"
            sx={{
                width: '300px',
                mt: 5,
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