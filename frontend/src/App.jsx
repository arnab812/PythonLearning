import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Grid, Paper, Divider, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from './components/Sidebar';
import MessageBox from './components/MessageBox';
import Chatbot from './components/Chatbot';
import Quiz from './components/Quiz';
import { getConfig, sendStreamingChatRequest, getQuiz, API_BASE_URL } from './api/backend';
import QuizIcon from '@mui/icons-material/Quiz';

function App() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [config, setConfig] = useState({
        models: [],
        languages: [],
        chapters: [],
        chapterTopics: {},
        topics: [],
        familiarityLevels: [],
        conversationModes: []
    });
    const [selectedChapter, setSelectedChapter] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedFamiliarityLevel, setSelectedFamiliarityLevel] = useState('');
    const [selectedConversationMode, setSelectedConversationMode] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('idle'); // 'idle', 'sending', 'generating'
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
    const [responseTime, setResponseTime] = useState(null);
    const [apiKey, setApiKey] = useState(localStorage.getItem('geminiApiKey') || '');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await getConfig();
                setConfig(data);

                // Set default chapter
                const defaultChapter = data.chapters && data.chapters.length > 0
                    ? data.chapters[0]
                    : 'Select Chapter';
                setSelectedChapter(defaultChapter);

                // Set default topic based on selected chapter
                const topicsForChapter = defaultChapter && data.chapterTopics
                    ? data.chapterTopics[defaultChapter] || []
                    : [];
                const defaultTopic = topicsForChapter.length > 0
                    ? topicsForChapter[0]
                    : (data.topics && data.topics.length > 0 ? data.topics[0] : '');
                setSelectedTopic(defaultTopic);

                // Set other defaults
                setSelectedLanguage(data.languages[0]);
                setSelectedModel(data.models[0]);
                setSelectedFamiliarityLevel(data.familiarityLevels[0]);
                setSelectedConversationMode(data.conversationModes[0]);
            } catch (error) {
                console.error('Failed to fetch config:', error);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);

    // Save API key to localStorage when it changes
    useEffect(() => {
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
        }
    }, [apiKey]);

    const handleSubmit = async () => {
        if (isLoading) return;

        const userMessageContent = message.trim() ||
            // `Topic: ${selectedTopic} in ${selectedLanguage} based on ${selectedFamiliarityLevel} familiarity level using ${selectedModel} model in ${selectedConversationMode} mode`;
            `Topic: ${selectedTopic}, based on familiarity level: ${selectedFamiliarityLevel}`;
        const userMessage = { type: 'user', content: userMessageContent };
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);
        setLoadingStage('sending');
        setCurrentStreamingMessage('');
        setResponseTime(null);

        const startTime = performance.now();

        try {
            if (!apiKey) {
                throw new Error("Please enter your Google Gemini API key in the settings panel.");
            }

            const fullResponse = await sendStreamingChatRequest(
                selectedTopic,
                selectedLanguage,
                selectedModel,
                message,
                selectedFamiliarityLevel,
                selectedConversationMode,
                (chunk) => {
                    setLoadingStage('generating');
                    setCurrentStreamingMessage(prev => prev + chunk);
                },
                apiKey
            );

            const endTime = performance.now();
            const timeInSeconds = ((endTime - startTime) / 1000).toFixed(2);
            setResponseTime(timeInSeconds);

            const botMessage = {
                type: 'bot',
                content: fullResponse,
                responseTime: timeInSeconds
            };
            setMessages(prev => [...prev, botMessage]);
            setCurrentStreamingMessage('');
        } catch (error) {
            console.error('Error in chat request:', error);
            const errorMessage = { type: 'bot', content: 'Sorry, there was an error processing your request.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setLoadingStage('idle');
        }
    };

    const handleGenerateQuiz = async () => {
        if (isLoadingQuiz) return;

        setIsLoadingQuiz(true);
        setShowQuiz(false);

        try {
            if (!apiKey) {
                throw new Error("Please enter your Google Gemini API key in the settings panel.");
            }

            const quizData = await getQuiz(
                selectedTopic,
                selectedLanguage,
                selectedModel,
                selectedFamiliarityLevel,
                apiKey
            );

            setQuizQuestions(quizData.questions);
            setShowQuiz(true);
        } catch (error) {
            console.error('Failed to generate quiz:', error);
            // Show error message to user
            const errorMessage = {
                type: 'bot',
                content: 'Sorry, there was an error generating the quiz. Please try again later.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ height: '100vh', py: 3 }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                gap: 2
            }}>
                <img
                    src="python_logo.jpeg"
                    alt="Python Logo"
                    style={{
                        height: '40px',
                        width: 'auto',
                        marginBottom: '4px' // Small adjustment to align with text
                    }}
                />
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        margin: 0,
                        lineHeight: 1.2
                    }}
                >
                    Python Learning Assistant
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ height: 'calc(100% - 100px)' }}>
                {/* Sidebar */}
                {sidebarOpen && (
                    <Grid item xs={12} md={3} sx={{
                        height: '100%',
                        position: 'sticky',
                        top: 0,
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#888',
                            borderRadius: '4px',
                            '&:hover': {
                                background: '#555',
                            },
                        },
                    }}>
                        <Sidebar
                            config={config}
                            selectedChapter={selectedChapter}
                            setSelectedChapter={setSelectedChapter}
                            selectedTopic={selectedTopic}
                            setSelectedTopic={setSelectedTopic}
                            selectedLanguage={selectedLanguage}
                            setSelectedLanguage={setSelectedLanguage}
                            selectedModel={selectedModel}
                            setSelectedModel={setSelectedModel}
                            selectedFamiliarityLevel={selectedFamiliarityLevel}
                            setSelectedFamiliarityLevel={setSelectedFamiliarityLevel}
                            selectedConversationMode={selectedConversationMode}
                            setSelectedConversationMode={setSelectedConversationMode}
                            apiKey={apiKey}
                            setApiKey={setApiKey}
                        />
                    </Grid>
                )}

                {/* Main Content */}
                <Grid item xs={12} md={sidebarOpen ? 9 : 12} sx={{
                    height: '100%',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#888',
                        borderRadius: '4px',
                        '&:hover': {
                            background: '#555',
                        },
                    },
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Toggle sidebar button (mobile only) */}
                        {(
                            <Button
                                variant="outlined"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                sx={{ mb: 2, alignSelf: 'flex-start' }}
                            >
                                {sidebarOpen ? '<' : '>'}
                            </Button>
                        )}

                        {/* Quiz button */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleGenerateQuiz}
                                disabled={isLoadingQuiz}
                                startIcon={<QuizIcon />}
                            >
                                {isLoadingQuiz ? 'Generating Quiz...' : ''}
                            </Button>
                        </Box>

                        {/* Quiz section */}
                        {showQuiz && quizQuestions.length > 0 && (
                            <Quiz
                                questions={quizQuestions}
                                onClose={() => setShowQuiz(false)}
                            />
                        )}

                        {/* Chat section */}
                        <Chatbot
                            messages={messages}
                            streamingMessage={currentStreamingMessage}
                            responseTime={responseTime}
                        />

                        {/* Message input */}
                        <MessageBox
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onSubmit={handleSubmit}
                            disabled={isLoading}
                            loadingStage={loadingStage}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

export default App;