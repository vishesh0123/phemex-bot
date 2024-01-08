import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useState } from 'react'

function TradingMode() {
    return (
        <FormControl sx={{
            width: '150px',
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
                value={4}
            >
                <MenuItem value={4}>USD$-M Perpetual (Hedged Contracts)</MenuItem>

            </Select>
        </FormControl>

    )
}

export default TradingMode