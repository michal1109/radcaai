import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ConversationHistory from "@/components/ConversationHistory";
import ChatInterface from "@/components/ai/ChatInterface";
import SubscriptionManager from "@/components/SubscriptionManager";

import DocumentAnalyzer from "@/components/ai/DocumentAnalyzer";
import DocumentGenerator from "@/components/ai/DocumentGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIAssistant = () => {
  const [user, setUser] = useState<any>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "chat";
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Wylogowano",
      description: "Do zobaczenia!",
    });
    navigate("/");
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setSidebarOpen(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <div className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Papuga AI - Asystent Prawny
            </h1>
            <p className="text-muted-foreground mt-1">
              Zadawaj pytania, analizuj dokumenty i generuj pisma prawne
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <span>⚠️</span>
              Informacje mają charakter edukacyjny i nie zastępują porady prawnika
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Wyloguj
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - History & Subscription */}
          <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:col-span-1 space-y-4 overflow-y-auto`}>
            <SubscriptionManager />
            <ConversationHistory
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              currentConversationId={currentConversationId}
            />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs defaultValue={defaultTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="chat">Czat AI</TabsTrigger>
                <TabsTrigger value="analyze">Analiza</TabsTrigger>
                <TabsTrigger value="generate">Generuj</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="h-[calc(100%-60px)]">
                <ChatInterface
                  conversationId={currentConversationId}
                  onConversationCreated={setCurrentConversationId}
                />
              </TabsContent>

              <TabsContent value="analyze" className="h-[calc(100%-60px)]">
                <DocumentAnalyzer />
              </TabsContent>

              <TabsContent value="generate" className="h-[calc(100%-60px)]">
                <DocumentGenerator />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AIAssistant;
