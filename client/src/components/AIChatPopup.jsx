import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Button, 
  Box, 
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import DOMPurify from 'dompurify';

const AIChatPopup = ({ open, onClose }) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [serviceAvailable, setServiceAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Загрузка истории при открытии
  useEffect(() => {
    if (open) {
      checkServiceStatus();
      loadConversationHistory();
    }
  }, [open]);

  // Автоскролл к новым сообщениям
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const loadConversationHistory = () => {
    const savedHistory = localStorage.getItem('aiChatHistory');
    if (savedHistory) {
      setConversation(JSON.parse(savedHistory));
    }
  };

  const saveConversation = () => {
    if (conversation.length > 0) {
      localStorage.setItem('aiChatHistory', JSON.stringify(conversation));
    }
  };

  const checkServiceStatus = async () => {
    try {
      const statusResponse = await fetch('http://localhost:5000/api/ai/status');
      const statusData = await statusResponse.json();
      setServiceAvailable(statusData.status === 'online');
      return statusData.status === 'online';
    } catch (error) {
      console.error('Status check error:', error);
      setServiceAvailable(false);
      return false;
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = { sender: 'user', text: message };
    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);
    setMessage('');
    setIsLoading(true);
    
    try {
      const isAvailable = await checkServiceStatus();
      if (!isAvailable) {
        throw new Error('AI service is currently unavailable');
      }

      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ 
          message,
          conversation: updatedConversation.slice(-6)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'AI service error');
      }

      const data = await response.json();
      setConversation(prev => [...prev, {
        sender: 'ai',
        text: data.reply || data.message?.content || 'Не удалось получить ответ'
      }]);
    } catch (error) {
      console.error('AI Error:', error);
      setConversation(prev => [...prev, {
        sender: 'ai',
        text: error.message.includes('unavailable') 
          ? 'Сервис временно недоступен. Попробуйте позже.' 
          : 'Произошла ошибка при обработке запроса'
      }]);
    } finally {
      setIsLoading(false);
      saveConversation();
    }
  };

  const clearHistory = () => {
    setConversation([]);
    localStorage.removeItem('aiChatHistory');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { height: '70vh' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          AI Помощник
          <Typography variant="caption" display="block" color={serviceAvailable ? 'success.main' : 'error.main'}>
            {serviceAvailable ? 'Сервис доступен' : 'Сервис недоступен'}
          </Typography>
        </Box>
        <Box>
          <Button size="small" onClick={clearHistory} sx={{ mr: 1 }}>
            Очистить
          </Button>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {conversation.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              Задайте ваш первый вопрос
            </Typography>
          ) : (
            conversation.map((msg, index) => (
              <Box key={index} sx={{ mb: 2, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                  {msg.sender === 'user' ? 'Вы' : 'AI Помощник'}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                    boxShadow: 1,
                    maxWidth: '80%',
                    wordBreak: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }}
                />
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Введите сообщение..."
              disabled={isLoading}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatPopup;
