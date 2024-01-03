import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useEffect, useState } from 'react'
import LoadPairs from './LoadPairs';

function PairsMenu({ testMode, tradingType, pairs, setPairs, selectedPair, setSelectedPair }) {
    useEffect(() => {
        setSelectedPair('')
        setPairs({})

    }, [tradingType])
    return (
        <>
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
                    fontWeight:'bold'
                },
                '& .MuiSvgIcon-root': { // Dropdown icon color
                    color: 'white'
                }
            }}>
                <InputLabel id='pairs' sx={{ color: 'white !important' , fontWeight:'bold' }}>Pair</InputLabel>
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
                        if (tradingType == 4 && pairs[key].status === 'Listed') {
                            return <MenuItem key={key} value={key}>{pairs[key].symbol}</MenuItem>
                        }

                        if ((tradingType == 1 || tradingType == 2) && pairs[key].status === 'Listed' && pairs[key].type === 'Spot') {
                            return <MenuItem key={key} value={key}>{pairs[key].displaySymbol}</MenuItem>

                        }
                    })}
                </Select>
            </FormControl>
            <LoadPairs
                testMode={testMode}
                tradingType={tradingType}
                setPairs={setPairs}
            />
        </>

    )
}

export default PairsMenu