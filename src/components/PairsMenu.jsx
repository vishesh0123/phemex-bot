import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useEffect, useState } from 'react'
import LoadPairs from './LoadPairs';

function PairsMenu({ pairs, setPairs, selectedPair, setSelectedPair }) {

    return (
        <>
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
                    fontWeight: 'bold'
                },
                '& .MuiSvgIcon-root': { // Dropdown icon color
                    color: 'white'
                }
            }}>
                <InputLabel id='pairs' sx={{ color: 'white !important', fontWeight: 'bold' }}>Pair</InputLabel>
                <Select
                    labelId='pairs'
                    label='Pairs'
                    sx={{
                        '& .MuiSelect-icon': {
                            color: 'white', // Dropdown icon color
                        },
                    }}
                    value={selectedPair}
                    onChange={(event) => { setSelectedPair(event.target.value) }}
                >
                    {!(Object.keys(pairs).length == 0) && Object.keys(pairs).map((key) => {
                        if (pairs[key].status === 'Listed') {
                            return <MenuItem key={key} value={key}>{pairs[key].symbol}</MenuItem>
                        }
                    })}
                </Select>
            </FormControl>
            <LoadPairs
                setPairs={setPairs}
            />
        </>

    )
}

export default PairsMenu