import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Button,
    Alert,
    Divider,
    Collapse,
    IconButton,
    Pagination
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const QUESTIONS_PER_PAGE = 5;

const Quiz = ({ questions = [], onClose }) => {
    // Check if questions is valid and not empty
    const hasValidQuestions = Array.isArray(questions) && questions.length > 0;

    const [answers, setAnswers] = useState(hasValidQuestions ? Array(questions.length).fill(null) : []);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [expandedQuestions, setExpandedQuestions] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    // Only calculate pagination if we have valid questions
    const totalPages = hasValidQuestions ? Math.ceil(questions.length / QUESTIONS_PER_PAGE) : 0;
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    const currentQuestions = hasValidQuestions ? questions.slice(startIndex, endIndex) : [];

    const handleAnswerChange = (questionIndex, value) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = parseInt(value);
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        let correctCount = 0;
        questions.forEach((question, index) => {
            if (answers[index] === question.correct_answer) {
                correctCount++;
            }
        });

        setScore(correctCount);
        setSubmitted(true);
    };

    const handleTryAgain = () => {
        setAnswers(Array(questions.length).fill(null));
        setSubmitted(false);
        setExpandedQuestions({});
        setCurrentPage(1);
    };

    const toggleExplanation = (questionIndex) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [questionIndex]: !prev[questionIndex]
        }));
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                mb: 3,
                maxWidth: '100%',
                backgroundColor: '#f8f9fa'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Test Your Knowledge
                </Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={onClose}
                >
                    Close Quiz
                </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Display error message if no valid questions */}
            {!hasValidQuestions && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    <Typography variant="body1">
                        Unable to generate quiz questions.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Please try again with a different topic or check your API key settings.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={onClose}
                        sx={{ mt: 2 }}
                    >
                        Close Quiz
                    </Button>
                </Alert>
            )}

            {hasValidQuestions && submitted && (
                <Alert
                    severity={score === questions.length ? "success" : score > 0 ? "info" : "warning"}
                    sx={{ mb: 3 }}
                >
                    <Typography variant="body1">
                        You scored {score} out of {questions.length}!
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        {score === questions.length ?
                            "Excellent work! You've mastered all the concepts." :
                            score > questions.length * 0.7 ?
                            "Good job! You're on the right track." :
                            "Keep practicing! You'll improve with more study."}
                    </Typography>
                </Alert>
            )}

            {hasValidQuestions && currentQuestions.map((question, localIndex) => {
                const questionIndex = startIndex + localIndex;
                return (
                    <Box
                        key={questionIndex}
                        sx={{
                            mb: 4,
                            p: 2,
                            borderRadius: 1,
                            backgroundColor: submitted ?
                                (answers[questionIndex] === question.correct_answer ? '#e8f5e9' : '#ffebee') :
                                'white'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Question {questionIndex + 1}:
                        </Typography>
                        <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium', mb: 2 }}>
                            {question.question}
                        </Typography>

                        <FormControl component="fieldset" sx={{ width: '100%' }}>
                            <RadioGroup
                                value={answers[questionIndex] !== null ? answers[questionIndex].toString() : ''}
                                onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                            >
                                {question.options.map((option, optionIndex) => (
                                    <FormControlLabel
                                        key={optionIndex}
                                        value={optionIndex.toString()}
                                        control={<Radio />}
                                        label={option}
                                        disabled={submitted}
                                        sx={{
                                            ...(submitted && optionIndex === question.correct_answer && {
                                                '& .MuiFormControlLabel-label': {
                                                    fontWeight: 'bold',
                                                    color: 'success.main'
                                                }
                                            })
                                        }}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>

                        {submitted && (
                            <Box sx={{ mt: 2 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 'medium',
                                        color: answers[questionIndex] === question.correct_answer ?
                                            'success.main' : 'error.main'
                                    }}
                                >
                                    {answers[questionIndex] === question.correct_answer ?
                                        'Correct!' :
                                        `Incorrect. The correct answer is: ${question.options[question.correct_answer]}`}
                                </Typography>

                                {answers[questionIndex] !== question.correct_answer && (
                                    <Box sx={{ mt: 2 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                color: 'primary.main'
                                            }}
                                            onClick={() => toggleExplanation(questionIndex)}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {expandedQuestions[questionIndex] ? 'Hide Explanation' : 'Show Explanation'}
                                            </Typography>
                                            <IconButton size="small">
                                                {expandedQuestions[questionIndex] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </Box>

                                        <Collapse in={expandedQuestions[questionIndex]}>
                                            <Box sx={{ mt: 1, pl: 2 }}>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    <strong>Explanation:</strong> {question.explanation}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    <strong>Areas for Improvement:</strong>
                                                </Typography>
                                                <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                                                    {question.improvement_suggestions.map((suggestion, idx) => (
                                                        <li key={idx}>
                                                            <Typography variant="body2">{suggestion}</Typography>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Box>
                                        </Collapse>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                );
            })}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    disabled={submitted}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                {!submitted ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={answers.includes(null)}
                    >
                        Submit Answers
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleTryAgain}
                    >
                        Try Again
                    </Button>
                )}
            </Box>
        </Paper>
    );
};

export default Quiz;
