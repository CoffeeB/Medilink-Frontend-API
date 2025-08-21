"use client"

import type React from "react"
import {useEffect, useState, useRef} from "react"
import {usePathname, useRouter} from "next/navigation"
import {useSocketContext} from "@/context/SocketContextProvider"
import {getStoredUser} from "@/hooks/auth"
import {message} from "@/hooks/messages"
import {ChevronLeft, Printer, Trash2, Paperclip, ImageIcon, Send, Mic} from 'lucide-react'
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"

interface Message {
    id: number
    userId: string
    sender: string
    body: string
    time: string
}

export default function ChatPage() {
    const socket = useSocketContext()
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState<string>("")
    const pathname = usePathname()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [recipient, setRecipient] = useState<{ name: string; role: string } | null>(null)
    const currentUser = getStoredUser()

    // Extract conversation ID from URL
    const conversationId = pathname.substring(pathname.lastIndexOf("/") + 1) || null

    // Fetch messages when component mounts or conversation changes
    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true)
            try {
                const response = await message(conversationId)
                setMessages(response.Messages || [])

                // Set recipient info if available in the response
                if (response.participant) {
                    setRecipient({
                        name: response.participant.firstName + " " + response.participant.lastName,
                        role: response.participant.role ? "Staff" : "Client",
                    })
                } else {
                    setRecipient({name: "Mfoniso Iboikette", role: "Staff"})
                }

                console.log("Fetched messages:", response)
            } catch (error) {
                setError("Failed to fetch messages")
                console.error("Error fetching messages:", error)
            } finally {
                setLoading(false)
            }
        }

        if (conversationId) {
            fetchMessages()
        }
    }, [conversationId])

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages])

    // Listen for new messages from socket
    useEffect(() => {
        if (socket) {
            socket.off("receive_dm") // Clear previous listener
            socket.on("receive_dm", (newMsg) => {
                console.log("Received message:", newMsg)
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: Date.now(),
                        userId: newMsg.userId,
                        sender: newMsg.sender || "Unknown",
                        body: newMsg.message || newMsg.body,
                        time: new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}),
                    },
                ])
            })
        }

        return () => {
            socket?.off("receive_dm")
        }
    }, [socket])

    const sendMessage = async () => {
        if (!newMessage.trim()) return

        if (!currentUser || !currentUser.id) {
            setError("User not found")
            return
        } else if (!socket) {
            setError("Socket not initialized")
            return
        }

        try {
            // Add message to UI immediately for better UX
            const tempMessage = {
                id: Date.now(),
                userId: currentUser.id,
                sender: currentUser.firstName + " " + currentUser.lastName,
                body: newMessage,
                time: new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}),
            }
            setMessages((prev) => [...prev, tempMessage])

            // Send via socket
            socket.emit("send_dm", {
                userId: currentUser.id,
                toUserId: conversationId,
                message: newMessage,
            })

            // Clear input
            setNewMessage("")
        } catch (error) {
            setError("Failed to send message")
            console.error("Error sending message:", error)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const formatTime = (timeString: string) => {
        // If it's already in the right format, return as is
        if (timeString.includes(":") && (timeString.includes("AM") || timeString.includes("PM"))) {
            return timeString
        }

        // Otherwise try to format it
        try {
            const date = new Date(timeString)
            return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
        } catch (e) {
            console.log(e);
            return timeString
        }
    }

    return (
        <div className='container bg-white max-w-[1350px] mx-auto p-6 space-y-6'>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-gray-100">
                        <ChevronLeft className="h-5 w-5"/>
                    </button>
                    <h2 className="text-lg font-medium">{recipient?.name || "Loading..."}</h2>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-none">
                        {recipient?.role || "User"}
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Printer className="h-5 w-5"/>
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Trash2 className="h-5 w-5"/>
                    </button>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 p-4">{error}</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 p-4">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((msg) => {
                        const isCurrentUser = msg.userId === currentUser?.id

                        return (
                            <div key={msg.id} className={`flex ${isCurrentUser ? "justify-end" : ""}`}>
                                {!isCurrentUser && (
                                    <div className="mr-3">
                                        <div className="w-10 h-10 rounded-full bg-red-600 overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/placeholder.svg?height=40&width=40" alt="Avatar"
                                                 className="w-full h-full object-cover"/>
                                        </div>
                                    </div>
                                )}
                                <div className={`max-w-[70%] ${isCurrentUser ? "order-1" : "order-2"}`}>
                                    <div
                                        className={`p-4 rounded-lg ${
                                            isCurrentUser
                                                ? "bg-blue-600 text-white rounded-br-none"
                                                : "bg-gray-100 text-gray-800 rounded-tl-none"
                                        }`}
                                    >
                                        <p className="text-sm">{msg.body}</p>
                                    </div>
                                    <div className={`mt-1 text-xs text-gray-500 ${isCurrentUser ? "text-right" : ""}`}>
                                        {formatTime(msg.time)}
                                    </div>
                                </div>
                                {isCurrentUser && (
                                    <div className="ml-3 order-2">
                                        <div className="w-10 h-10 rounded-full bg-red-600 overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/placeholder.svg?height=40&width=40" alt="Avatar"
                                                 className="w-full h-full object-cover"/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef}/>
            </div>

            {/* Message Input */}
            <div className="border-t p-3 flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Mic className="h-5 w-5"/>
                </button>
                <input
                    type="text"
                    placeholder="Write message"
                    className="flex-1 border-0 focus:ring-0 focus:outline-none text-sm"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Paperclip className="h-5 w-5"/>
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                        <ImageIcon className="h-5 w-5"/>
                    </button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white"
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                    >
                        Send <Send className="h-4 w-4 ml-1"/>
                    </Button>
                </div>
            </div>
        </div>
    )
}
