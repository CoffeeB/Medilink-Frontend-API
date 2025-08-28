// components/ContactModal.tsx
"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Contact {
  id: number;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
  avatar?: string;
  online?: boolean;
  isGroup?: boolean;
}

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

export default function ContactModal({ open, onClose, contacts, onSelectContact }: ContactModalProps) {
  const [search, setSearch] = useState("");

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full rounded-2xl p-0">
        <DialogHeader className="flex justify-between items-center px-4 py-3 border-b">
          <DialogTitle className="text-lg font-semibold">New Chat</DialogTitle>
          <button onClick={onClose} className=" rounded hover:bg-gray-100">
            {/* <X className="w-5 h-5" /> */}
          </button>
        </DialogHeader>

        {/* Search Bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none focus:ring-0 shadow-none"
          />
        </div>

        {/* Contact List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onSelectContact(contact); // Trigger handler
                  onClose(); // Close modal after selecting
                }}
              >
                <Avatar>
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                </div>
                {contact.online && (
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                )}
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-500 text-center">No contacts found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
