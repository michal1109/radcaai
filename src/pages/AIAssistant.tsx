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
import KnowledgeBase from "@/components/legal/KnowledgeBase";
import TermsAcceptance from "@/components/legal/TermsAcceptance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIAssistant = () => {
  const [user, setUser] = useState<any>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "chat";
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check localStorage for terms acceptance
    const accepted = localStorage.getItem("radcaai_terms_accepted");
    if (accepted === "true") {
      setTermsAccepted(true);
    }
  }, []);

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

  const handleTermsAccepted = () => {
    localStorage.setItem("radcaai_terms_accepted", "true");
    setTermsAccepted(true);
  };

  const lawyerLinks = [
    { name: "Znajdź adwokata (NRA)", url: "https://www.adwokatura.pl/znajdz-adwokata/" },
    { name: "Znajdź radcę (KIRP)", url: "https://rejestr.kirp.pl/home" },
  ];

  if (!user) return null;

  if (!termsAccepted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 container mx-auto px-4 py-8 mt-20 flex items-center justify-center">
          <TermsAcceptance onAccept={handleTermsAccepted} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <div className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              RadcaAI
            </h1>
            <p className="text-muted-foreground mt-1">
              System wsparcia informacyjnego o polskim prawie
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>ℹ️</span>
              Informacje mają charakter edukacyjny i nie stanowią porady prawnej
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lawyerLinks.map((link) => (
              <Button
                key={link.name}
                variant="outline"
                size="sm"
                asChild
                className="hidden md:flex gap-1"
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                  {link.name}
                </a>
              </Button>
            ))}
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
              <span className="hidden sm:inline">Wyloguj</span>
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
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="chat">Czat AI</TabsTrigger>
                <TabsTrigger value="analyze">Analiza</TabsTrigger>
                <TabsTrigger value="generate">Generuj</TabsTrigger>
                <TabsTrigger value="knowledge">Baza Wiedzy</TabsTrigger>
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

              <TabsContent value="knowledge" className="h-[calc(100%-60px)] overflow-y-auto">
                <KnowledgeBase />
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
