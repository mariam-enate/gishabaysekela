import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
}

interface Profile {
  id: string;
  full_name: string;
}

export function ChatSection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages and profiles separately to avoid foreign key issues
  const { data: messages, isLoading } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: async () => {
      // First fetch all messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id, user_id, message, created_at')
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;
      if (!messagesData || messagesData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(messagesData.map((m) => m.user_id))];

      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Create a map for quick lookup
      const profileMap = new Map<string, string>();
      (profilesData || []).forEach((p: Profile) => {
        profileMap.set(p.id, p.full_name);
      });

      // Combine messages with sender names
      return messagesData.map((msg) => ({
        ...msg,
        sender_name: profileMap.get(msg.user_id) || 'Unknown',
      })) as ChatMessage[];
    },
    enabled: !!user,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const { error } = await supabase.from('chat_messages').insert({
        user_id: user!.id,
        message: messageText,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader className="border-b bg-info/5">
        <CardTitle className="flex items-center gap-2 text-info">
          <MessageCircle className="h-5 w-5" />
          Member Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading messages...</p>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isOwn = msg.user_id === user?.id;
                const showDate =
                  index === 0 ||
                  formatDate(msg.created_at) !==
                    formatDate(messages[index - 1].created_at);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="my-4 flex items-center justify-center">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex items-start gap-3 ${
                        isOwn ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
                        >
                          {msg.sender_name
                            ? getInitials(msg.sender_name)
                            : '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`max-w-[70%] ${
                          isOwn ? 'items-end' : 'items-start'
                        }`}
                      >
                        <p
                          className={`text-xs mb-1 ${
                            isOwn ? 'text-right' : ''
                          } text-muted-foreground`}
                        >
                          {isOwn ? 'You' : msg.sender_name || 'Unknown'}
                        </p>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <p
                          className={`mt-1 text-xs text-muted-foreground ${
                            isOwn ? 'text-right' : ''
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!message.trim() || sendMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}