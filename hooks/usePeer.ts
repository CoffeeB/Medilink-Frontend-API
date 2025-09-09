"use client"

import { useEffect, useRef, useState } from "react"
import Peer, { MediaConnection } from "peerjs"

export function usePeer(userId: string) {
  const [peer, setPeer] = useState<Peer | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const newPeer = new Peer(userId, {
      host: "localhost", // or your deployed server
      port: 9000,
      path: "/myapp" // optional
    })

    // Get local stream (mic/cam)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream
      })

    // Listen for incoming calls
    newPeer.on("call", (call: MediaConnection) => {
      if (localStreamRef.current) {
        call.answer(localStreamRef.current)
      }
      call.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream)
      })
    })

    setPeer(newPeer)

    return () => {
      newPeer.destroy()
    }
  }, [userId])

  const callUser = (remoteId: string) => {
    if (!peer || !localStreamRef.current) return
    const call = peer.call(remoteId, localStreamRef.current)
    call.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream)
    })
  }

  return { peer, callUser, remoteStream, localStream: localStreamRef.current }
}
