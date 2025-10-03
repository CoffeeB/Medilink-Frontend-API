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
import { usePeerContext } from "@/context/CallProvider";

export default function CallOverlay() {
  const {
    // 📌 State + setters
    selectedContact,
    loggedInUser,
    setMessages,
    conversationId,
    isCaller,
    caller,
    setCaller,
    callState,
    setCallState,
    callDuration,
    isMuted,
    isVideoOff,
    setPeer,
    setRecipientPeerId,
    setMyPeerId,
    callerId,
    setCallerId,

    // 📌 Refs
    localVideoRef,
    remoteVideoRef,
    callTimerRef,
    localStreamRef,
    incomingCallRef,
    dialToneRef,
    ringToneRef,

    // 📌 Functions
    formatCallDuration,
    stopCallTimer,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    sendMissedCall,
  } = usePeerContext();

  // PeerJs Initialization
  useEffect(() => {
    if (!loggedInUser) return; // wait until we have the user

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

  // Initialize ringtone once
  useEffect(() => {
    dialToneRef.current = new Audio("/sounds/dialtone.wav");
    dialToneRef.current.loop = true;

    ringToneRef.current = new Audio("/sounds/ringtone.wav");
    ringToneRef.current.loop = true;
  }, []);

  useEffect(() => {
    if (!callerId && callState !== "audio-calling" && callState !== "video-calling") return;
    const unlock = () => {
      if (ringToneRef.current) {
        const audio = ringToneRef.current;
        audio.muted = true; // play muted first
        audio
          .play()
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false; // unmute for actual use later
            document.removeEventListener("click", unlock);
          })
          .catch((err: any) => console.warn("Unlock failed:", err));
      }
    };

    document.addEventListener("click", unlock);
    return () => document.removeEventListener("click", unlock);
  }, [callerId, callState]);

  // connection check
  useEffect(() => {
    if (callState !== "audio-connected" && callState !== "video-connected") return;

    const timeout = setTimeout(() => {
      // Local tracks
      const localTracks = localStreamRef.current?.getTracks() || [];
      const localHasMedia = localTracks.some((t: any) => t.readyState === "live" && (t.kind === "audio" || t.kind === "video"));

      // Remote tracks from remote video element
      let remoteHasMedia = false;
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject instanceof MediaStream) {
        const remoteTracks = (remoteVideoRef.current.srcObject as MediaStream).getTracks();
        remoteHasMedia = remoteTracks.some((t) => t.readyState === "live" && (t.kind === "audio" || t.kind === "video"));
      }

      if (!localHasMedia || !remoteHasMedia) {
        console.warn("⚠️ Media missing, setting call to 'connecting'...");
        setCallState("connecting");

        // End call after another 10s if media still missing
        setTimeout(() => {
          const stillNoLocal = !(localStreamRef.current?.getTracks() || []).some((t: any) => t.readyState === "live");
          const stillNoRemote = !(remoteVideoRef.current?.srcObject instanceof MediaStream && (remoteVideoRef.current?.srcObject as MediaStream).getTracks().some((t) => t.readyState === "live"));

          if (stillNoLocal || stillNoRemote) {
            console.warn("❌ Ending call: missing microphone/camera after grace period.");
            setCallState("ended");
            endCall(true);
          }
        }, 10000);
      } else {
        console.log("✅ Both peers have active media tracks.");
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [callState]);

  // call state handler
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (callState === "audio-calling" || callState === "video-calling" || callState === "ringing") {
      timeout = setTimeout(() => {
        setCallState("no-answer");
        if (isCaller) {
          sendMissedCall();
        }
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
    if (!callerId) return;
    console.log(callerId);
    const getCallerInfo = async () => {
      try {
        const response = await getProfileById(callerId.split("-")[0]);
        setCaller(response);
      } catch (error) {
        console.log(error);
        endCall(true);
      }
    };

    getCallerInfo();
  }, [callerId]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, []);

  // Render call overlay
  if (callState === "idle") return null;
  if ((callState === "unavailable" && !isCaller) || (callState === "disconnected" && !isCaller)) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center text-white">
      <div className="text-center mb-8">
        <img src={isCaller ? selectedContact?.avatar || "/images/Blank_Profile.jpg" : caller?.avatar || "/images/Blank_Profile.jpg"} alt={isCaller ? selectedContact?.firstname : caller?.firstname} className="w-32 h-32 rounded-full mx-auto mb-4" />
        {/* <h2 className="text-2xl font-semibold mb-2">
            {selectedContact?.firstname} {selectedContact?.lastname}
        </h2> */}
        <h3>
          {isCaller ? selectedContact?.firstname : caller?.firstname} {isCaller ? selectedContact?.lastname : caller?.lastname}
        </h3>
        {callState === "audio-calling" || (callState === "video-calling" && <h3>Calling</h3>)}
        {callState === "audio-connected" || (callState === "video-connected" && <h3>In call</h3>)}
        {callState === "connecting" && <h3>Connecting</h3>}
        {callState === "ended" && <h3>Call disconnected</h3>}
        <p className="text-lg text-white">
          {callState === "ringing" && "Incoming call…"}
          {callState === "audio-connected" && `Audio call • ${formatCallDuration(callDuration)}`}
          {callState === "video-connected" && formatCallDuration(callDuration)}
          {callState === "no-answer" && "Recipient did not pick up"}
          {callState === "unavailable" && "Recipient unavailable"}
          {callState === "disconnected" && "Reconnecting..."}
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
}
