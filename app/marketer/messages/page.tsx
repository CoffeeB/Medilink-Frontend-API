"use client";

import axiosInstance from "@/lib/axios";
import { usersList } from "@/hooks/messages";
import React, { useState, useRef, useEffect } from "react";
import { 
  Search, Phone, Video, Smile, Paperclip, Send, Check, CheckCheck, 
  PhoneMissed, ListFilter, Camera, Mic, MessageSquareDot, Pen, Users, 
  FileText, ImagePlay, Plus, PhoneCall, PhoneOff, VideoOff, MicOff,
  X, ArrowLeft, MoreVertical, Download, Play, Pause
} from "lucide-react";
import ContactModal from "@/components/ContactModal";

// Placeholder data
const contacts = [
  {
    id: 1,
    name: "Daniel Kalio",
    lastMessage: "Hey, how are you doing today?",
    timestamp: "2:30 PM",
    unread: 0,
    avatar: "/placeholder.svg?height=40&width=40",
    online: true,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    lastMessage: "Can we schedule a meeting for tomorrow?",
    timestamp: "1:45 PM",
    unread: 3,
    avatar: "/placeholder.svg?height=40&width=40",
    online: false,
  },
  {
    id: 3,
    name: "Tech Team",
    lastMessage: "The deployment was successful 🚀",
    timestamp: "12:30 PM",
    unread: 107,
    avatar: "/placeholder.svg?height=40&width=40",
    online: false,
    isGroup: true,
  },
  {
    id: 4,
    name: "Mom",
    lastMessage: "Don't forget to call me tonight",
    timestamp: "11:20 AM",
    unread: 0,
    avatar: "/placeholder.svg?height=40&width=40",
    online: false,
  },
  {
    id: 5,
    name: "Project Alpha",
    lastMessage: "📹 Missed video call",
    timestamp: "10:15 AM",
    unread: 103,
    avatar: "/placeholder.svg?height=40&width=40",
    online: false,
    isGroup: true,
  },
  {
    id: 6,
    name: "John Smith",
    lastMessage: "Thanks for the help earlier!",
    timestamp: "Yesterday",
    unread: 0,
    avatar: "/placeholder.svg?height=40&width=40",
    online: false,
  },
];

const initialMessages = [
  {
    id: 1,
    text: "Hey! How's your day going?",
    timestamp: "2:25 PM",
    sent: false,
    delivered: true,
    read: true,
    type: "text"
  },
  {
    id: 2,
    text: "Pretty good! Just finished the project presentation. How about you?",
    timestamp: "2:26 PM",
    sent: true,
    delivered: true,
    read: true,
    type: "text"
  },
  {
    id: 3,
    text: "That's awesome! I'm sure it went well 😊",
    timestamp: "2:27 PM",
    sent: false,
    delivered: true,
    read: true,
    type: "text"
  },
  {
    id: 4,
    text: "Thanks! Want to grab coffee later?",
    timestamp: "2:28 PM",
    sent: true,
    delivered: true,
    read: true,
    type: "text"
  },
  {
    id: 5,
    text: "Missed voice call",
    timestamp: "2:29 PM",
    sent: false,
    delivered: true,
    read: false,
    isMissedCall: true,
    type: "call"
  },
  {
    id: 6,
    text: "Sorry, was in a meeting. Let me call you back in 5 minutes",
    timestamp: "2:30 PM",
    sent: true,
    delivered: true,
    read: false,
    type: "text"
  },
];

// Simple emoji data
const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'];

