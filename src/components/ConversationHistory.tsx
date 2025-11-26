import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, MessageSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

interface ConversationHistoryProps {
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  currentConversationId: string | null;
}

const ConversationHistory = ({
  onSelectConversation,
  onNewConversation,
  currentConversationId,
}: ConversationHistoryProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się załadować historii rozmów",
        variant: "destructive",
      });
      return;
    }

    setConversations(data || []);
  };

  useEffect(() => {
    loadConversations();

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć rozmowy",
        variant: "destructive",
      });
      return;
    }

    if (currentConversationId === conversationId) {
      onNewConversation();
    }

    toast({
      title: "Usunięto",
      description: "Rozmowa została usunięta",
    });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b space-y-3">
        <Button onClick={onNewConversation} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Nowa rozmowa
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Szukaj rozmów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Brak rozmów
            </p>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group p-3 rounded-lg cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                  currentConversationId === conv.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-accent"
                }`}
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.updated_at).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 flex-shrink-0"
                  onClick={(e) => handleDelete(conv.id, e)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ConversationHistory;
