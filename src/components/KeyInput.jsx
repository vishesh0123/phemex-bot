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
                        color: 'black' // This will make the label text white
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
                    width: `${(window.innerWidth * (1 / 3)) - 100}px`,
                    mt: 3,
                    ml: '20px',
                    '& .MuiOutlinedInput-root': {
                        height: '40px',
                        color: 'black', // Text color
                        fontWeight:'bold',
                        '& fieldset': {
                            borderColor: 'black', // Border color
                            borderWidth:'2px'
                        },
                        '&:hover fieldset': {
                            borderColor: 'black', // Border color (hover state)
                            borderWidth:'2px'
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'black', // Border color (focused state)
                            borderWidth:'2px'
                        },
                    },
                    '& .MuiTypography-root': {
                        color: 'black',
                        fontWeight:'bold',
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