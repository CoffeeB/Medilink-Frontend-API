"use client";

import { activeMessages, contactMessage, contactMessageHistory, fetchPeerId, messageContacts, sendMessage, storePeerId } from "@/hooks/messages";
import React, { useState, useRef, useEffect } from "react";
import { Search, Phone, Video, Smile, Paperclip, Send, Check, CheckCheck, PhoneMissed, ListFilter, Camera, Mic, MessageSquareDot, Pen, Users, FileText, ImagePlay, Plus, PhoneOff, VideoOff, MicOff, X, ArrowLeft, SquarePen, PhoneOffIcon, Trash } from "lucide-react";
import ContactModal from "@/components/ContactModal";
import Peer, { MediaConnection } from "peerjs";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { getProfileById } from "@/hooks/profile";
import Link from "next/link";
import { socket } from "@/lib/socket";
import { usePeerContext } from "@/context/CallProvider";
import { enqueueSnackbar } from "notistack";

interface Contact {
  email: string;
  firstname: string;
  lastname: string;
  id?: number;
  name?: string;
  role?: string;
  _id?: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
  avatar?: string;
  isOnline?: boolean;
  isGroup?: boolean;
  status: string;
}

type CallState =
  | "idle"
  | "audio-calling" // caller dialing
  | "video-calling" // caller dialing
  | "ringing" // recipient sees incoming call
  | "audio-connected" // call established
  | "video-connected" // call established
  | "ended" // after hangup
  | "unavailable" // peer not reachable
  | "disconnected" // timed out after 2min
  | "no-answer"
  | "connecting"; // timed out after 2min

// Simple emoji data
const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠"];

