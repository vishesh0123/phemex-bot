import React, { useState } from 'react'
import { InputAdornment, TextField } from '@mui/material';

function KeyInput({ text, type, setting, saveSetting, value }) {
    const [editable, setEditable] = useState(false)
    const [input, setInput] = useState('')
    return (
        <>
            <TextField
                id='outlined-required'
                // label={text}
                InputLabelProps={{
                    color: 'secondary',
                    sx: {
                        fontWeight: 'bold',
                        color: 'white' // This will make the label text white
                    }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start" >
                            {text}
                        </InputAdornment>
                    ),
                }}
                // color='secondary'
                sx={{
                    width: '400px',
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
                type={type}
                onChange={(event) => { saveSetting({ ...setting, [text]: event.target.value }); setInput(event.target.value) }}
                value={editable ? input : value}
                onClick={() => { setInput(value); setEditable(true) }}



            />


        </>
    )
}

export default KeyInput