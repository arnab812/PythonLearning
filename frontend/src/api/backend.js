import axios from 'axios';

export const API_BASE_URL = 'http://3.111.34.252:8000/api';

export const getConfig = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/config`);
        return response.data;
    } catch (error) {
        console.error('Error fetching config:', error);
        throw error;
    }
};

export const sendChatRequest = async (topic, language, model, query, familiarityLevel, conversationMode, apiKey) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/chat`, {
            topic,
            language,
            model,
            query,
            familiarity_level: familiarityLevel,
            conversation_mode: conversationMode,
            api_key: apiKey
        });
        return response.data;
    } catch (error) {
        console.error('Error sending chat request:', error);
        throw error;
    }
};

export const getQuiz = async (topic, language, model, familiarityLevel, apiKey) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/quiz`, {
            topic,
            language,
            model,
            query: "", // Not used for quiz generation but required by the API
            familiarity_level: familiarityLevel,
            conversation_mode: "Informative", // Default mode for quiz
            api_key: apiKey
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching quiz:', error);
        throw error;
    }
};

export const sendStreamingChatRequest = async (topic, language, model, query, familiarityLevel, conversationMode, onChunk, apiKey) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/chat`, {
            topic,
            language,
            model,
            query,
            familiarity_level: familiarityLevel,
            conversation_mode: conversationMode,
            api_key: apiKey
        });

        // Simulate streaming by sending chunks of the response
        const fullResponse = response.data.response;
        const chunkSize = 5; // Number of characters per chunk
        let currentIndex = 0;

        while (currentIndex < fullResponse.length) {
            const chunk = fullResponse.slice(currentIndex, currentIndex + chunkSize);
            onChunk(chunk);
            currentIndex += chunkSize;
            // Add a small delay between chunks to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        return fullResponse;
    } catch (error) {
        console.error('Error in chat request:', error);
        throw error;
    }
};

export const sendMessage = async (topic, language, model, query, familiarityLevel, conversationMode, apiKey) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/chat`, {
            topic,
            language,
            model,
            query,
            familiarity_level: familiarityLevel,
            conversation_mode: conversationMode,
            api_key: apiKey
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export const checkApiKeyQuota = async (apiKey) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/check-quota`, {
            api_key: apiKey
        });
        return response.data;
    } catch (error) {
        console.error('Error checking API key quota:', error);
        throw error;
    }
};
