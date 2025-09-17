"use client";

import { activeMessages, contactMessage, contactMessageHistory, fetchPeerId, messageContacts, sendMessage, storePeerId } from "@/hooks/messages";
import React, { useState, useRef, useEffect } from "react";
import { Search, Phone, Video, Smile, Paperclip, Send, Check, CheckCheck, PhoneMissed, ListFilter, Camera, Mic, MessageSquareDot, Pen, Users, FileText, ImagePlay, Plus, PhoneOff, VideoOff, MicOff, X, ArrowLeft, SquarePen, PhoneOffIcon } from "lucide-react";
import ContactModal from "@/components/ContactModal";
import Peer, { MediaConnection } from "peerjs";
import Cookies from "js-cookie";
import { format } from "date-fns";

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
  online?: boolean;
  isGroup?: boolean;
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
  | "no-answer"; // timed out after 2min

// Simple emoji data
const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠"];

export default function ChatDashboard() {
  // State management
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [contacts, setContacts] = useState<any>(null);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudioURL, setRecordedAudioURL] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [listError, setListError] = useState("");
  const [messages, setMessages] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conversationId, setConversationId] = useState("");

  // Call states
  const [callState, setCallState] = useState<CallState>("idle"); // idle, audio-calling, audio-connected, video-calling, video-connected
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);
  const [recipientPeerId, setRecipientPeerId] = useState<string | null>(null);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [callerId, setCallerId] = useState<string | null>(null);
  const connRef = useRef<MediaConnection | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const incomingCallRef = useRef<any>(null);
  const unansweredTimeoutRef = useRef<any>(null);
  const dialToneRef = useRef<HTMLAudioElement | null>(null);
  const ringToneRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await activeMessages();
        setContacts(response);
      } catch (error: any) {
        console.error(error);
      }
    };
    fetchContacts();
  }, []);

  // PeerJs Initialization
  useEffect(() => {
    if (!loggedInUser) return; // wait until we have the user

    const newPeer = new Peer(loggedInUser.id);

    newPeer.on("open", async (id) => {
      try {
        setMyPeerId(id);
        await storePeerId(id);
      } catch (err) {
        console.error("Failed to send peer ID:", err);
      }
    });

    // When an incoming call arrives
    newPeer.on("call", (call) => {
      const { type, callerId: metadataCallerId } = call.metadata || {};

      // Store the call reference so we can accept/decline later
      incomingCallRef.current = call;
      setCallerId(metadataCallerId || call.peer);
      setCallState("ringing");

      // 👉 handle if caller hangs up before I accept
      call.on("close", () => {
        console.log("Caller ended before I accepted");
        setCallState("ended");
        stopCallTimer();
      });

      call.on("error", (err) => {
        console.error("Call error (callee side):", err);
        setCallState("unavailable");
        stopCallTimer();
      });

      //  play ringtone here
      if (ringToneRef.current) {
        ringToneRef.current.play().catch((err: any) => {
          console.error("Failed to play ringtone:", err);
        });
      }

      // if (dialToneRef.current) {
      //   dialToneRef.current.play().catch((err: any) => {
      //     console.error("Failed to play dial tone:", err);
      //   });
      // }
    });

    setPeer(newPeer);

    newPeer.on("error", (err) => {
      console.error("Peer error:", err);
      setCallState("unavailable");
    });

    return () => {
      newPeer.destroy();
    };
  }, [loggedInUser]);

  // Initialize ringtone once
  useEffect(() => {
    dialToneRef.current = new Audio("/sounds/dialtone.wav");
    dialToneRef.current.loop = true;

    ringToneRef.current = new Audio("/sounds/ringtone.wav");
    ringToneRef.current.loop = true;
  }, []);

  useEffect(() => {
    const unlock = () => {
      if (ringToneRef.current) {
        ringToneRef.current
          .play()
          .then(() => {
            ringToneRef.current!.pause();
            ringToneRef.current!.currentTime = 0;
            document.removeEventListener("click", unlock);
          })
          .catch((err) => console.warn("Unlock failed:", err));
      }
    };

    document.addEventListener("click", unlock);
    return () => document.removeEventListener("click", unlock);
  }, []);

  // call state handler
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (callState === "audio-calling" || callState === "video-calling" || callState === "ringing") {
      timeout = setTimeout(() => {
        setCallState("no-answer");
        endCall();
      }, 60000); // 1 mins
    }

    return () => clearTimeout(timeout);
  }, [callState]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (callState === "ended") {
      timeout = setTimeout(() => {
        setCallState("idle");
      }, 3000); // 3 seconds
    }

    return () => clearTimeout(timeout);
  }, [callState]);

  useEffect(() => {
    if ((callState === "audio-calling" || callState === "video-calling") && callerId === loggedInUser?.id) {
      // Caller hears dial tone
      dialToneRef.current?.play().catch(() => {});
    } else {
      dialToneRef.current?.pause();
      dialToneRef.current!.currentTime = 0;
    }

    if (callState === "ringing" && callerId !== loggedInUser?.id) {
      // Callee hears ringtone
      ringToneRef.current?.play().catch(() => {});
    } else {
      ringToneRef.current?.pause();
      ringToneRef.current!.currentTime = 0;
    }

    if (callState === "ended" || callState === "idle" || callState === "no-answer") {
      dialToneRef.current?.pause();
      ringToneRef.current?.pause();
      if (dialToneRef.current) dialToneRef.current.currentTime = 0;
      if (ringToneRef.current) ringToneRef.current.currentTime = 0;
    }
  }, [callState, callerId, loggedInUser]);

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
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // get user from cookies
  useEffect(() => {
    if (!loggedInUser) {
      const user = Cookies.get("user");
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          setLoggedInUser(parsedUser);
        } catch (err) {
          console.error("Failed to parse user cookie", err);
        }
      }
    }
  }, [loggedInUser]);

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

  // Call functions
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
  };

  const startAudioCall = async (remoteId: string) => {
    // 🔊 Play dial tone immediately on button click
    if (dialToneRef.current) {
      dialToneRef.current.currentTime = 0;
      await dialToneRef.current.play().catch((err) => {
        console.warn("Dial tone blocked:", err);
      });
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      if (!peer) throw new Error("Peer not initialized");

      const call = peer.call(remoteId, stream, { metadata: { type: "audio", callerId: myPeerId } });

      // Remote stream
      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        setCallState("audio-connected");
        startCallTimer();
      });

      // Handle close
      call.on("close", () => {
        setCallState("ended");
        endCall();
      });

      // Handle error
      call.on("error", () => {
        setCallState("unavailable");
        endCall();
      });

      connRef.current = call;
      setCallState("audio-calling");

      // Timeout if unanswered (2 min)
      unansweredTimeoutRef.current = setTimeout(() => {
        if (callState === "audio-calling") {
          setCallState("no-answer");
          endCall(true);
        }
      }, 60000);
    } catch (err) {
      console.error("Audio call error:", err);
      setCallState("idle");
    }
  };

  const playRingtone = () => {
    if (ringToneRef.current) {
      ringToneRef.current.currentTime = 0;
      ringToneRef.current.play().catch(() => {});
    }
  };

  const stopDialtone = () => {
    if (dialToneRef.current) {
      dialToneRef.current.pause();
      dialToneRef.current.currentTime = 0;
    }
  };

  const stopRingtone = () => {
    if (ringToneRef.current) {
      ringToneRef.current.pause();
      ringToneRef.current.currentTime = 0;
    }
  };

  const startVideoCall = async (remoteId: string) => {
    // 🔊 Play dial tone immediately on button click
    if (dialToneRef.current) {
      dialToneRef.current.currentTime = 0;
      await dialToneRef.current.play().catch((err) => {
        console.warn("Dial tone blocked:", err);
      });
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;

      // Local preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((err) => console.warn("Local video play blocked:", err));
      }

      if (!peer) throw new Error("Peer not initialized");

      const call = peer.call(remoteId, stream, { metadata: { type: "video", callerId: myPeerId } });

      // Remote stream
      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        setCallState("video-connected");
        startCallTimer();
      });

      // Handle close
      call.on("close", () => {
        setCallState("ended");
        endCall(true);
      });

      // Handle error
      call.on("error", () => {
        setCallState("unavailable");
        endCall(true);
      });

      connRef.current = call;
      setCallState("video-calling");

      // Timeout if unanswered (2 min)
      unansweredTimeoutRef.current = setTimeout(() => {
        if (callState === "video-calling") {
          setCallState("no-answer");
          endCall(true);
        }
      }, 60000);
    } catch (err) {
      console.error("Video call error:", err);
      setCallState("idle");
    }
  };

  const acceptCall = async () => {
    if (!incomingCallRef.current) return;

    const call = incomingCallRef.current;
    const { type } = call.metadata || {};
    const constraints = type === "video" ? { audio: true, video: true } : { audio: true, video: false };

    stopRingtone();

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Save + show my local video/audio
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((err) => console.warn("Local play blocked:", err));
      }

      // Accept the call
      call.answer(stream);

      // Handle remote stream
      call.on("stream", (remoteStream: MediaStream) => {
        remoteVideoRef.current!.srcObject = remoteStream;
      });

      connRef.current = call;
      setCallState(type === "video" ? "video-connected" : "audio-connected");
      startCallTimer();
    } catch (err) {
      console.error("Error accepting call:", err);
      setCallState("idle");
    }
  };

  const declineCall = () => {
    // Decline incoming call before answering
    if (incomingCallRef.current) {
      incomingCallRef.current.close(); // tells caller "call rejected"
      incomingCallRef.current = null;
    }

    stopDialtone();
    endCall(true); // ensures cleanup + state reset
  };

  const endCall = (forceEnded = false) => {
    setCallState(forceEnded ? "ended" : "idle");
    stopCallTimer();
    setIsMuted(false);
    setIsVideoOff(false);

    // Stop local media
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    // Reset video refs
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    // Close peer connections
    if (connRef.current) {
      connRef.current.close(); // triggers `call.on("close")` on the other peer
      connRef.current = null;
    }

    if (incomingCallRef.current) {
      incomingCallRef.current.close(); // if call was ringing but never answered
      incomingCallRef.current = null;
    }

    stopRingtone();
    stopDialtone();
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
      const response = await sendMessage(conversationId, text);
      setMessages((prev: any) => [...prev, newMessage]);
      setMessageInput("");
    } catch (error: any) {
      console.log(error);
    }
    setSending(false);
  };

  // File handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileMessage = {
        id: messages.length + 1,
        text: `📎 ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sent: true,
        delivered: true,
        read: false,
        type: "file",
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
      };
      setMessages((prev: any) => [...prev, fileMessage]);
    }
    setShowAttachmentOptions(false);
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageMessage = {
        id: messages.length + 1,
        text: "📷 Photo",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sent: true,
        delivered: true,
        read: false,
        type: "image",
        imageUrl: URL.createObjectURL(file),
      };
      setMessages((prev: any) => [...prev, imageMessage]);
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
        const response = await messageContacts();
        setAllContacts(response);
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
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sent: true,
        delivered: true,
        read: false,
        type: "voice",
        audioUrl: recordedAudioURL,
      };
      setMessages((prev: any) => [...prev, voiceMessage]);
      setRecordedAudioURL(null);
    }
  };

  // Render call overlay
  const renderCallOverlay = () => {
    if (callState === "idle") return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center text-white">
        <div className="text-center mb-8">
          <img src={selectedContact?.avatar} alt={selectedContact?.firstname} className="w-32 h-32 rounded-full mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            {selectedContact?.firstname} {selectedContact?.lastname}
          </h2>
          <h3>{callerId}</h3>
          {callState === "audio-calling" || (callState === "video-calling" && <h3>Calling</h3>)}
          {callState === "audio-connected" || (callState === "video-connected" && <h3>In call</h3>)}
          {callState === "ended" && <h3>Call disconnected</h3>}
          <p className="text-lg text-white">
            {callState === "ringing" && "Incoming call…"}
            {callState === "audio-connected" && `Audio call • ${formatCallDuration(callDuration)}`}
            {callState === "video-connected" && formatCallDuration(callDuration)}
            {callState === "no-answer" && "Recipient did not pick up"}
            {callState === "unavailable" && "Recipient unavailable"}
          </p>
        </div>

        {/* Video display (only for video calls) */}
        <div className="relative w-full max-w-md h-64 mb-8">
          {/* Always: my video = local, other user = remote */}
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain rounded-lg bg-black" />
          <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-2 right-2 w-24 h-20 object-cover rounded border-2 border-white bg-black" />
        </div>
        {/* Call controls */}
        {callState !== "ringing" && (
          <div className="flex items-center gap-6">
            <button onClick={toggleMute} className={`p-4 rounded-full ${isMuted ? "bg-red-500" : "bg-gray-600"} hover:bg-opacity-80 transition-colors`}>
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {(callState === "video-calling" || callState === "video-connected") && (
              <button onClick={toggleVideo} className={`p-4 rounded-full ${isVideoOff ? "bg-red-500" : "bg-gray-600"} hover:bg-opacity-80 transition-colors`}>
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}

            <button onClick={() => endCall()} className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors">
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}

        {callState === "ringing" && (
          <div className="flex items-center gap-6">
            <button onClick={acceptCall} className="p-4 rounded-full bg-green-500 hover:bg-green-600 transition-colors">
              <Phone className="w-6 h-6" />
            </button>
            <button onClick={declineCall} className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors">
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {renderCallOverlay()}

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
                  {contact?.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
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
                  <p className="text-sm text-gray-500">{selectedContact?.online ? "Online" : "Last seen recently"}</p>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredMessages?.map((message: any) => (
              <div key={message?.id} className={`flex ${message?.sent || message?.sender?._id === loggedInUser?.id ? "justify-end" : "justify-start"}`}>
                {message?.isMissedCall ? (
                  <div className="flex items-center justify-center w-full">
                    <div className="bg-white text-red-500 shadow-sm p-3 rounded-xl flex items-center space-x-3 mx-auto">
                      <PhoneMissed className="w-4 h-4" />
                      <p className="text-sm">
                        {message?.text} at <span className="text-xs">{message?.timestamp}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message?.sent || message?.sender?._id === loggedInUser?.id ? "bg-secondary text-white" : "bg-white text-gray-900 shadow-sm"}`}>
                    {message?.type === "image" && message?.imageUrl && <img src={message?.imageUrl} alt="Shared image" className="w-full h-48 object-cover rounded mb-2" />}
                    {message?.type === "voice" && message?.audioUrl && (
                      <div className="flex items-center space-x-2">
                        <audio controls src={message?.audioUrl} className="w-full h-8" />
                      </div>
                    )}
                    {message?.type === "file" && (
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span className="text-sm">{message?.fileName || "File"}</span>
                      </div>
                    )}
                    <p className="text-sm">{message?.text}</p>
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
    </div>
  );
}
