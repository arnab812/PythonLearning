import { TextField, Button, Box, CircularProgress, Paper} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';

const MessageBox = ({ value, onChange, onSubmit, disabled, loadingStage }) => {

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!disabled) {
                onSubmit();
            }
        }
    };

    const getButtonText = () => {
        switch (loadingStage) {
            case 'sending':
                return 'Sending...';
            case 'generating':
                return 'Generating...';
            default:
                return 'Send';
        }
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{
                y: 0,
                opacity: 1,
                boxShadow: [
                    '0 6px 20px rgba(0, 0, 0, 0.08)',
                    '0 6px 20px rgba(0, 0, 0, 0.12)',
                    '0 6px 20px rgba(0, 0, 0, 0.08)'
                ]
            }}
            transition={{
                duration: 0.4,
                boxShadow: {
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut"
                }
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.15)',
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2.5,
                        alignItems: 'flex-end',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -10,
                            left: 20,
                            right: 20,
                            height: 1,
                            background: 'linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.05), rgba(0,0,0,0))',
                            borderRadius: 4,
                        },
                    }}
                >
                    <motion.div
                        style={{ flex: 1 }}
                        whileHover={{ scale: 1.01 }}
                        whileFocus={{ scale: 1.01 }}
                        initial={{ opacity: 0.95 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={value}
                            onChange={onChange}
                            onKeyDown={handleKeyPress}
                            placeholder='Type your message here along with the learning settings...'
                            disabled={disabled}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-input': {
                                    padding: '14px 16px',
                                    fontWeight: 400,
                                    color: '#333',
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    opacity: 0.7,
                                    fontStyle: 'italic',
                                    fontSize: '0.95rem',
                                },
                            }}
                        />
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                            boxShadow: disabled ?
                                '0 4px 12px rgba(0, 0, 0, 0.15)' :
                                ['0 4px 12px rgba(33, 150, 243, 0.3)', '0 4px 18px rgba(33, 150, 243, 0.4)', '0 4px 12px rgba(33, 150, 243, 0.3)']
                        }}
                        transition={{
                            boxShadow: {
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut"
                            }
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onSubmit}
                            disabled={disabled}
                            sx={{
                                minWidth: 110,
                                height: 56,
                                borderRadius: 3,
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                background: 'linear-gradient(45deg, #1565C0 10%, #1976d2 45%, #2196f3 90%)',
                                boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)',
                                transition: 'all 0.3s',
                                textTransform: 'none',
                                fontSize: '1rem',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    background: 'linear-gradient(45deg, #1565C0 0%, #1976d2 50%, #2196f3 100%)',
                                    boxShadow: '0 6px 12px rgba(33, 150, 243, 0.5)',
                                },
                                '&:active': {
                                    transform: 'translateY(1px)',
                                    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.4)',
                                },
                                '&.Mui-disabled': {
                                    background: 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                                    boxShadow: 'none',
                                },
                            }}
                            endIcon={
                                disabled ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                            sx={{
                                                color: 'white',
                                                opacity: 0.9
                                            }}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        animate={{ x: [0, 2, 0] }}
                                        transition={{
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            duration: 1,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <SendIcon />
                                    </motion.div>
                                )
                            }
                        >
                            {getButtonText()}
                        </Button>
                    </motion.div>
                </Box>
            </Paper>
        </motion.div>
    );
};

export default MessageBox;