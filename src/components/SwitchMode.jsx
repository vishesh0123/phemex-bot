import { FormControlLabel, FormGroup, Switch } from '@mui/material'
import React from 'react'

function SwitchMode({ setTestMode }) {
    return (
        <FormGroup>
            <FormControlLabel
                control={<Switch
                    onChange={(event) => { setTestMode(event.target.checked) }}
                />}
                label='Testnet'
            >

            </FormControlLabel>
        </FormGroup>
    )
}

export default SwitchMode