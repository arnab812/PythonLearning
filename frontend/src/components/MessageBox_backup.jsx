import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Paper, IconButton, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { motion } from 'framer-motion';

const MessageBox = ({ value, onChange, onSubmit, disabled, loadingStage }) => {
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [micPermission, setMicPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');

    // Reference to store the recognition instance
    const recognitionRef = React.useRef(null);

    // Check if speech recognition is supported and initialize it
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setSpeechSupported(true);

            // Initialize recognition only once
            if (!recognitionRef.current) {
                recognitionRef.current = new SpeechRecognition();
                const recognition = recognitionRef.current;

                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onstart = () => {
                    setIsListening(true);
                };

                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    setInterimTranscript(interimTranscript);
                    if (finalTranscript) {
                        setTranscript(finalTranscript);
                        // We need to use the current value from the component
                        // This will be updated in a separate effect
                        // onChange({ target: { value: value + finalTranscript } });
                        onChange({ target: { value: (value + interimTranscript).replace(interimTranscript, '') + finalTranscript } });
                    }
                };

                recognition.onerror = (event) => {
                    console.error('Speech recognition error', event.error);
                    if (event.error === 'not-allowed') {
                        setMicPermission('denied');
                    }
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                    setInterimTranscript('');
                };
            }
        }
    }, []);

    // Update the onresult handler when value or onChange changes
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setInterimTranscript(interimTranscript);
                if (finalTranscript) {
                    setTranscript(finalTranscript);
                    // onChange({ target: { value: value + finalTranscript } });
                    onChange({ target: { value: (value + interimTranscript).replace(interimTranscript, '') + finalTranscript } });
                }
            };
        }
    }, [value, onChange]);

    // Cleanup: stop speech recognition when component unmounts
    useEffect(() => {
        return () => {
            if (recognitionRef.current && isListening) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening]);

    const toggleListening = async () => {
        if (!speechSupported) {
            alert('Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.');
            return;
        }

        if (!recognitionRef.current) {
            alert('Speech recognition failed to initialize. Please refresh the page and try again.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                // Check for microphone permission
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
                setMicPermission('granted');

                // Start recognition
                recognitionRef.current.start();
            } catch (error) {
                console.error('Error accessing microphone:', error);
                setMicPermission('denied');
                alert('Microphone access is required for speech input.');
            }
        }
    };

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
                            value={isListening ? `${value}${interimTranscript ? interimTranscript : ''}` : value}
                            onChange={onChange}
                            onKeyDown={handleKeyPress}
                            placeholder={isListening ? "Listening... speak now" : "Type or speak your Python question here ... (Press Enter to send)"}
                            disabled={disabled}
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Tooltip title={isListening ? "Stop listening" : "Start voice input"}>
                                            <IconButton
                                                onClick={toggleListening}
                                                disabled={disabled || !speechSupported}
                                                color={isListening ? "error" : "primary"}
                                                sx={{
                                                    mr: 1,
                                                    animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                                    '@keyframes pulse': {
                                                        '0%': {
                                                            boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)'
                                                        },
                                                        '70%': {
                                                            boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)'
                                                        },
                                                        '100%': {
                                                            boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)'
                                                        }
                                                    }
                                                }}
                                            >
                                                {isListening ? (
                                                    <motion.div
                                                        animate={{
                                                            scale: [1, 1.2, 1],
                                                            opacity: [1, 0.8, 1]
                                                        }}
                                                        transition={{
                                                            repeat: Infinity,
                                                            duration: 1.5
                                                        }}
                                                    >
                                                        <MicIcon />
                                                    </motion.div>
                                                ) : (
                                                    <MicOffIcon />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: isListening ? 'rgba(255, 240, 240, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: 2.5,
                                    transition: 'all 0.3s',
                                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)',
                                    '&:hover': {
                                        backgroundColor: isListening ? 'rgba(255, 240, 240, 1)' : 'rgba(255, 255, 255, 1)',
                                        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.05)',
                                        '& fieldset': {
                                            borderColor: isListening ? 'error.main' : 'primary.main',
                                            borderWidth: '1.5px',
                                        },
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: isListening ? 'rgba(255, 240, 240, 1)' : 'white',
                                        boxShadow: isListening
                                            ? 'inset 0 2px 4px rgba(244, 67, 54, 0.08)'
                                            : 'inset 0 2px 4px rgba(25, 118, 210, 0.08)',
                                        '& fieldset': {
                                            borderColor: isListening ? 'error.main' : 'primary.main',
                                            borderWidth: 2,
                                        },
                                    },
                                },
                                '& .MuiOutlinedInput-input': {
                                    padding: '14px 16px',
                                    fontWeight: 400,
                                    color: '#333',
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    opacity: 0.7,
                                    fontStyle: 'italic',
                                    fontSize: '0.95rem',
                                    color: isListening ? 'error.main' : 'inherit',
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