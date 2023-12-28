import React from 'react'
import { TextField } from '@mui/material';

function KeyInput({ setApiKey }) {
    return (
        <>
            <TextField
                id='outlined-required'
                label='Api Key'
                InputLabelProps={{
                    color: 'secondary',
                    sx: {
                        fontWeight: 'bold',
                        color: 'white' // This will make the label text white
                    }
                }}
                color='secondary'
                sx={{
                    width: '250px',
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'white', // Default border color
                        },
                        '&:hover fieldset': {
                            borderColor: 'white', // Hover border color
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'white', // Focused border color
                        },
                        '& input': {
                            color: 'white', // Input text color
                        },
                    },
                    '& .MuiInputLabel-root': { // Label color
                        color: 'white'
                    },
                    '& .MuiInputLabel-root.Mui-focused': { // Label color when the input is focused
                        color: 'white'
                    }
                }}
                type='password'
                onChange={(event) => { setApiKey(event.target.value) }}
            />


        </>
    )
}

export default KeyInput