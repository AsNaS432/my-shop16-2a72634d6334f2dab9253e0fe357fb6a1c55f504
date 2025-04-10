import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const AIChatPopup = ({ open, onClose }) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);

  const [serviceAvailable, setServiceAvailable] = useState(false);

  useEffect(() => {
    if (open) {
      checkServiceStatus();
    }
  }, [open]);

  const checkServiceStatus = async () => {
    try {
      const statusResponse = await fetch('http://localhost:5000/api/ai/status', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error('Status check failed');
      }
      
      const statusData = await statusResponse.json();
      const isAvailable = statusData.status === 'online';
      setServiceAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('Status check error:', error);
      setServiceAvailable(false);
      return false;
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    
    // Add user message to conversation
    const userMessage = { sender: 'user', text: message };
    setConversation([...conversation, userMessage]);
    setMessage('');
    
    try {
      const isAvailable = await checkServiceStatus();
      if (!isAvailable) {
        throw new Error('AI service is currently unavailable');
      }

      // Call your AI API endpoint (using full URL to server)
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          message,
          conversation: conversation.slice(-6) // Keep last 6 messages for context
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'AI service error');
      }
      setConversation(prev => [...prev, {
        sender: 'ai',
        text: data.reply || data.message?.content || 'Не удалось получить ответ от ИИ'
      }]);
    } catch (error) {
      console.error('AI Error:', error);
      let errorMessage = 'Произошла ошибка при обработке запроса';
      if (error.message.includes('service') || error.message.includes('Ollama')) {
        errorMessage = 'Сервис ИИ временно недоступен. Попробуйте позже.';
      } else if (error.response?.data?.solution) {
        errorMessage = `${error.response.data.error}. ${error.response.data.solution}`;
      }
      setConversation(prev => [...prev, {
        sender: 'ai',
        text: errorMessage
      }]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        AI Помощник
        <Typography variant="caption" display="block" color={serviceAvailable ? 'success.main' : 'error.main'}>
          {serviceAvailable ? 'Сервис доступен' : 'Сервис недоступен'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ height: 300, overflowY: 'auto', mb: 2 }}>
          {conversation.map((msg, index) => (
            <Box key={index} sx={{ 
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              mb: 1
            }}>
              <Typography variant="body1" sx={{
                display: 'inline-block',
                p: 1,
                borderRadius: 1,
                bgcolor: msg.sender === 'user' ? 'primary.light' : 'grey.200',
                color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary'
              }}>
                {msg.text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Задайте вопрос..."
          />
          <Button 
            variant="contained" 
            onClick={handleSend}
            endIcon={<SendIcon />}
          >
            Отправить
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatPopup;