export default function ChatDashboard() {
  // State management
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudioURL, setRecordedAudioURL] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [listError, setListError] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Call states
  const [callState, setCallState] = useState('idle'); // idle, audio-calling, audio-connected, video-calling, video-connected
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Responsive handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const filteredContacts = contacts.filter((contact) => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = messages.filter((message) =>
    chatSearchQuery === "" || 
    message.text.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  // Call functions
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
  };

  const startAudioCall = async () => {
    try {
      setCallState('audio-calling');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      
      // Simulate call connection
      setTimeout(() => {
        setCallState('audio-connected');
        startCallTimer();
      }, 2000);
    } catch (error) {
      console.error('Audio call error:', error);
      alert('Could not access microphone');
      setCallState('idle');
    }
  };

  const startVideoCall = async () => {
    try {
      setCallState('video-calling');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Simulate call connection
      setTimeout(() => {
        setCallState('video-connected');
        startCallTimer();
      }, 2000);
    } catch (error) {
      console.error('Video call error:', error);
      alert('Could not access camera/microphone');
      setCallState('idle');
    }
  };

  const endCall = () => {
    setCallState('idle');
    stopCallTimer();
    setIsMuted(false);
    setIsVideoOff(false);
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Message handling
  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text || sending) return;

    setSending(true);
    
    const newMessage = {
      id: messages.length + 1,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      delivered: true,
      read: false,
      type: "text"
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");
    setSending(false);
  };

  // File handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileMessage = {
        id: messages.length + 1,
        text: `📎 ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        delivered: true,
        read: false,
        type: "file",
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size
      };
      setMessages(prev => [...prev, fileMessage]);
    }
    setShowAttachmentOptions(false);
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageMessage = {
        id: messages.length + 1,
        text: "📷 Photo",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        delivered: true,
        read: false,
        type: "image",
        imageUrl: URL.createObjectURL(file)
      };
      setMessages(prev => [...prev, imageMessage]);
    }
  };

  // Voice recording
  const handleVoiceRecord = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: "audio/webm" });
          const url = URL.createObjectURL(audioBlob);
          setRecordedAudioURL(url);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error("Mic access error:", err);
        alert("Could not access microphone");
      }
    } else {
      mediaRecorder?.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    const getUsersList = async () => {
      try {
        const response = await usersList();

        console.log(response);
      } catch (error) {
        console.log("error getting users", error);
        setListError("Couldn't fetch users. Please Try again");
      }
    };

    getUsersList();
  }, [isModalOpen]);
  
  const sendVoiceNote = () => {
    if (recordedAudioURL) {
      const voiceMessage = {
        id: messages.length + 1,
        text: "🎤 Voice message",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        delivered: true,
        read: false,
        type: "voice",
        audioUrl: recordedAudioURL
      };
      setMessages(prev => [...prev, voiceMessage]);
      setRecordedAudioURL(null);
    }
  };

  // Render call overlay
  const renderCallOverlay = () => {
    if (callState === 'idle') return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center text-white">
        <div className="text-center mb-8">
          <img 
            src={selectedContact.avatar} 
            alt={selectedContact.name}
            className="w-32 h-32 rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold mb-2">{selectedContact.name}</h2>
          <p className="text-lg">
            {callState === 'audio-calling' && 'Calling...'}
            {callState === 'video-calling' && 'Calling...'}
            {callState === 'audio-connected' && `Audio call • ${formatCallDuration(callDuration)}`}
            {callState === 'video-connected' && formatCallDuration(callDuration)}
          </p>
        </div>

        {/* Video display */}
        {(callState === 'video-calling' || callState === 'video-connected') && (
          <div className="relative w-full max-w-md h-64 mb-8">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-full object-cover rounded-lg bg-gray-800"
            />
            <video
              ref={remoteVideoRef}
              autoPlay
              className="absolute top-4 right-4 w-20 h-16 object-cover rounded border-2 border-white bg-gray-700"
            />
          </div>
        )}

        {/* Call controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600'} hover:bg-opacity-80 transition-colors`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {(callState === 'video-calling' || callState === 'video-connected') && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-600'} hover:bg-opacity-80 transition-colors`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {renderCallOverlay()}
      
      {/* Left Sidebar */}
      <div className={`${
        isMobile 
          ? showSidebar ? 'w-full' : 'w-0 overflow-hidden' 
          : 'w-full md:w-1/3 lg:w-1/3'
      } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        
        {/* Profile Section */}
        <div className="p-4 bg-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full transition">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <ContactModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            contacts={contacts}
            onSelectContact={(contact) => {
              setSelectedContact(contact);
              if (isMobile) setShowSidebar(false);
              setIsModalOpen(false);
            }}
          />
        </div>

        {/* Search */}
        <div className="flex items-center justify-between w-full space-x-3 p-4 border-b border-gray-200">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search or start new chat" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="relative">
            <button className="p-2 cursor-pointer" onClick={() => setIsModalOpen(!isModalOpen)}>
              <SquarePen className="w-4 h-4" />
            </button>
            {isModalOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg w-auto max-w-md max-h-[80vh] flex flex-col shadow-md rounded-md z-10">
                {/* Modal box */}
                {/* Header */}
                <div className="flex justify-between items-center gap-3 p-4 border-b">
                  <h2 className="text-lg text-nowrap font-semibold">All Users</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="p-4 overflow-y-auto">
                  {listError ? (
                    <>
                      <div className="flex flex-col items-center justify-center text-black/70">
                        <MessageSquareWarningIcon className="w-4 h-4" />
                        <p className="text-center text-sm">{listError}</p>
                      </div>
                    </>
                  ) : (
                    <ul className="space-y-2">
                      {users.map((user: any) => (
                        <li key={user?.id} onClick={() => setSelectedContact(user)} className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                          {user?.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer (optional) */}
                <div className="p-4 border-t text-right flex justify-center">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button className="p-2" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
              <ListFilter className="w-4 h-4" />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border z-20">
                <button className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg">
                  <MessageSquareDot className="w-4 h-4" />
                  <span>Unread</span>
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100">
                  <Users className="w-4 h-4" />
                  <span>Groups</span>
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg">
                  <Pen className="w-4 h-4" />
                  <span>Drafts</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div 
              key={contact.id} 
              onClick={() => {
                setSelectedContact(contact);
                if (isMobile) setShowSidebar(false);
              }} 
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedContact.id === contact.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img src={contact.avatar || "/placeholder.svg"} alt={contact.name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                  {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{contact.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                    {contact.unread > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center whitespace-nowrap">
                        {contact.unread > 99 ? "99+" : contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Main Chat Window */}
      <div className={`${
        isMobile 
          ? showSidebar ? 'w-0 overflow-hidden' : 'w-full' 
          : 'flex-1'
      } flex flex-col bg-gray-50 transition-all duration-300`}>
        
        {/* Chat Header */}
        <div className="bg-gray-100 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isMobile && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-full md:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <img src={selectedContact.avatar || "/placeholder.svg"} alt={selectedContact.name} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedContact.name}</h3>
                <p className="text-sm text-gray-500">{selectedContact.online ? "Online" : "Last seen recently"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={startAudioCall}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button 
                onClick={startVideoCall}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Video className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowChatSearch(!showChatSearch)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Chat Search */}
          {showChatSearch && (
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  setShowChatSearch(false);
                  setChatSearchQuery("");
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
              {message.isMissedCall ? (
                <div className="flex items-center justify-center w-full">
                  <div className="bg-white text-red-500 shadow-sm p-3 rounded-xl flex items-center space-x-3 mx-auto">
                    <PhoneMissed className="w-4 h-4" />
                    <p className="text-sm">
                      {message.text} at <span className="text-xs">{message.timestamp}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sent ? "bg-blue-500 text-white" : "bg-white text-gray-900 shadow-sm"
                }`}>
                  {message.type === "image" && message.imageUrl && (
                    <img src={message.imageUrl} alt="Shared image" className="w-full h-48 object-cover rounded mb-2" />
                  )}
                  {message.type === "voice" && message.audioUrl && (
                    <div className="flex items-center space-x-2">
                      <audio controls src={message.audioUrl} className="w-full h-8" />
                    </div>
                  )}
                  {message.type === "file" && (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span className="text-sm">{message.fileName || "File"}</span>
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <div className={`flex items-center justify-end mt-1 space-x-1 ${
                    message.sent ? "text-blue-100" : "text-gray-500"
                  }`}>
                    <span className="text-xs">{message.timestamp}</span>
                    {message.sent && (
                      <div className="flex">
                        {message.read ? (
                          <CheckCheck className="w-3 h-3 text-blue-300" />
                        ) : message.delivered ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-gray-100 border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            {/* Paperclip icon */}
            {/* Emoji Picker */}
            <div className="relative">
              <button
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 bg-white border rounded-lg shadow-lg p-3 z-20 w-64 h-48 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setMessageInput(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-lg hover:bg-gray-100 p-1 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attachment Options */}
            <div className="relative">
              <button
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
                onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              {showAttachmentOptions && (
                <div className="absolute bottom-12 left-0 w-48 bg-white rounded-lg shadow-lg border z-20">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg"
                  >
                    <ImagePlay className="w-5 h-5" />
                    <span>Photo and Video</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                  </button>
                </div>
              )}
            </div>

            {/* Message Input Field */}
            <div className="flex-1 relative">
              {!isRecording && !recordedAudioURL && (
                <>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type a message"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="w-full pl-12 pr-12 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && messageInput.trim() && !sending) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />

                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sending}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </>
              )}

              {isRecording && (
                <div className="flex items-center justify-center w-full bg-white py-3 rounded-lg border border-dashed border-red-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <p className="text-red-600 text-sm font-medium">Recording... Tap to stop</p>
                  </div>
                </div>
              )}

              {recordedAudioURL && !isRecording && (
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-300">
                  <audio controls src={recordedAudioURL} className="flex-1 h-8" />
                  <button
                    onClick={sendVoiceNote}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      setRecordedAudioURL(null);
                      if (mediaRecorder) {
                        mediaRecorder.stream.getTracks().forEach(track => track.stop());
                      }
                    }}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Voice Record Button */}
            <button
              onClick={handleVoiceRecord}
              className={`p-2 rounded-full transition-colors ${
                isRecording 
                  ? "bg-red-100 text-red-500 animate-pulse" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
    </div>
  );
}