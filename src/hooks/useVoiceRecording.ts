// Add SpeechRecognition interface at the top of the file
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart?: () => void;
  onend?: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface UseVoiceRecordingProps {
  onTranscription: (text: string) => void;
  maxRecordingTime?: number;
}

const useVoiceRecording = ({
  onTranscription,
  maxRecordingTime = 15000 // Default max recording time is 15 seconds
}: UseVoiceRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    setIsRecording(false);
  }, []);

  useEffect(() => {
    // Try to get the appropriate SpeechRecognition constructor
    const SpeechRecognitionAPI = 
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    console.log('Checking browser compatibility...');
    
    // Check if running in a secure context
    if (!window.isSecureContext) {
      console.error('Speech Recognition requires a secure context (HTTPS or localhost)');
      toast.error('Speech Recognition requires HTTPS. Please use a secure connection.');
      return;
    }

    // Check if the browser supports the required APIs
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Browser does not support media devices');
      toast.error('Your browser does not support audio input. Please try Chrome or Edge.');
      return;
    }

    if (!SpeechRecognitionAPI) {
      console.error('Speech Recognition API not available');
      toast.error('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      
      recognition.continuous = false; // Changed to false to handle one utterance at a time
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        toast.success('Listening...');
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
      };
      
      recognition.onresult = (event) => {
        console.log('Speech recognition result:', event.results);
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
          
        if (event.results[0].isFinal) {
          console.log('Final transcript:', transcript);
          setIsProcessing(true);
          onTranscription(transcript);
          setIsProcessing(false);
          stopRecording();
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', {
          error: event.error,
          message: event.message,
          type: event.type
        });
        
        let errorMessage = 'Error with speech recognition. ';
        switch (event.error) {
          case 'network':
            errorMessage += 'Network error occurred.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone access denied.';
            break;
          case 'no-speech':
            errorMessage += 'No speech detected.';
            break;
          default:
            errorMessage += 'Please try again.';
        }
        
        toast.error(errorMessage);
        setIsProcessing(false);
        stopRecording();
      };
      
      recognitionRef.current = recognition;
      console.log('Speech recognition initialized successfully');
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      toast.error('Failed to initialize speech recognition. Please try using Chrome or Edge.');
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition on cleanup:', error);
        }
      }
    };
  }, [onTranscription, stopRecording]);

  const startRecording = useCallback(async () => {
    try {
      if (!recognitionRef.current) {
        throw new Error('Speech recognition not initialized');
      }
      
      console.log('Requesting microphone permission...');
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('Microphone permission granted:', stream.getAudioTracks());
      
      recognitionRef.current.start();
      console.log('Speech recognition started');
      
      // Set timeout to automatically stop recording after maxRecordingTime
      timeoutRef.current = setTimeout(() => {
        if (isRecording) {
          stopRecording();
          toast('Maximum recording time reached');
        }
      }, maxRecordingTime);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof Error) {
        toast.error(`Could not access microphone: ${error.message}`);
      } else {
        toast.error('Could not access microphone. Please check permissions.');
      }
    }
  }, [isRecording, maxRecordingTime, stopRecording]);

  const toggleRecording = useCallback(() => {
    console.log('Toggling recording, current state:', isRecording);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    toggleRecording,
    startRecording,
    stopRecording
  };
};

// Add type declaration for WebkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
    mozSpeechRecognition?: new () => SpeechRecognition;
    msSpeechRecognition?: new () => SpeechRecognition;
  }
}

export default useVoiceRecording;
