import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import {
  Send,
  AttachFile,
  Mic,
  Stop,
  SmartToy,
  Person,
  Lightbulb,
  TrendingUp,
  Description,
  People,
  Search,
} from '@mui/icons-material';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'action';
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your Scent Australia AI Assistant. I can help you with lead generation, document creation, customer insights, and accessing our knowledge base. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { label: 'Generate Quote', icon: <Description />, action: 'generate-quote' },
    { label: 'Find Leads', icon: <People />, action: 'find-leads' },
    { label: 'Market Analysis', icon: <TrendingUp />, action: 'market-analysis' },
    { label: 'Search Knowledge', icon: <Search />, action: 'search-knowledge' },
  ];

  const suggestedQuestions = [
    'What are our top performing products this quarter?',
    'Generate a quote for premium fragrance solutions',
    'Find potential leads in the retail sector',
    'What\'s the latest market trend in fragrances?',
    'Show me customer feedback analysis',
    'Create a proposal template for new clients',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('quote') || input.includes('proposal')) {
      return 'I can help you generate a customized quote. I\'ll need some information about the client and their requirements. Would you like me to create a quote template or do you have specific client details to work with?';
    }
    
    if (input.includes('lead') || input.includes('prospect')) {
      return 'I can help you find potential leads. Based on our current data, I\'ve identified several prospects in the retail and hospitality sectors. Would you like me to show you the top 10 leads with their contact information and company profiles?';
    }
    
    if (input.includes('market') || input.includes('trend')) {
      return 'Current market analysis shows strong growth in premium and sustainable fragrance solutions. The luxury retail sector is particularly active. I can provide detailed market insights and competitor analysis. Would you like a comprehensive report?';
    }
    
    if (input.includes('knowledge') || input.includes('search')) {
      return 'I can search our knowledge base for any information you need. Our database includes product specifications, customer histories, market research, and best practices. What specific information are you looking for?';
    }
    
    return 'I understand you\'re looking for assistance. I can help with lead generation, document creation, market analysis, and knowledge base searches. Could you provide more specific details about what you\'d like to accomplish?';
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'generate-quote':
        message = 'Generate a quote for a new client';
        break;
      case 'find-leads':
        message = 'Find new potential leads in our target market';
        break;
      case 'market-analysis':
        message = 'Provide current market analysis and trends';
        break;
      case 'search-knowledge':
        message = 'Search our knowledge base for product information';
        break;
    }
    setInputMessage(message);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex' }}>
      {/* Sidebar with suggestions and actions */}
      <Box sx={{ width: 300, mr: 2, display: { xs: 'none', md: 'block' } }}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={1}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} key={index}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={action.icon}
                    onClick={() => handleQuickAction(action.action)}
                    sx={{ 
                      height: 60,
                      flexDirection: 'column',
                      gap: 0.5,
                      fontSize: '0.75rem',
                    }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Suggested Questions
            </Typography>
            <List dense>
              {suggestedQuestions.map((question, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  sx={{ 
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': { bgcolor: 'primary.light', color: 'white' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Lightbulb fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={question}
                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Main chat area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat messages */}
        <Paper
          sx={{
            flex: 1,
            p: 2,
            mb: 2,
            overflow: 'auto',
            backgroundColor: 'grey.50',
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                mb: 2,
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {message.sender === 'ai' && (
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <SmartToy />
                </Avatar>
              )}
              
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: message.sender === 'user' ? 'primary.main' : 'white',
                  color: message.sender === 'user' ? 'white' : 'text.primary',
                  boxShadow: 1,
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1,
                    opacity: 0.7,
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>

              {message.sender === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>
                  <Person />
                </Avatar>
              )}
            </Box>
          ))}

          {isTyping && (
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                <SmartToy />
              </Avatar>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'white',
                  boxShadow: 1,
                }}
              >
                <Typography variant="body1">AI is typing...</Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Paper>

        {/* Input area */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask me anything about leads, documents, market insights..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton color="primary" sx={{ p: 1 }}>
              <AttachFile />
            </IconButton>
            <IconButton color="primary" sx={{ p: 1 }}>
              <Mic />
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'grey.300' },
              }}
            >
              <Send />
            </IconButton>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="🎯 Lead Generation"
              size="small"
              onClick={() => handleSuggestedQuestion('Find new potential leads')}
              clickable
            />
            <Chip
              label="📄 Document Creation"
              size="small"
              onClick={() => handleSuggestedQuestion('Generate a quote')}
              clickable
            />
            <Chip
              label="📊 Market Analysis"
              size="small"
              onClick={() => handleSuggestedQuestion('Show market trends')}
              clickable
            />
            <Chip
              label="🔍 Knowledge Search"
              size="small"
              onClick={() => handleSuggestedQuestion('Search product information')}
              clickable
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AIChat;
