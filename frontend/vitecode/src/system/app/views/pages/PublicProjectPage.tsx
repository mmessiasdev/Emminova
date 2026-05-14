import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, BookOpen, ChevronRight, Menu, Moon, Sun, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { MarkdownRenderer } from "@app/views/components/documentation/MarkdownRenderer";
import { request } from "@app/models/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";

interface Content {
  id: number;
  title: string;
  body: string;
}

interface Subtopic {
  id: number;
  title: string;
  contents: Content[];
}

interface Topic {
  id: number;
  title: string;
  subtopics: Subtopic[];
}

interface Project {
  id: number;
  name: string;
  is_public: boolean;
  enterprise?: {
    name: string;
    logo?: { url: string };
  };
  topics: Topic[];
}

const PublicProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeContent, setActiveContent] = useState<Content | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchPublicProject = async () => {
      try {
        setLoading(true);
        // Call the public backend endpoint
        const res = await fetch(`${API_URL}/projects/public/${id}`);
        if (!res.ok) {
          throw new Error("Projeto não encontrado ou é privado.");
        }
        const data = await res.json();
        setProject(data);
        
        // Auto-select first content
        if (data.topics && data.topics.length > 0) {
          for (const topic of data.topics) {
            if (topic.subtopics && topic.subtopics.length > 0) {
              for (const subtopic of topic.subtopics) {
                if (subtopic.contents && subtopic.contents.length > 0) {
                  setActiveContent(subtopic.contents[0]);
                  return; // Break out once found
                }
              }
            }
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPublicProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold mb-2">Acesso Negado</h1>
        <p className="text-muted-foreground max-w-md">
          {error || "Este projeto é privado ou não existe."}
        </p>
      </div>
    );
  }

  return (
    <div data-lenis-prevent className="flex h-screen bg-background overflow-hidden text-foreground selection:bg-primary/30">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-border gap-3">
          {project.enterprise?.logo ? (
            <img 
              src={project.enterprise.logo.url.startsWith('http') ? project.enterprise.logo.url : `${API_URL}${project.enterprise.logo.url}`}
              alt="Logo"
              className="h-8 w-8 object-cover rounded-md"
            />
          ) : (
            <div className="h-8 w-8 bg-primary/10 text-primary rounded-md flex items-center justify-center font-bold">
              {project.enterprise?.name?.[0] || 'D'}
            </div>
          )}
          <div className="overflow-hidden">
            <h2 className="text-sm font-semibold truncate">{project.enterprise?.name || 'Documentação'}</h2>
            <p className="text-xs text-muted-foreground truncate">{project.name}</p>
          </div>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {project.topics?.map((topic) => (
            <div key={topic.id} className="mb-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {topic.title}
              </h3>
              <div className="space-y-4">
                {topic.subtopics?.map((subtopic) => (
                  <div key={subtopic.id}>
                    <h4 className="text-[13px] font-semibold text-foreground/80 mb-1 px-3">
                      {subtopic.title}
                    </h4>
                    <div className="space-y-0.5">
                      {subtopic.contents?.map((content) => (
                        <button
                          key={content.id}
                          onClick={() => {
                            setActiveContent(content);
                            setSidebarOpen(false);
                          }}
                          className={`
                            w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-all flex items-center gap-2
                            ${activeContent?.id === content.id 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"}
                          `}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${activeContent?.id === content.id ? "bg-primary" : "bg-transparent"}`} />
                          <span className="truncate">{content.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 shrink-0 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-8 z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-secondary text-muted-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden md:flex items-center text-sm text-muted-foreground">
              <span className="truncate max-w-[150px]">{project.name}</span>
              <ChevronRight className="w-4 h-4 mx-1" />
              {activeContent && (
                <span className="text-foreground font-medium truncate max-w-[200px]">{activeContent.title}</span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
            title="Alternar Tema"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Documentation Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
            {activeContent ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-foreground tracking-tight">
                  {activeContent.title}
                </h1>
                <MarkdownRenderer content={activeContent.body} />
              </div>
            ) : (
              <div className="text-center py-20 flex flex-col items-center">
                <BookOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-bold mb-2">Bem-vindo à Documentação</h2>
                <p className="text-muted-foreground">Selecione um tópico no menu lateral para começar a ler.</p>
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  );
};

export default PublicProjectPage;
