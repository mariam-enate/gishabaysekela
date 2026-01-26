import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageCircle,
  Send,
  Pencil,
  Trash2,
  X,
  Check,
  ArrowLeft,
  MoreVertical,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

export default function ChatPage() {
  const { user, profile, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages and profiles separately
  const { data: messages, isLoading } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: async () => {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id, user_id, message, created_at')
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;
      if (!messagesData || messagesData.length === 0) return [];

      const userIds = [...new Set(messagesData.map((m) => m.user_id))];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map<string, string>();
      (profilesData || []).forEach((p: Profile) => {
        profileMap.set(p.id, p.full_name);
      });

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
          event: '*',
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

  // Auto-scroll to bottom
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const { error } = await supabase
        .from('chat_messages')
        .update({ message })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingId(null);
      setEditingText('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      toast({ title: 'Message updated' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('chat_messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      toast({ title: 'Message deleted' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('chat_messages').delete().neq('id', '');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      toast({ title: 'Chat history cleared' });
      setClearDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to clear chat',
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

  const handleEditSave = () => {
    if (!editingId || !editingText.trim()) return;
    updateMutation.mutate({ id: editingId, message: editingText.trim() });
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

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container py-8 flex-1 flex flex-col">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 gap-2 self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-info/10">
              <Users className="h-8 w-8 text-info" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Member Chat</h1>
          <p className="text-muted-foreground">
            Connect with fellow students from Gish Abay Sekela
          </p>
        </div>

        {/* Chat Card - Centered and Spacious */}
        <Card className="flex-1 flex flex-col max-w-4xl mx-auto w-full min-h-[500px] border-2 border-info/20 bg-gradient-to-br from-info/5 to-transparent">
          <CardHeader className="border-b bg-info/5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-info">
                <MessageCircle className="h-5 w-5" />
                Group Chat
              </CardTitle>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setClearDialogOpen(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-0 min-h-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading messages...</p>
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
                          className={`flex items-start gap-3 group ${
                            isOwn ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback
                              className={
                                isOwn
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary text-secondary-foreground'
                              }
                            >
                              {msg.sender_name ? getInitials(msg.sender_name) : '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                            <p
                              className={`text-xs mb-1 ${isOwn ? 'text-right' : ''} text-muted-foreground`}
                            >
                              {isOwn ? 'You' : msg.sender_name || 'Unknown'}
                            </p>
                            {editingId === msg.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="min-w-[200px]"
                                  autoFocus
                                />
                                <Button size="icon" variant="ghost" onClick={handleEditSave}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingId(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div
                                  className={`rounded-2xl px-4 py-3 ${
                                    isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                  }`}
                                >
                                  <p className="text-sm">{msg.message}</p>
                                </div>
                                {(isOwn || isAdmin) && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                                      {isOwn && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setEditingId(msg.id);
                                            setEditingText(msg.message);
                                          }}
                                        >
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                      )}
                                      {isAdmin && (
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => deleteMutation.mutate(msg.id)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            )}
                            <p
                              className={`mt-1 text-xs text-muted-foreground ${isOwn ? 'text-right' : ''}`}
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
                <div className="flex h-full items-center justify-center py-16">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                </div>
              )}
            </ScrollArea>

            <form onSubmit={handleSubmit} className="border-t p-4 flex-shrink-0 bg-background">
              <div className="flex gap-3">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 text-base"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || sendMutation.isPending}
                  className="h-10 w-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all chat messages?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all chat messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearAllMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
