import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@app/controllers/AuthController";
import {
  projectApi, topicApi, subtopicApi, contentApi, uploadApi,
  type Project, type Topic, type Subtopic, type Content,
} from "@app/models/api";
import { cn, extractYouTubeId } from "@app/lib/utils";
import { branding } from "@/values/config/branding";
import {
  ArrowLeft, Loader2, Save, BookOpen, Eye, FolderOpen, FileText, Pencil,
  Heading1, Heading2, Heading3, Heading4, Heading5, Bold, Italic, List, ListOrdered, Code,
  Youtube, Quote, Highlighter, Type, Minus, Info, AlertTriangle, AlertCircle, Sun, Moon, Globe, Copy, CheckCircle2, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { AppHeader } from "@app/views/components/AppHeader";

import { DocSidebar } from "../components/documentation/DocSidebar";
import { DocToolbar } from "../components/documentation/DocToolbar";
import { MarkdownRenderer } from "../components/documentation/MarkdownRenderer";
import { SimplifiedWysiwyg } from "../components/documentation/SimplifiedWysiwyg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";

const ProjectDocPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enterprise } = useAuth();
  const { theme, setTheme } = useTheme();

  const [project, setProject] = useState<Project | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation State
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<number>>(new Set());
  const [subtopicsMap, setSubtopicsMap] = useState<Record<number, Subtopic[]>>({});
  const [contentsMap, setContentsMap] = useState<Record<number, Content[]>>({});

  // Editor State
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "simplified">("preview"); // Starts with preview as requested
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectId = Number(id);

  const loadProject = useCallback(async () => {
    try {
      const p = await projectApi.getOne(projectId);
      setProject(p);
      const t = await topicApi.getByProject(projectId);
      setTopics(t);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { loadProject(); }, [loadProject]);

  const [copiedLink, setCopiedLink] = useState(false);
  const publicLink = `${window.location.origin}/docs/${project?.id}`;

  const togglePublic = async () => {
    if (!project) return;
    try {
      const updated = await projectApi.update(project.id, { is_public: !project.is_public });
      setProject(updated);
    } catch (err: any) {
      alert("Erro ao alterar visibilidade: " + err.message);
    }
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const [deletingProject, setDeletingProject] = useState(false);
  const handleDeleteProject = async () => {
    if (!project) return;
    if (!window.confirm("Tem certeza que deseja excluir este projeto inteiro? Esta ação apagará permanentemente todos os tópicos, subtópicos, conteúdos e imagens atreladas a este projeto. NÃO há como desfazer.")) return;
    
    try {
      setDeletingProject(true);
      await projectApi.remove(project.id);
      navigate("/app");
    } catch (err: any) {
      alert("Erro ao excluir projeto: " + err.message);
      setDeletingProject(false);
    }
  };

  const loadSubtopics = async (topicId: number) => {
    if (subtopicsMap[topicId]) return;
    const subs = await subtopicApi.getByTopic(topicId);
    setSubtopicsMap((prev) => ({ ...prev, [topicId]: subs }));
  };

  const loadContents = async (subtopicId: number) => {
    if (contentsMap[subtopicId]) return;
    const cs = await contentApi.getBySubtopic(subtopicId);
    setContentsMap((prev) => ({ ...prev, [subtopicId]: cs }));
  };

  // Handlers for Sidebar
  const handleAddTopic = async (title: string) => {
    const t = await topicApi.create({ title, project: projectId });
    setTopics((prev) => [...prev, t]);
  };

  const handleAddSubtopic = async (topicId: number, title: string) => {
    const s = await subtopicApi.create({ title, topic: topicId });
    setSubtopicsMap((prev) => ({ ...prev, [topicId]: [...(prev[topicId] || []), s] }));
  };

  const handleAddContent = async (subtopicId: number, title: string) => {
    const c = await contentApi.create({ title, body: "", subtopic: subtopicId });
    setContentsMap((prev) => ({ ...prev, [subtopicId]: [...(prev[subtopicId] || []), c] }));
    selectContent(c);
  };

  const selectContent = (c: Content) => {
    setSelectedContent(c);
    setEditTitle(c.title);
    setEditBody(c.body || "");
    setSidebarOpen(false);
    setActiveTab("preview"); // Default to preview when selecting as well
  };

  const handleSave = async () => {
    if (!selectedContent) return;
    setSaving(true);
    try {
      const updated = await contentApi.update(selectedContent.id, { title: editTitle, body: editBody });
      setSelectedContent(updated);
      const subId = typeof updated.subtopic === "object" ? updated.subtopic.id : (updated as any).subtopic;
      setContentsMap((prev) => ({
        ...prev,
        [subId]: (prev[subId] || []).map((c) => (c.id === updated.id ? updated : c)),
      }));
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm("Excluir este tópico?")) return;
    await topicApi.remove(topicId);
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  const handleDeleteSubtopic = async (subId: number, topicId: number) => {
    if (!confirm("Excluir este subtópico?")) return;
    await subtopicApi.remove(subId);
    setSubtopicsMap((prev) => ({ ...prev, [topicId]: (prev[topicId] || []).filter((s) => s.id !== subId) }));
  };

  const handleDeleteContent = async (contentId: number, subtopicId: number) => {
    if (!confirm("Excluir conteúdo?")) return;
    await contentApi.remove(contentId);
    setContentsMap((prev) => ({ ...prev, [subtopicId]: (prev[subtopicId] || []).filter((c) => c.id !== contentId) }));
    if (selectedContent?.id === contentId) setSelectedContent(null);
  };

  // Editor Actions
  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    if (activeTab === "simplified") {
      const textToInsert = before + placeholder + after;
      import("marked").then(({ marked }) => {
        let html = marked.parse(textToInsert, { async: false }) as string;
        // Append a break so the user can type after the inserted block
        html += "<p><br></p>";
        document.execCommand("insertHTML", false, html);
      });
      return;
    }

    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = editBody.substring(start, end) || placeholder;
    const newText = editBody.substring(0, start) + before + selected + after + editBody.substring(end);
    setEditBody(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + before.length, start + before.length + selected.length);
      }
    }, 0);
  };

  const handleAction = (cmd: string, markdownBefore: string, markdownAfter = "", markdownPlaceholder = "", value?: string) => {
    if (activeTab === "simplified") {
      document.execCommand(cmd, false, value);
    } else {
      insertText(markdownBefore, markdownAfter, markdownPlaceholder);
    }
  };

  const toolbarButtons = [
    { icon: <Heading1 size={16} />, action: () => handleAction("formatBlock", "# ", "", "", "H1"), label: "H1" },
    { icon: <Heading2 size={16} />, action: () => handleAction("formatBlock", "## ", "", "", "H2"), label: "H2" },
    { icon: <Heading3 size={16} />, action: () => handleAction("formatBlock", "### ", "", "", "H3"), label: "H3" },
    { icon: <Heading4 size={16} />, action: () => handleAction("formatBlock", "#### ", "", "", "H4"), label: "H4" },
    { icon: <Heading5 size={16} />, action: () => handleAction("formatBlock", "##### ", "", "", "H5"), label: "H5" },
    { icon: <Bold size={16} />, action: () => handleAction("bold", "**", "**", "negrito"), label: "Negrito" },
    { icon: <Italic size={16} />, action: () => handleAction("italic", "_", "_", "itálico"), label: "Itálico" },
    { icon: <List size={16} />, action: () => handleAction("insertUnorderedList", "- ", ""), label: "Lista" },
    { icon: <ListOrdered size={16} />, action: () => handleAction("insertOrderedList", "1. ", ""), label: "Lista Numerada" },
    { icon: <Code size={16} />, action: () => insertText("```\n", "\n```", "código aqui"), label: "Código" },
    { icon: <Quote size={16} />, action: () => insertText("> ", ""), label: "Citação" },
    { icon: <Highlighter size={16} />, action: () => insertText("==", "==", "destaque"), label: "Destacar" },
    { icon: <Type size={16} />, action: () => insertText("###### ", "", "Texto menor"), label: "Texto Menor" },
    { icon: <Minus size={16} />, action: () => insertText("\n---\n", ""), label: "Divisor" },
    { icon: <Info size={16} />, action: () => insertText("\n:::info\n", "\n:::\n", "Informação"), label: "Aviso Info" },
    { icon: <AlertTriangle size={16} />, action: () => insertText("\n:::warning\n", "\n:::\n", "Atenção"), label: "Aviso Atenção" },
    { icon: <AlertCircle size={16} />, action: () => insertText("\n:::danger\n", "\n:::\n", "Perigo"), label: "Aviso Perigo" },
    { icon: <FileText size={16} />, action: () => fileInputRef.current?.click(), label: "Arquivo" },
    { icon: <Youtube size={16} />, action: () => { const url = prompt("Link Youtube:"); if (url) insertText(`<youtube id="${extractYouTubeId(url)}"></youtube>`); }, label: "YouTube" },
    { icon: <Save size={16} />, action: handleSave, label: "Salvar" }
  ].map(b => ({ ...b, icon: b.icon }));

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div data-lenis-prevent className="h-screen bg-background flex flex-col overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const uploaded = await uploadApi.upload(file);
        const url = uploaded.url.startsWith("http") ? uploaded.url : `${API_URL}${uploaded.url}`;
        insertText(file.type.startsWith("image/") ? `![${file.name}](${url})` : `[📄 ${file.name}](${url})`);
      }} className="hidden" />

      {/* Main Header */}
      <AppHeader 
        showBack
        title={project?.name}
        icon={BookOpen}
        fullWidth
        compact
        rightActions={
          <>
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <button
                onClick={handleDeleteProject}
                disabled={deletingProject}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors mr-1"
                title="Excluir Projeto Permanentemente"
              >
                {deletingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={togglePublic}
                className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium transition-colors border ${
                  project?.is_public 
                    ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20" 
                    : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                }`}
                title={project?.is_public ? "Projeto Público" : "Projeto Privado"}
              >
                <Globe className="w-3.5 h-3.5" />
                {project?.is_public ? "Público" : "Privado"}
              </button>
              
              {project?.is_public && (
                <button
                  onClick={copyPublicLink}
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium bg-secondary text-foreground border border-border hover:bg-secondary/80 transition-colors"
                  title="Copiar Link Público"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden md:inline">{copiedLink ? "Copiado" : "Link"}</span>
                </button>
              )}
            </div>
            
            <div className="w-px h-5 bg-border mx-1"></div>

            {selectedContent && (
              <button onClick={handleSave} disabled={saving} className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-glow">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3" /> Salvar</>}
              </button>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg hover:bg-secondary/50"><FolderOpen className="w-4 h-4" /></button>
          </>
        }
      />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <DocSidebar
          topics={topics}
          expandedTopics={expandedTopics}
          expandedSubtopics={expandedSubtopics}
          subtopicsMap={subtopicsMap}
          contentsMap={contentsMap}
          selectedContent={selectedContent}
          sidebarOpen={sidebarOpen}
          onToggleTopic={(id) => {
            setExpandedTopics(prev => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id); else { next.add(id); loadSubtopics(id); }
              return next;
            });
          }}
          onToggleSubtopic={(id) => {
            setExpandedSubtopics(prev => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id); else { next.add(id); loadContents(id); }
              return next;
            });
          }}
          onSelectContent={selectContent}
          onAddTopic={handleAddTopic}
          onAddSubtopic={handleAddSubtopic}
          onAddContent={handleAddContent}
          onDeleteTopic={handleDeleteTopic}
          onDeleteSubtopic={handleDeleteSubtopic}
          onDeleteContent={handleDeleteContent}
        />

        <AnimatePresence>
          {sidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
        </AnimatePresence>

        <main className="flex-1 flex flex-col bg-background/40 overflow-hidden relative min-h-0">
          {selectedContent ? (
            <>
              <DocToolbar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                buttons={toolbarButtons as any}
              />

              <div data-lenis-prevent className="flex-1 overflow-y-auto min-h-0 p-4 md:p-8">
                <div className="max-w-4xl mx-auto min-h-full flex flex-col">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-3xl font-black bg-transparent border-none outline-none placeholder:text-muted-foreground/30 mb-8 shrink-0"
                    placeholder="Sem título"
                  />

                  {activeTab === "preview" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
                      <MarkdownRenderer content={editBody} />
                    </motion.div>
                  )}

                  {activeTab === "edit" && (
                    <div className="flex-1 flex flex-col min-h-[500px]">
                      <textarea
                        ref={textareaRef}
                        data-lenis-prevent
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        placeholder="Edite o markdown..."
                        className="flex-1 w-full bg-transparent border-none outline-none text-sm leading-relaxed font-mono resize-none"
                      />
                    </div>
                  )}

                  {activeTab === "simplified" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-6 py-2 px-4 bg-primary/10 border border-primary/20 rounded-2xl text-[11px] text-primary font-medium w-fit shadow-glow">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Editor Inteligente: O que você vê é o que você tem (WYSIWYG)
                      </div>
                      <SimplifiedWysiwyg
                        markdown={editBody}
                        onChange={setEditBody}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Floating Save Hint */}
              <AnimatePresence>
                {selectedContent.body !== editBody && !saving && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 hidden md:flex items-center gap-3 bg-card border border-border p-3 rounded-2xl shadow-2xl z-50">
                    <span className="text-xs text-muted-foreground">Alterações não salvas</span>
                    <button onClick={handleSave} className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-glow">Salvar agora</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <FileText className="w-10 h-10 text-primary/20 mb-4" />
              <h3 className="text-xl font-bold">Nenhum conteúdo selecionado</h3>
              <p className="text-sm text-muted-foreground mt-2">Escolha uma página na barra lateral.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectDocPage;