export default function ChatDashboard() {
  // State management
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [contacts, setContacts] = useState<any>(null);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudioURL, setRecordedAudioURL] = useState<string | null>(null);
  // const [sending, setSending] = useState(false);
  const [listError, setListError] = useState("");
  // const [messages, setMessages] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedContact, setSelectedContact, sending, setSending, loggedInUser, messages, setMessages, conversationId, setConversationId, recipientPeerId, setRecipientPeerId, startAudioCall, startVideoCall } = usePeerContext();
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
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
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await activeMessages();
        setContacts(response);
      } catch (error: any) {
        console.error(error);
      }
    };

    // Call immediately on mount
    fetchContacts();

    // Poll every 5 seconds
    const interval = setInterval(fetchContacts, 5000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    const fetchUpdatedConversation = async () => {
      try {
        const messageHistory = await contactMessageHistory(conversationId);
        setMessages(messageHistory);
        const getPeerIdResponse = await fetchPeerId(selectedContact?._id);
        setRecipientPeerId(getPeerIdResponse?.peerId);
      } catch (error: any) {
        console.error(error);
      }
    };

    // Call immediately on mount
    fetchUpdatedConversation();

    // Poll every 5 seconds
    const interval = setInterval(fetchUpdatedConversation, 5000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSelectContact = async (contact: Contact) => {
    // Set the active/open chat
    setSelectedContact(contact);

    // Add to contacts if it doesn’t exist already
    setContacts((prev: any) => {
      const exists = prev.some((c: any) => (c?.id && c?.id === contact.id) || (c?._id && c?._id === contact._id));

      if (exists) {
        return prev; // don’t replace, just keep as is
      }

      return [...prev, contact]; // append new
    });

    try {
      const response = await contactMessage(contact?._id);
      setConversationId(response?._id);
      const messageHistory = await contactMessageHistory(response?._id);
      setMessages(messageHistory);
      const getPeerIdResponse = await fetchPeerId(contact?._id);
      setRecipientPeerId(getPeerIdResponse?.peerId);
      console.log("getPeerIdResponse", getPeerIdResponse);
    } catch (error) {
      console.log(error);
    }
  };

  // Auto-scroll to bottom of messages
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, []);

  useEffect(() => {
    if (!socket) return;

    // 🔗 Handle connection
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);

      if (loggedInUser?.id) {
        socket.emit("join", loggedInUser?.id);
        console.log("🟢 Sent join for user:", loggedInUser?.id);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    // 👥 Presence listeners
    socket.on("user:online", ({ userId }) => {
      console.log("📡 user:online event received for:", userId);

      setContacts((prev: any) =>
        prev?.map((conv: any) => ({
          ...conv,
          participants: conv.participants.map((p: any) => (String(p._id) === String(userId) ? { ...p, isOnline: true } : p)),
        }))
      );
    });

    socket.on("user:offline", ({ userId, lastSeen }) => {
      console.log("📡 user:offline event received for:", userId, "last seen:", lastSeen);

      setContacts((prev: any) =>
        prev?.map((conv: any) => ({
          ...conv,
          participants: conv.participants.map((p: any) => (String(p._id) === String(userId) ? { ...p, isOnline: false, lastSeen } : p)),
        }))
      );
    });

    // 🧹 Cleanup
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("user:online");
      socket.off("user:offline");
    };
  }, [loggedInUser, socket]);

  const transformedContacts = contacts?.map((contact: any) => {
    const otherParticipant = contact?.participants?.find((p: any) => {
      return p._id !== loggedInUser?.id;
    });

    return {
      _id: contact?._id,
      lastMessage: contact?.lastMessage,
      timestamp: contact?.updatedAt,
      unread: contact?.unread || 0,
      ...otherParticipant,
    };
  });

  const filteredContacts = transformedContacts?.filter((contact: any) => contact?.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) || contact?.lastname?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredMessages = messages?.filter((message: any) => chatSearchQuery === "" || message?.text.toLowerCase().includes(chatSearchQuery.toLowerCase()));

  // Message handling
  const handleSend = async () => {
    if (!selectedContact) return;
    const text = messageInput.trim();
    if (!text || sending) return;

    setSending(true);

    const newMessage = {
      id: messages.length + 1,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sent: true,
      delivered: true,
      read: false,
      type: "text",
    };

    try {
      setMessages((prev: any) => [...prev, newMessage]);
      const response = await sendMessage(conversationId, text, "text", "");
      setMessageInput("");
    } catch (error: any) {
      console.log(error);
    }
    setSending(false);
  };

  const getFileType = (file: File): "video" | "image" | "document" => {
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("image/")) return "image";
    return "document";
  };

  // File handling
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      const fileType = getFileType(file);
      formData.append("file", file);
      formData.append("conversationId", conversationId); // pass your convo id here
      formData.append("type", fileType); // save in document folder

      const res = await fetch("/api/upload/conversations", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const fileMessage = {
          id: messages.length + 1,
          text: fileType === "image" ? "📷 Photo" : fileType === "video" ? "🎥 Video" : `📎 ${file.name}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sent: true,
          delivered: true,
          read: false,
          type: fileType,
          fileUrl: data.fileUrl, // saved public link
          fileName: file.name,
          fileSize: file.size,
        };
        setMessages((prev: any) => [...prev, fileMessage]);
        const response = await sendMessage(conversationId, file.name, fileMessage?.type, data.fileUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }

    setShowAttachmentOptions(false);
  };

  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      const fileType = getFileType(file);
      formData.append("file", file);
      formData.append("conversationId", conversationId); // pass convo id
      formData.append("type", fileType); // save in images folder

      const res = await fetch("/api/upload/conversations", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const imageMessage = {
          id: messages.length + 1,
          text: fileType === "image" ? "📷 Photo" : fileType === "video" ? "🎥 Video" : `📎 ${file.name}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sent: true,
          delivered: true,
          read: false,
          type: fileType,
          imageUrl: data.fileUrl, // stored public link
        };
        setMessages((prev: any) => [...prev, imageMessage]);
        const response = await sendMessage(conversationId, imageMessage?.text, imageMessage?.type, data.fileUrl);
      }
    } catch (err) {
      console.error("Upload failed:", err);
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
        enqueueSnackbar("Could not access microphone", { variant: "error" });
      }
    } else {
      mediaRecorder?.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    const getUsersList = async () => {
      try {
        const response = await messageContacts();
        setAllContacts(response);
      } catch (error) {
        console.log("error getting users", error);
        setListError("Couldn't fetch users. Please Try again");
      }
    };

    getUsersList();
  }, [isModalOpen]);

  const sendVoiceNote = async () => {
    if (!recordedAudioURL) return;

    try {
      // Convert blob URL back into a Blob
      const response = await fetch(recordedAudioURL);
      const blob = await response.blob();

      // Create a File object for consistency
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });

      // Prepare upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversationId);
      formData.append("type", "voice"); // save in a "voice" folder

      const res = await fetch("/api/upload/conversations", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const voiceMessage = {
          id: messages.length + 1,
          text: "🎤 Voice message",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sent: true,
          delivered: true,
          read: false,
          type: "voice",
          audioUrl: data.fileUrl, // stored public link
          fileName: file.name,
          fileSize: file.size,
        };

        setMessages((prev: any) => [...prev, voiceMessage]);
        // optional: save to DB/chat service
        await sendMessage(conversationId, voiceMessage.text, voiceMessage.type, data.fileUrl);
      }
    } catch (err) {
      console.error("Voice note upload failed:", err);
    }

    setRecordedAudioURL(null);
  };

  const isVideo = (url?: string) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await fetch(`/api/messages/${id}`, { method: "DELETE" });
      setMessages((prev: any) => prev.filter((m: any) => m._id !== id));
      alert("Message deleted successfully.");
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message.");
    }
  };

  const openDeleteModal = (id: string) => {
    setMessageToDelete(id);
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const confirmDelete = () => {
    if (messageToDelete) handleDeleteMessage(messageToDelete);
    setShowDeleteModal(false);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar */}
      <div className={`${isMobile ? (showSidebar ? "w-full" : "w-0 overflow-hidden") : "w-full md:w-1/3 lg:w-1/3"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {/* Profile Section */}
        <div className="p-4 bg-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            <button onClick={() => setIsModalOpen(true)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full transition">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <ContactModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            contacts={allContacts}
            onSelectContact={(contact: Contact) => {
              handleSelectContact(contact); // ✅ single object, not array
              if (isMobile) setShowSidebar(false);
              setIsModalOpen(false);
            }}
          />
        </div>

        {/* Search */}
        <div className="flex items-center justify-between w-full space-x-3 p-4 border-b border-gray-200">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search or start new chat" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--secondary))]" />
          </div>
          <div className="relative">
            <button className="p-2 cursor-pointer" onClick={() => setIsModalOpen(!isModalOpen)}>
              <SquarePen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts?.map((contact: any) => (
            <div
              key={contact?._id}
              onClick={() => {
                handleSelectContact(contact);
                if (isMobile) setShowSidebar(false);
              }}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedContact?._id === contact?._id ? "bg-gray-100" : ""}`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img src={contact?.avatar || "/placeholder.svg"} alt={contact?.firstname} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                  {contact?.isOnline ? <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div> : <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {contact?.firstname} {contact?.lastname}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{format(new Date(contact?.timestamp), "eee p")}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500 truncate">{contact?.lastMessage}</p>
                    {contact?.unread > 0 && <span className="ml-2 bg-secondary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center whitespace-nowrap">{contact?.unread > 99 ? "99+" : contact?.unread}</span>}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-xs text-black truncate capitalize ${contact?.role === "doctor" ? "bg-blue-300" : contact?.role === "marketer" ? "bg-green-300" : ""} rounded p-1`}>{contact?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Main Chat Window */}
      {selectedContact && (
        <div className={`${isMobile ? (showSidebar ? "w-0 overflow-hidden" : "w-full") : "flex-1"} flex flex-col bg-gray-50 transition-all duration-300`}>
          {/* Chat Header */}
          <div className="bg-gray-100 border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <button onClick={() => setShowSidebar(true)} className="p-2 text-gray-600 hover:text-gray-800 rounded-full md:hidden">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <img src={selectedContact?.avatar || "/placeholder.svg"} alt={selectedContact?.firstname} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedContact?.firstname} {selectedContact?.lastname}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedContact?.isOnline ? "Online" : "Last seen recently"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (recipientPeerId) startAudioCall(recipientPeerId);
                  }}
                  disabled={!recipientPeerId}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                  {recipientPeerId ? <Phone className="w-5 h-5" /> : <PhoneOffIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    if (recipientPeerId) startVideoCall(recipientPeerId);
                  }}
                  disabled={!recipientPeerId}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                  {recipientPeerId ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <button onClick={() => setShowChatSearch(!showChatSearch)} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Search */}
            {showChatSearch && (
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search messages..." value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)} className="w-full pl-10 pr-10 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--secondary))]" />
                <button
                  onClick={() => {
                    setShowChatSearch(false);
                    setChatSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
            {filteredMessages?.map((message: any) => (
              <div key={message?.id} className={`relative flex ${message?.sent || message?.sender?._id === loggedInUser?.id ? "justify-end" : "justify-start"}`}>
                {message?.type === "missedCall" ? (
                  <div className="flex items-center justify-center w-full">
                    <div className="bg-white text-red-500 shadow-sm p-3 rounded-xl flex items-center space-x-3 mx-auto">
                      <PhoneMissed className="w-4 h-4" />
                      <p className="text-sm">
                        {message?.text} at <span className="text-xs">{message?.timestamp}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message?.sent || message?.sender?._id === loggedInUser?.id ? "bg-secondary text-white" : "bg-white text-gray-900 shadow-sm"} grid`}>
                    <div className="flex">
                      {message?.sender?._id === loggedInUser?.id && (
                        <div className="ms-auto">
                          <button onClick={() => setShowMenu((prev) => (prev === message._id ? null : message._id))} className="text-white/80 hover:text-white cursor-pointer">
                            &#x22EE;
                          </button>

                          {showMenu === message._id && (
                            <div className="absolute right-0 mt-1 w-auto bg-white border rounded shadow-md z-50">
                              <button onClick={() => openDeleteModal(message._id)} className="block w-full text-left text-sm text-red-600 hover:bg-gray-100 px-3 py-2 flex items-center gap-2 cursor-pointer">
                                <Trash size={20} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {message?.type === "image" && message?.url && (
                      <Link href={message?.url || "/messages"} target="_blank" className="flex items-center space-x-2">
                        <img src={message?.url} alt="Shared image" className="w-full h-48 object-cover rounded mb-2" />
                      </Link>
                    )}
                    {message?.type === "voice" && message?.url && (
                      <div className="flex items-center space-x-2">
                        <audio controls src={message?.url} className="w-[100] h-10" />
                      </div>
                    )}
                    {message?.type === "image" && message?.url && (
                      <Link href={message?.url || "/messages"} target="_blank" className="flex items-center space-x-2">
                        <img src={message?.url} alt="Shared image" className="w-full h-48 object-cover rounded mb-2" />
                      </Link>
                    )}
                    {message?.type === "file" && (
                      <Link href={message?.url || "/messages"} target="_blank" className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span className="text-sm text-wrap">{message?.text || "File"}</span>
                      </Link>
                    )}
                    {message?.type === "video" && message?.url && (
                      <Link href={message?.url || "/messages"} target="_blank" className="relative block w-full h-48">
                        {/* Thumbnail preview (poster frame or placeholder) */}
                        <video
                          src={message?.url}
                          className="w-full h-48 object-cover rounded mb-2"
                          muted
                          playsInline
                          preload="metadata"
                          onLoadedMetadata={(e) => {
                            // Hack: only load metadata, avoid autoplay
                            (e.target as HTMLVideoElement).currentTime = 1;
                          }}
                        />

                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-50 rounded-full p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    )}
                    {/* Audio call message */}
                    {message?.type === "audioCall" && (
                      <div
                        onClick={() => {
                          if (recipientPeerId) startAudioCall(recipientPeerId);
                        }}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-black/10 p-2 rounded transition">
                        <Phone className="w-5 h-5 text-green-500" />
                        <span className="text-sm">{message?.text}</span>
                      </div>
                    )}
                    {/* Video call message */}
                    {message?.type === "videoCall" && (
                      <div
                        onClick={() => {
                          if (recipientPeerId) startVideoCall(recipientPeerId);
                        }}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-black/10 p-2 rounded transition">
                        <Video className="w-5 h-5 text-blue-500" />
                        <span className="text-sm">{message?.text}</span>
                      </div>
                    )}
                    {message.type === "text" && <p className="text-sm text-wrap wrap-anywhere">{message?.text}</p>}
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${message?.sent || message?.sender?._id === loggedInUser?.id ? "text-blue-100" : "text-gray-500"}`}>
                      <span className="text-xs">{message?.timestamp}</span>
                      {message?.sent || (message?.sender?._id === loggedInUser?.id && <div className="flex">{message?.read ? <CheckCheck className="w-3 h-3 text-blue-300" /> : message?.delivered ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}</div>)}
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
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 bg-white border rounded-lg shadow-lg p-3 z-20 w-64 h-48 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setMessageInput((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="text-lg hover:bg-gray-100 p-1 rounded">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Attachment Options */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors" onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}>
                  <Paperclip className="w-5 h-5" />
                </button>
                {showAttachmentOptions && (
                  <div className="absolute bottom-12 left-0 w-48 bg-white rounded-lg shadow-lg border z-20">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg">
                      <ImagePlay className="w-5 h-5" />
                      <span>Photo and Video</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg">
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
                    <button onClick={() => cameraInputRef.current?.click()} className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                      <Camera className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      placeholder="Type a message"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="w-full pl-12 pr-12 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--secondary))]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && messageInput.trim() && !sending) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />

                    <button onClick={handleSend} disabled={!messageInput.trim() || sending} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-secondary text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
                    <button onClick={sendVoiceNote} className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">
                      Send
                    </button>
                    <button
                      onClick={() => {
                        setRecordedAudioURL(null);
                        if (mediaRecorder) {
                          mediaRecorder.stream.getTracks().forEach((track) => track.stop());
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Voice Record Button */}
              <button onClick={handleVoiceRecord} className={`p-2 rounded-full transition-colors ${isRecording ? "bg-red-100 text-red-500 animate-pulse" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"}`}>
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="*/*" multiple onChange={handleFileSelect} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" onChange={handleCameraCapture} className="hidden" />

      {showDeleteModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Delete Message</h2>
            <p className="text-sm text-gray-600 mb-4">This message will be permanently deleted. Do you want to continue?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
