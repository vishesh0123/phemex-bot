import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useState } from 'react'

function TradingMode({ tradingType, setTradingType }) {
    return (
        <FormControl sx={{
            width: '200px',
            color: 'white', // Default color
            '& .MuiInputLabel-root': { // Label styles
                color: 'white', // Label color
            },
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
            '& .MuiSelect-select': {
                color: 'white', // Select text color
            },
            '& .MuiSvgIcon-root': { // Dropdown icon color
                color: 'white'
            }
        }}>
            <InputLabel id='tradingtype' sx={{ color: 'white !important' }}>Trading Type</InputLabel>
            <Select
                labelId='tradingtype'
                label='Trading Type'
                sx={{
                    '& .MuiSelect-icon': {
                        color: 'white', // Dropdown icon color
                    },
                }}
                value={tradingType}
                onChange={(event) => { setTradingType(Number(event.target.value)) }}
            >
                {/* <MenuItem value={1} >Spot Market</MenuItem> */}
                <MenuItem value={4}>USD$-M Perpetual (Hedged Contracts)</MenuItem>

            </Select>
        </FormControl>

    )
}

export default TradingMode