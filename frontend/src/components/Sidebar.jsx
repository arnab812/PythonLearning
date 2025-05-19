import React, { useMemo, useState} from 'react';
import { Box, Typography, Divider, Paper, TextField, InputAdornment, IconButton, Tooltip} from '@mui/material';
import Selector from './Selector';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
// import DataUsageIcon from '@mui/icons-material/DataUsage';
// import { checkApiKeyQuota } from '../api/backend';

const Sidebar = ({
    config,
    selectedChapter,
    setSelectedChapter,
    selectedTopic,
    setSelectedTopic,
    selectedLanguage,
    setSelectedLanguage,
    selectedModel,
    setSelectedModel,
    selectedFamiliarityLevel,
    setSelectedFamiliarityLevel,
    selectedConversationMode,
    setSelectedConversationMode,
    apiKey,
    setApiKey
}) => {
    const [showApiKey, setShowApiKey] = useState(false);
    // Get topics for the selected chapter
    const topicsForSelectedChapter = useMemo(() => {
        if (!selectedChapter || !config.chapterTopics) return [];
        return config.chapterTopics[selectedChapter] || [];
    }, [selectedChapter, config.chapterTopics]);
    return (
        <Paper
            elevation={2}
            sx={{
                width: '250px',
                height: '100%',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
        >
            <Typography variant="h6" gutterBottom>
                Learning Settings
            </Typography>

            <Divider />

            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Python Chapter
                </Typography>
                <Selector
                    label="Chapter"
                    value={selectedChapter}
                    options={config.chapters || []}
                    onChange={(e) => {
                        const newChapter = e.target.value;
                        setSelectedChapter(newChapter);

                        // When chapter changes, update the topic to the first topic in that chapter
                        if (config.chapterTopics && config.chapterTopics[newChapter] && config.chapterTopics[newChapter].length > 0) {
                            setSelectedTopic(config.chapterTopics[newChapter][0]);
                        } else {
                            setSelectedTopic('');
                        }
                    }}
                    fullWidth
                />
            </Box>

            <Box>
                <Typography variant="subtitle2" gutterBottom>
                    Python Topic
                </Typography>
                <Selector
                    label="Topic"
                    value={selectedTopic}
                    options={topicsForSelectedChapter}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    fullWidth
                />
            </Box>


            <Box>
                <Typography variant="subtitle2" gutterBottom>
                    Your Familiarity
                </Typography>
                <Selector
                    label="Familiarity Level"
                    value={selectedFamiliarityLevel}
                    options={config.familiarityLevels || []}
                    onChange={(e) => setSelectedFamiliarityLevel(e.target.value)}
                    fullWidth
                />
            </Box>

            <Box>
                <Typography variant="subtitle2" gutterBottom>
                    Learning Mode
                </Typography>
                <Selector
                    label="Conversation Mode"
                    value={selectedConversationMode}
                    options={config.conversationModes || []}
                    onChange={(e) => setSelectedConversationMode(e.target.value)}
                    fullWidth
                />
            </Box>

            <Box>
                <Typography variant="subtitle2" gutterBottom>
                    Language
                </Typography>
                <Selector
                    label="Language"
                    value={selectedLanguage}
                    options={config.languages || []}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    fullWidth
                />
            </Box>

            <Box>
                <Typography variant="subtitle2" gutterBottom>
                    AI Model
                </Typography>
                <Selector
                    label="Model"
                    value={selectedModel}
                    options={config.models || []}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    fullWidth
                />
            </Box>

            <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <a href='https://aistudio.google.com' target='_blank' rel='noreferrer'>Google Gemini API Key</a>
                    <Tooltip title="Enter your Google Gemini API key to use the AI features. You can get a free API key from Google AI Studio.">
                        <IconButton size="small" sx={{ ml: 0.5 }}>
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Enter your Gemini API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    type={showApiKey ? 'text' : 'password'}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle api key visibility"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    edge="end"
                                >
                                    {showApiKey ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Your API key is used only for your session and is not stored on our servers.
                </Typography>

                {/* Quota Information Display */}
                {/* {apiKey && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                <DataUsageIcon fontSize="small" sx={{ mr: 0.5 }} />
                                API Quota Usage
                                {quotaInfo.loading && (
                                    <CircularProgress size={12} sx={{ ml: 1 }} />
                                )}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    const fetchQuotaInfo = async () => {
                                        setQuotaInfo(prev => ({ ...prev, loading: true, error: null }));
                                        try {
                                            const quotaData = await checkApiKeyQuota(apiKey);
                                            setQuotaInfo({
                                                loading: false,
                                                used: quotaData.used,
                                                limit: quotaData.limit,
                                                error: null,
                                                lastChecked: new Date()
                                            });
                                        } catch (error) {
                                            setQuotaInfo(prev => ({
                                                ...prev,
                                                loading: false,
                                                error: "Could not fetch quota information",
                                                lastChecked: new Date()
                                            }));
                                        }
                                    };
                                    fetchQuotaInfo();
                                }}
                                disabled={quotaInfo.loading}
                            >
                                <Tooltip title="Refresh quota information (doesn't use tokens)">
                                    <InfoIcon fontSize="small" />
                                </Tooltip>
                            </IconButton>
                        </Box>

                        {quotaInfo.error ? (
                            <Chip
                                label="Quota info unavailable"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                            />
                        ) : quotaInfo.limit > 0 ? (
                            <>
                                <LinearProgress
                                    variant="determinate"
                                    value={(quotaInfo.used / quotaInfo.limit) * 100}
                                    sx={{ height: 8, borderRadius: 1 }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                    <Typography variant="caption">
                                        {quotaInfo.used.toLocaleString()} / {quotaInfo.limit.toLocaleString()} tokens
                                    </Typography>
                                    <Typography variant="caption">
                                        {Math.round((quotaInfo.used / quotaInfo.limit) * 100)}%
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                    Tokens are counted based on actual usage in your session.
                                    Checking quota doesn't consume additional tokens.
                                </Typography>
                                {quotaInfo.lastChecked && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        Last updated: {quotaInfo.lastChecked.toLocaleTimeString()}
                                    </Typography>
                                )}
                            </>
                        ) : (
                            <Chip
                                label="Enter API key to see quota"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                            />
                        )}
                    </Box>
                )}
                    */}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Select your preferences to customize your learning experience.
            </Typography>
        </Paper>
    );
};

export default Sidebar;
