import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const Selector = ({ label, value, options = [], onChange, fullWidth = false }) => {
    // Ensure options is an array
    const safeOptions = Array.isArray(options) ? options : [];

    return (
        <Box sx={{ minWidth: fullWidth ? '100%' : 200, m: fullWidth ? 0 : 1 }}>
            <FormControl fullWidth>
                <InputLabel>{label}</InputLabel>
                <Select
                    value={value}
                    label={label}
                    onChange={onChange}
                    size={fullWidth ? "small" : "medium"}
                    disabled={safeOptions.length === 0}
                >
                    {safeOptions.length === 0 ? (
                        <MenuItem value="">
                            <em>No options available</em>
                        </MenuItem>
                    ) : (
                        safeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>
        </Box>
    );
};

export default Selector;