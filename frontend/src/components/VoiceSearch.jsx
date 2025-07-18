import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const VoiceContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
`;

const VoiceButton = styled.button`
  padding: 15px;
  border: none;
  border-radius: 50%;
  background: ${props => props.isListening ? '#ff4757' : '#667eea'};
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
  
  ${props => props.isListening && `
    animation: pulse 1.5s infinite;
  `}
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(255, 71, 87, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); }
  }
`;

const StatusText = styled.div`
  color: white;
  font-size: 14px;
  text-align: center;
  min-height: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TranscriptDisplay = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 15px;
  margin-top: 15px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: ${props => props.isEmpty ? 'italic' : 'normal'};
  opacity: ${props => props.isEmpty ? 0.7 : 1};
`;

function VoiceSearch({ onResult }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [status, setStatus] = useState('Click microphone to start voice search');

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setStatus('Listening... Speak now');
        setTranscript('');
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          setStatus('Processing your search...');
          onResult(finalTranscript.trim());
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        if (transcript) {
          setStatus('Voice search completed');
        } else {
          setStatus('No speech detected. Try again.');
        }
      };
      
      recognitionInstance.onerror = (event) => {
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
        
        switch (event.error) {
          case 'no-speech':
            setStatus('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            setStatus('Microphone not accessible. Check permissions.');
            break;
          case 'not-allowed':
            setStatus('Microphone permission denied.');
            break;
          default:
            setStatus('Voice recognition error. Please try again.');
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      setStatus('Voice search not supported in this browser');
    }
  }, [onResult, transcript]);

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <VoiceContainer>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <VoiceButton
            onClick={toggleListening}
            disabled={!isSupported}
            isListening={isListening}
            title={isListening ? 'Stop listening' : 'Start voice search'}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </VoiceButton>
          
          {transcript && (
            <VoiceButton
              onClick={() => speakText(transcript)}
              title="Speak transcript"
              style={{ background: '#2ed573' }}
            >
              <Volume2 size={20} />
            </VoiceButton>
          )}
        </div>
        
        <StatusText>
          {isListening && <div style={{ 
            width: '8px', 
            height: '8px', 
            background: '#ff4757', 
            borderRadius: '50%',
            animation: 'blink 1s infinite'
          }} />}
          {status}
        </StatusText>
        
        <TranscriptDisplay isEmpty={!transcript}>
          {transcript || 'Your speech will appear here...'}
        </TranscriptDisplay>
      </div>
      
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </VoiceContainer>
  );
}

export default VoiceSearch;