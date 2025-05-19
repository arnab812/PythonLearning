{/*import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress, IconButton, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { sendMessage } from '../api/backend';

const Chat = ({ topic, language, model, familiarityLevel, conversationMode }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await sendMessage(topic, language, model, input, familiarityLevel, conversationMode);
            const botMessage = {
                text: response.response,
                sender: 'bot',
                sections: response.sections
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { text: 'Error: Could not get response', sender: 'error' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSectionClick = async (section) => {
        if (expandedSection === section) {
            setExpandedSection(null);
            return;
        }

        setExpandedSection(section);
        setLoading(true);

        try {
            const prompt = `Regarding the topic "${topic}", please provide detailed information about ${section.replace('_', ' ')}`;
            const response = await sendMessage(topic, language, model, prompt, familiarityLevel, conversationMode);
            
            // Update the last bot message with the section content
            setMessages(prev => {
                const newMessages = [...prev];
                const lastBotMessage = newMessages[newMessages.length - 1];
                if (lastBotMessage.sender === 'bot') {
                    lastBotMessage[section] = response.response;
                }
                return newMessages;
            });
        } catch (error) {
            console.error('Error fetching section content:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ flex: 1, overflow: 'auto', p: 2, mb: 2 }}>
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        sx={{
                            mb: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <Paper
                            sx={{
                                p: 2,
                                maxWidth: '70%',
                                bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                                color: message.sender === 'user' ? 'white' : 'text.primary'
                            }}
                        >
                            <Typography>{message.text}</Typography>
                            
                            {message.sender === 'bot' && message.sections && (
                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                    {Object.keys(message.sections).map((section) => (
                                        <Button
                                            key={section}
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleSectionClick(section)}
                                            endIcon={expandedSection === section ? <ExpandLess /> : <ExpandMore />}
                                        >
                                            {section.replace('_', ' ')}
                                        </Button>
                                    ))}
                                </Box>
                            )}

                            {message.sender === 'bot' && expandedSection && message[expandedSection] && (
                                <Collapse in={expandedSection !== null}>
                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {message[expandedSection]}
                                        </Typography>
                                    </Box>
                                </Collapse>
                            )}
                        </Paper>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Paper>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    disabled={loading}
                />
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Send'}
                </Button>
            </Box>
        </Box>
    );
};

export default Chat; */}