"use client";

import { activeMessages, contactMessage, contactMessageHistory, fetchPeerId, messageContacts, sendMessage, storePeerId } from "@/hooks/messages";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Search, Phone, Video, Smile, Paperclip, Send, Check, CheckCheck, PhoneMissed, ListFilter, Camera, Mic, MessageSquareDot, Pen, Users, FileText, ImagePlay, Plus, PhoneOff, VideoOff, MicOff, X, ArrowLeft, SquarePen, PhoneOffIcon } from "lucide-react";
import ContactModal from "@/components/ContactModal";
import Peer, { MediaConnection } from "peerjs";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { getProfileById } from "@/hooks/profile";
import Link from "next/link";
import { socket } from "@/lib/socket";
import CallOverlay from "@/components/CallOverlay";

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

const PeerContext = createContext<any | undefined>(undefined);

export const PeerProvider = ({ children, loggedInUser }: { children: React.ReactNode; loggedInUser: any }) => {
  // State management
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<any>(null);
  const [conversationId, setConversationId] = useState("");
  const [isCaller, setIsCaller] = useState(false);
  const [caller, setCaller] = useState<any>(null);

  // Call states
  const [callState, setCallState] = useState<CallState>("idle"); // idle, audio-calling, audio-connected, video-calling, video-connected
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [recipientPeerId, setRecipientPeerId] = useState<string | null>(null);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [callerId, setCallerId] = useState<string | null>(null);
  const connRef = useRef<MediaConnection | null>(null);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<number | null>(null);
  const callStartRef = useRef<number | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const incomingCallRef = useRef<any>(null);
  const unansweredTimeoutRef = useRef<any>(null);
  const dialToneRef = useRef<HTMLAudioElement | null>(null);
  const ringToneRef = useRef<HTMLAudioElement | null>(null);
  const dataConnRef = useRef<any>(null);

  // PeerJs Initialization
  useEffect(() => {
    if (!loggedInUser || peer) return;

    const dateSuffix = new Date().toISOString().replace(/[:.]/g, "-");
    const newPeer = new Peer(`${loggedInUser.id}-${dateSuffix}`);

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
      setCallerId(metadataCallerId || call.peer.split("-")[0]);
      setCallState("ringing");

      // 👉 handle if caller hangs up before I accept
      call.on("close", () => {
        console.log("Caller ended before I accepted");
        setCallState("ended");
        stopCallTimer();
        endCall(true);
      });

      call.on("error", (err) => {
        console.error("Call error (callee side):", err);
        setCallState("unavailable");
        stopCallTimer();
        endCall(true);
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

    // 🔌 Handle disconnects and try to reconnect
    newPeer.on("disconnected", () => {
      console.warn("⚠️ Disconnected from PeerJS server, attempting reconnect...");
      setCallState("disconnected");

      // trigger a reconnect
      newPeer.reconnect();
    });

    newPeer.on("error", (err) => {
      console.error("Peer error:", err);
      sendMissedCall();
      setCallState("unavailable");
    });

    return () => {
      newPeer.destroy();
    };
  }, [loggedInUser]);

  // Call functions
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startCallTimer = () => {
    // prevent double intervals
    if (callTimerRef.current !== null) return;

    // Establish start time so elapsed = now - startTime
    // If callDuration > 0, that means we are resuming: set start = now - elapsed
    callStartRef.current = Date.now() - callDuration * 1000;

    // update frequently enough for UI but not too frequently (250ms is fine)
    callTimerRef.current = window.setInterval(() => {
      if (!callStartRef.current) return;
      const elapsedSeconds = Math.floor((Date.now() - callStartRef.current) / 1000);
      setCallDuration(elapsedSeconds);
    }, 250);
  };

  const stopCallTimer = (reset = true) => {
    if (callTimerRef.current !== null) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    // If we are pausing (reset === false), keep callStartRef so resume works:
    if (reset) {
      callStartRef.current = null;
      setCallDuration(0);
    } else {
      // pause: keep callDuration, clear start timestamp
      callStartRef.current = null;
    }
  };

  const handleSignal = (msg: any) => {
    console.log("📩 Received signal:", msg);

    if (msg.type === "end-call") {
      console.log("🔴 Remote ended the call");
      endCall(true);
    }

    if (msg.type === "decline-call") {
      console.log("❌ Remote declined the call");
      endCall(true);
    }
  };

  const startAudioCall = async (remoteId: string) => {
    sendCall("audio");
    setIsCaller(true);
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

      dataConnRef.current = peer.connect(remoteId);
      dataConnRef.current.on("open", () => {
        console.log("📡 Data channel open with", remoteId);
      });

      dataConnRef.current.on("data", (msg: any) => handleSignal(msg));
    } catch (err) {
      console.error("Audio call error:", err);
      setCallState("idle");
    }
  };

  const startVideoCall = async (remoteId: string) => {
    sendCall("video");
    setIsCaller(true);
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
    if (dataConnRef.current?.open) {
      dataConnRef.current.send({ type: "decline-call" });
    }

    if (incomingCallRef.current) {
      incomingCallRef.current.close();
      incomingCallRef.current = null;
    }

    stopDialtone();
    if (isCaller) {
      sendMissedCall();
    }
    endCall(true);
  };

  const endCall = (forceEnded = false) => {
    if (dataConnRef.current?.open) {
      dataConnRef.current.send({ type: "end-call" });
    }

    setCallState(forceEnded ? "ended" : "idle");
    stopCallTimer();
    setIsMuted(false);
    setIsVideoOff(false);
    setIsCaller(false);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (connRef.current) {
      connRef.current.close();
      connRef.current = null;
    }

    if (incomingCallRef.current) {
      incomingCallRef.current.close();
      incomingCallRef.current = null;
    }

    if (dataConnRef.current) {
      dataConnRef.current.close();
      dataConnRef.current = null;
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

  const sendMissedCall = async () => {
    if (!selectedContact) return;

    const newMessage = {
      id: messages.length + 1,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `Missed call`,
      type: "missedCall",
    };

    try {
      setMessages((prev: any) => [...prev, newMessage]);
      const response = await sendMessage(conversationId, newMessage?.text, newMessage?.type, "");
    } catch (error: any) {
      console.log(error);
    }
    setSending(false);
  };

  const sendCall = async (type: string) => {
    if (!selectedContact) return;

    const newMessage = {
      id: messages.length + 1,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `${type} call`,
      type: `${type}Call`,
    };

    try {
      setMessages((prev: any) => [...prev, newMessage]);
      const response = await sendMessage(conversationId, newMessage?.text, newMessage?.type, "");
    } catch (error: any) {
      console.log(error);
    }
    setSending(false);
  };

  // Render call overlay
  return (
    <PeerContext.Provider
      value={{
        // 📌 State + setters
        selectedContact,
        setSelectedContact,
        sending,
        setSending,
        loggedInUser,
        messages,
        setMessages,
        conversationId,
        setConversationId,
        isCaller,
        setIsCaller,
        caller,
        setCaller,
        callState,
        setCallState,
        callDuration,
        setCallDuration,
        isMuted,
        setIsMuted,
        isVideoOff,
        setIsVideoOff,
        peer,
        setPeer,
        recipientPeerId,
        setRecipientPeerId,
        myPeerId,
        setMyPeerId,
        callerId,
        setCallerId,

        // 📌 Refs
        connRef,
        localVideoRef,
        remoteVideoRef,
        callTimerRef,
        callStartRef,
        localStreamRef,
        incomingCallRef,
        unansweredTimeoutRef,
        dialToneRef,
        ringToneRef,
        dataConnRef,

        // 📌 Functions
        formatCallDuration,
        startCallTimer,
        stopCallTimer,
        handleSignal,
        startAudioCall,
        startVideoCall,
        playRingtone,
        stopDialtone,
        stopRingtone,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleVideo,
        sendMissedCall,
        sendCall,
      }}>
      {children}
      <CallOverlay />
    </PeerContext.Provider>
  );
};

export const usePeerContext = () => {
  const ctx = useContext(PeerContext);
  if (!ctx) throw new Error("usePeerContext must be used within PeerProvider");
  return ctx;
};
