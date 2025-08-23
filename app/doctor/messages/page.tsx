"use client";

import { useState } from "react";
import { Search, Phone, Video, Smile, Paperclip, Send, Check, CheckCheck, PhoneMissed, ListFilter, Camera, Mic, MessageSquareDot, Pen, Users, Signature, FileText, ImagePlay } from "lucide-react";

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

const messages = [
  {
    id: 1,
    text: "Hey! How's your day going?",
    timestamp: "2:25 PM",
    sent: false,
    delivered: true,
    read: true,
  },
  {
    id: 2,
    text: "Pretty good! Just finished the project presentation. How about you?",
    timestamp: "2:26 PM",
    sent: true,
    delivered: true,
    read: true,
  },
  {
    id: 3,
    text: "That's awesome! I'm sure it went well 😊",
    timestamp: "2:27 PM",
    sent: false,
    delivered: true,
    read: true,
  },
  {
    id: 4,
    text: "Thanks! Want to grab coffee later?",
    timestamp: "2:28 PM",
    sent: true,
    delivered: true,
    read: true,
  },
  {
    id: 5,
    text: "Missed voice call",
    timestamp: "2:29 PM",
    sent: false,
    delivered: true,
    read: false,
    isMissedCall: true,
  },
  {
    id: 6,
    text: "Sorry, was in a meeting. Let me call you back in 5 minutes",
    timestamp: "2:30 PM",
    sent: true,
    delivered: true,
    read: false,
  },
];

export default function ChatDashboard() {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  // const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordedAudioURL, setRecordedAudioURL] = useState<string | null>(null);

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-white p-10">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/3 bg-white border-0 border-gray-200 rounded-s-xl flex flex-col">
        {/* Profile Section */}
        <div className="p-4 bg-gray-100 border-b border-gray-200 rounded-tl-xl">
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0 pt-4">
              <h2 className="text-lg font-semibold text-gray-900 truncate mt-1">Conversations</h2>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between w-full space-x-3 p-4 border-b border-gray-200">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search or start new chat" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <button className="p-2" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
              <ListFilter className="w-4 h-4" />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                <button className="block flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100">
                  <MessageSquareDot className="w-5 h-5" />
                  <span className="">Unread</span>
                </button>
                <button className="block flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100">
                  <Users className="w-5 h-5" />
                  <span className="">Groups</span>
                </button>
                <button className="block flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100">
                  <Pen className="w-5 h-5" />
                  <span className="">Drafts</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto rounded-bl-xl">
          {filteredContacts.map((contact) => (
            <div key={contact.id} onClick={() => setSelectedContact(contact)} className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedContact.id === contact.id ? "bg-gray-100" : ""}`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={contact.avatar || "/placeholder.svg"} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                  {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-900 rounded-full border-2 border-white"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500 ml-2">{contact.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                    {contact.unread > 0 && <span className="ml-2 bg-blue-900 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">{contact.unread > 99 ? "99+" : contact.unread}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Main Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50 rounded-tr-xl rounded-br-xl">
        {/* Chat Header */}
        <div className="bg-gray-100 rounded-tr-xl border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 ">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedContact.avatar || "/placeholder.svg"} alt={selectedContact.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedContact.name}</h3>
                <p className="text-sm text-gray-500">{selectedContact.online ? "Online" : "Last seen recently"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
              {message.isMissedCall ? (
                <>
                  <div className="flex items-center justify-content-center w-full">
                    <div className={`bg-white text-red-500 shadow-sm p-2 rounded-xl flex space-x-3 mx-auto`}>
                      <PhoneMissed className="w-4 h-4" />
                      <p className="text-sm">
                        {message.text} at <span className="text-xs">{message.timestamp}</span>
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isMissedCall ? "hidden" : message.sent ? "bg-blue-900 text-white" : "bg-white text-gray-900 shadow-sm"}`}>
                  <p className="text-sm">{message.text}</p>
                  <div className={`flex items-center justify-end mt-1 space-x-1 ${message.sent ? "text-blue-100" : "text-gray-500"}`}>
                    <span className="text-xs">{message.timestamp}</span>
                    {message.sent && <div className="flex">{message.read ? <CheckCheck className="w-3 h-3 text-blue-400" /> : message.delivered ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-gray-100 border-t border-gray-200 p-4 rounded-br-xl">
          <div className="flex items-center space-x-3">
            {/* Smile icon */}
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-10 bg-white shadow-lg rounded p-2">
                  {/* Replace with actual emoji picker like emoji-mart */}
                  <p>😀 😃 😄 😁 😆</p>
                </div>
              )}
            </div>

            {/* Paperclip icon */}
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full" onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}>
                <Paperclip className="w-5 h-5" />
              </button>
              {showAttachmentOptions && (
                <div className="absolute bottom-12 left-0 w-48 bg-white rounded shadow-md z-10">
                  <button className="block flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100">
                    <ImagePlay className="w-5 h-5" />
                    <span className="">Photo and Video</span>
                  </button>
                  <button className="block flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100">
                    <FileText className="w-5 h-5" />
                    <span className="">Documents</span>
                  </button>
                  <button className="block flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100">
                    <Signature className="w-5 h-5" />
                    <span className="">Signature</span>
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              {!isRecording && !recordedAudioURL && (
                <>
                  <label className="p-2 absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full">
                    <Camera className="w-5 h-5" />
                    <input type="file" accept="image/*" capture="environment" className="hidden" />
                  </label>

                  <input
                    type="text"
                    placeholder="Type a message"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="w-full pl-12 px-4 py-2 bg-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && messageInput.trim()) {
                        // send message logic here
                        setMessageInput("");
                      }
                    }}
                  />

                  <button className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-900 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50" disabled={!messageInput.trim()}>
                    <Send className="w-5 h-5" />
                  </button>
                </>
              )}

              {isRecording && (
                <div className="flex items-center justify-center w-full bg-white py-3 rounded-lg border border-dashed border-blue-500">
                  <p className="text-blue-700 text-sm font-medium animate-pulse">🎙️ Recording... Speak now</p>
                </div>
              )}

              {recordedAudioURL && !isRecording && (
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm">
                  <audio controls src={recordedAudioURL} className="w-full" />
                  <button
                    className="text-green-600 hover:text-green-800 font-medium"
                    onClick={() => {
                      // handle send audio logic here
                      setRecordedAudioURL(null);
                    }}>
                    Send
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 font-medium"
                    onClick={() => {
                      setRecordedAudioURL(null);
                      // setAudioChunks([]);
                    }}>
                    Discard
                  </button>
                </div>
              )}
            </div>
            <button
              className={`p-2 rounded-full transition-colors ${isRecording ? "bg-red-100 text-red-500" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}`}
              onClick={async () => {
                if (!isRecording) {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const recorder = new MediaRecorder(stream);
                    const chunks: Blob[] = [];

                    recorder.ondataavailable = (e) => {
                      if (e.data.size > 0) chunks.push(e.data);
                    };

                    recorder.onstop = () => {
                      const audioBlob = new Blob(chunks, { type: "audio/webm" }); // or 'audio/ogg; codecs=opus'
                      const url = URL.createObjectURL(audioBlob);
                      setRecordedAudioURL(url);
                      // setAudioChunks([]);
                    };

                    recorder.start();
                    // setAudioChunks([]); // reset before starting
                    setMediaRecorder(recorder);
                    setIsRecording(true);
                  } catch (err) {
                    console.error("Mic access error:", err);
                  }
                } else {
                  mediaRecorder?.stop();
                  setIsRecording(false);
                }
              }}>
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
