import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mic, FileSearch, FileText } from "lucide-react";
import ChatInterface from "@/components/ai/ChatInterface";
import DocumentTools from "@/components/ai/DocumentTools";

const AIAssistant = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url('/src/assets/feathers-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Navigation />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center space-y-2 backdrop-blur-sm bg-background/80 rounded-lg p-6">
            <h1 className="text-4xl font-bold text-foreground">Asystent Prawny AI</h1>
            <p className="text-muted-foreground text-lg">
              Twój inteligentny pomocnik w sprawach prawnych
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Asystent AI</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Dokumenty prawne</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <ChatInterface />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentTools />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIAssistant;