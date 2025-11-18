import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mic, FileSearch, FileText } from "lucide-react";
import ChatInterface from "@/components/ai/ChatInterface";
import VoiceAssistant from "@/components/ai/VoiceAssistant";
import DocumentAnalyzer from "@/components/ai/DocumentAnalyzer";
import DocumentGenerator from "@/components/ai/DocumentGenerator";

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
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat AI</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Asystent głosowy</span>
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <FileSearch className="w-4 h-4" />
                <span className="hidden sm:inline">Analiza dokumentów</span>
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Generator dokumentów</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <ChatInterface />
            </TabsContent>

            <TabsContent value="voice">
              <VoiceAssistant />
            </TabsContent>

            <TabsContent value="analyze">
              <DocumentAnalyzer />
            </TabsContent>

            <TabsContent value="generate">
              <DocumentGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIAssistant;