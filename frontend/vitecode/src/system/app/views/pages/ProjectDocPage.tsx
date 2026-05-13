/**
 * VIEW — Project Documentation Page: manages topics → subtopics → contents.
 * Sidebar navigation with a rich Markdown editor.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@app/controllers/AuthController";
import {
  projectApi, topicApi, subtopicApi, contentApi,
  type Project, type Topic, type Subtopic, type Content,
} from "@app/models/api";
import { cn } from "@app/lib/utils";
import { branding } from "@/values/config/branding";
import {
  ArrowLeft, Plus, Loader2, ChevronDown, ChevronRight,
  FileText, FolderOpen, Trash2, Pencil, Save, X, BookOpen,
  Bold, Italic, List, ListOrdered, Code, Image as ImageIcon,
  Link as LinkIcon, Quote, AlertCircle, Heading1, Heading2,
  Heading3, Eye, Type, MessageSquare, AlertTriangle, Info,
  Minus, CheckCircle2, Copy, Highlighter
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from "framer-motion";

const ProjectDocPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enterprise } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Sidebar state
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<number>>(new Set());
  const [subtopicsMap, setSubtopicsMap] = useState<Record<number, Subtopic[]>>({});
  const [contentsMap, setContentsMap] = useState<Record<number, Content[]>>({});

  // Editor state
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inline add forms
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [addSubtopicFor, setAddSubtopicFor] = useState<number | null>(null);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState("");
  const [addContentFor, setAddContentFor] = useState<number | null>(null);
  const [newContentTitle, setNewContentTitle] = useState("");

  // Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const projectId = Number(id);

  const loadProject = useCallback(async () => {
    try {
      const p = await projectApi.getOne(projectId);
      setProject(p);
      const t = await topicApi.getByProject(projectId);
      setTopics(t);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

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

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else { next.add(topicId); loadSubtopics(topicId); }
      return next;
    });
  };

  const toggleSubtopic = (subtopicId: number) => {
    setExpandedSubtopics((prev) => {
      const next = new Set(prev);
      if (next.has(subtopicId)) next.delete(subtopicId);
      else { next.add(subtopicId); loadContents(subtopicId); }
      return next;
    });
  };

  // CRUD handlers
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    const t = await topicApi.create({ title: newTopicTitle.trim(), project: projectId });
    setTopics((prev) => [...prev, t]);
    setNewTopicTitle("");
    setAddTopicOpen(false);
  };

  const handleAddSubtopic = async (e: React.FormEvent, topicId: number) => {
    e.preventDefault();
    if (!newSubtopicTitle.trim()) return;
    const s = await subtopicApi.create({ title: newSubtopicTitle.trim(), topic: topicId });
    setSubtopicsMap((prev) => ({ ...prev, [topicId]: [...(prev[topicId] || []), s] }));
    setNewSubtopicTitle("");
    setAddSubtopicFor(null);
  };

  const handleAddContent = async (e: React.FormEvent, subtopicId: number) => {
    e.preventDefault();
    if (!newContentTitle.trim()) return;
    const c = await contentApi.create({ title: newContentTitle.trim(), body: "", subtopic: subtopicId });
    setContentsMap((prev) => ({ ...prev, [subtopicId]: [...(prev[subtopicId] || []), c] }));
    setNewContentTitle("");
    setAddContentFor(null);
    selectContent(c);
  };

  const selectContent = (c: Content) => {
    setSelectedContent(c);
    setEditTitle(c.title);
    setEditBody(c.body || "");
    setSidebarOpen(false);
    setActiveTab("edit");
  };

  const handleSave = async () => {
    if (!selectedContent) return;
    setSaving(true);
    try {
      const updated = await contentApi.update(selectedContent.id, {
        title: editTitle,
        body: editBody,
      });
      setSelectedContent(updated);
      // Update in map
      if (selectedContent.subtopic) {
        const subId = typeof selectedContent.subtopic === "object"
          ? selectedContent.subtopic.id
          : (selectedContent as any).subtopic;
        setContentsMap((prev) => ({
          ...prev,
          [subId]: (prev[subId] || []).map((c) => (c.id === updated.id ? updated : c)),
        }));
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm("Excluir este tópico e todos os seus subtópicos?")) return;
    await topicApi.remove(topicId);
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  const handleDeleteSubtopic = async (subtopicId: number, topicId: number) => {
    if (!confirm("Excluir este subtópico e todos os seus conteúdos?")) return;
    await subtopicApi.remove(subtopicId);
    setSubtopicsMap((prev) => ({
      ...prev,
      [topicId]: (prev[topicId] || []).filter((s) => s.id !== subtopicId),
    }));
  };

  const handleDeleteContent = async (contentId: number, subtopicId: number) => {
    if (!confirm("Excluir este conteúdo?")) return;
    await contentApi.remove(contentId);
    setContentsMap((prev) => ({
      ...prev,
      [subtopicId]: (prev[subtopicId] || []).filter((c) => c.id !== contentId),
    }));
    if (selectedContent?.id === contentId) setSelectedContent(null);
  };

  // Editor Toolbar Helpers
  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = editBody.substring(start, end) || placeholder;
    const newText = editBody.substring(0, start) + before + selected + after + editBody.substring(end);
    setEditBody(newText);

    // Reset focus and selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + before.length, start + before.length + selected.length);
      }
    }, 0);
  };

  const toolbarButtons = [
    { icon: <Heading1 size={16} />, action: () => insertText("# ", ""), label: "H1" },
    { icon: <Heading2 size={16} />, action: () => insertText("## ", ""), label: "H2" },
    { icon: <Heading3 size={16} />, action: () => insertText("### ", ""), label: "H3" },
    { icon: <Bold size={16} />, action: () => insertText("**", "**", "negrito"), label: "Negrito" },
    { icon: <Italic size={16} />, action: () => insertText("_", "_", "itálico"), label: "Itálico" },
    { icon: <List size={16} />, action: () => insertText("- ", ""), label: "Lista" },
    { icon: <ListOrdered size={16} />, action: () => insertText("1. ", ""), label: "Lista Numerada" },
    { icon: <Code size={16} />, action: () => insertText("```javascript\n", "\n```", "código aqui"), label: "Bloco de Código" },
    { icon: <LinkIcon size={16} />, action: () => insertText("[", "](url)", "link"), label: "Link" },
    { icon: <ImageIcon size={16} />, action: () => insertText("![", "](url_da_imagem)", "descrição"), label: "Imagem" },
    { icon: <Quote size={16} />, action: () => insertText("> ", ""), label: "Citação" },
    { icon: <Highlighter size={16} />, action: () => insertText("<mark>", "</mark>", "destaque"), label: "Grifar" },
    { icon: <Minus size={16} />, action: () => insertText("\n---\n", ""), label: "Divisor" },
    { icon: <Info size={16} />, action: () => insertText("\n:::info\n", "\n:::", "Informação relevante aqui"), label: "Aviso Info" },
    { icon: <AlertTriangle size={16} />, action: () => insertText("\n:::warning\n", "\n:::", "Cuidado necessário aqui"), label: "Aviso Warning" },
    { icon: <AlertCircle size={16} />, action: () => insertText("\n:::danger\n", "\n:::", "Erro ou Perigo aqui"), label: "Aviso Danger" },
    { icon: <MessageSquare size={16} />, action: () => insertText("@", ""), label: "Menção" },
  ];

  // Markdown Custom Components
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={match[1]}
          PreTag="div"
          className="rounded-xl my-4"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={cn("bg-secondary px-1.5 py-0.5 rounded-md text-primary font-mono text-[0.9em]", className)} {...props}>
          {children}
        </code>
      )
    },
    // Custom Alert Renderers (we'll use a hacky way since standard markdown doesn't have ::: syntax)
    // Actually, we can just look for text patterns or use a remark plugin if we were more advanced.
    // For now, let's just use standard blocks and maybe custom tags.
    p: ({ children }: any) => {
      const content = String(children);
      if (typeof children === 'string' || (Array.isArray(children) && typeof children[0] === 'string')) {
        const text = Array.isArray(children) ? children.join('') : children;
        if (text.startsWith(':::info')) return <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 my-4 rounded-r-xl flex gap-3"><Info className="text-blue-500 shrink-0" size={20} /> <div className="text-sm">{text.replace(':::info', '').replace(':::', '')}</div></div>;
        if (text.startsWith(':::warning')) return <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 my-4 rounded-r-xl flex gap-3"><AlertTriangle className="text-amber-500 shrink-0" size={20} /> <div className="text-sm">{text.replace(':::warning', '').replace(':::', '')}</div></div>;
        if (text.startsWith(':::danger')) return <div className="bg-red-500/10 border-l-4 border-red-500 p-4 my-4 rounded-r-xl flex gap-3"><AlertCircle className="text-red-500 shrink-0" size={20} /> <div className="text-sm">{text.replace(':::danger', '').replace(':::', '')}</div></div>;
      }
      return <p className="mb-4 leading-relaxed">{children}</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/app")}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <img src={branding.logo} alt={branding.name} className="h-6 object-contain" />
            <span className="text-muted-foreground">/</span>
            <BookOpen className="w-4 h-4 text-primary" />
            <h1 className="text-sm font-semibold truncate max-w-[150px] md:max-w-none">
              {project?.name || "Projeto"}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
             {selectedContent && (
               <button
                onClick={handleSave}
                disabled={saving}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-glow"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3" /> Salvar</>}
              </button>
             )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "w-72 border-r border-border bg-card flex-shrink-0 overflow-y-auto transition-transform duration-300",
            "fixed md:relative inset-y-0 left-0 z-40 md:z-0 pt-14 md:pt-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documentação</h2>
              <button
                onClick={() => setAddTopicOpen(true)}
                className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Novo tópico"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Topic Form */}
            <AnimatePresence>
              {addTopicOpen && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddTopic}
                  className="mb-3 flex gap-2 overflow-hidden"
                >
                  <input
                    type="text"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="Nome do tópico"
                    autoFocus
                    className="flex-1 h-8 px-2 rounded-lg bg-secondary/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <button type="submit" className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => setAddTopicOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary/50">
                    <X className="w-3 h-3" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Topic Tree */}
            <div className="space-y-1">
              {topics.map((topic) => (
                <div key={topic.id}>
                  {/* Topic */}
                  <div className={cn(
                    "group flex items-center gap-1 py-1.5 px-2 rounded-lg transition-colors",
                    expandedTopics.has(topic.id) ? "bg-secondary/30" : "hover:bg-secondary/50"
                  )}>
                    <button onClick={() => toggleTopic(topic.id)} className="shrink-0">
                      {expandedTopics.has(topic.id)
                        ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                    </button>
                    <button onClick={() => toggleTopic(topic.id)} className="flex-1 text-left text-sm font-medium truncate">
                      {topic.title}
                    </button>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={() => { setAddSubtopicFor(topic.id); setExpandedTopics((p) => new Set(p).add(topic.id)); loadSubtopics(topic.id); }}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground" title="Adicionar subtópico"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Excluir"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Subtopics */}
                  {expandedTopics.has(topic.id) && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-4 border-l border-border pl-2 space-y-0.5 mt-1"
                    >
                      {/* Add Subtopic Form */}
                      {addSubtopicFor === topic.id && (
                        <form onSubmit={(e) => handleAddSubtopic(e, topic.id)} className="flex gap-1 py-1">
                          <input
                            type="text"
                            value={newSubtopicTitle}
                            onChange={(e) => setNewSubtopicTitle(e.target.value)}
                            placeholder="Subtópico"
                            autoFocus
                            className="flex-1 h-7 px-2 rounded-md bg-secondary/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                          <button type="submit" className="p-1 rounded bg-primary text-primary-foreground"><Plus className="w-3 h-3" /></button>
                          <button type="button" onClick={() => setAddSubtopicFor(null)} className="p-1 rounded hover:bg-secondary/50"><X className="w-3 h-3" /></button>
                        </form>
                      )}

                      {(subtopicsMap[topic.id] || []).map((sub) => (
                        <div key={sub.id}>
                          <div className={cn(
                            "group flex items-center gap-1 py-1 px-2 rounded-md transition-colors",
                            expandedSubtopics.has(sub.id) ? "bg-secondary/20" : "hover:bg-secondary/50"
                          )}>
                            <button onClick={() => toggleSubtopic(sub.id)} className="shrink-0">
                              {expandedSubtopics.has(sub.id)
                                ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                            </button>
                            <button onClick={() => toggleSubtopic(sub.id)} className="flex-1 text-left text-xs text-muted-foreground hover:text-foreground truncate">
                              {sub.title}
                            </button>
                            <div className="hidden group-hover:flex items-center gap-0.5">
                              <button
                                onClick={() => { setAddContentFor(sub.id); setExpandedSubtopics((p) => new Set(p).add(sub.id)); loadContents(sub.id); }}
                                className="p-0.5 rounded hover:bg-secondary text-muted-foreground" title="Novo conteúdo"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubtopic(sub.id, topic.id)}
                                className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Excluir"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Contents */}
                          {expandedSubtopics.has(sub.id) && (
                            <div className="ml-4 border-l border-border/50 pl-2 space-y-0.5 mt-0.5">
                              {addContentFor === sub.id && (
                                <form onSubmit={(e) => handleAddContent(e, sub.id)} className="flex gap-1 py-1">
                                  <input
                                    type="text"
                                    value={newContentTitle}
                                    onChange={(e) => setNewContentTitle(e.target.value)}
                                    placeholder="Título"
                                    autoFocus
                                    className="flex-1 h-6 px-2 rounded text-xs bg-secondary/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
                                  />
                                  <button type="submit" className="p-0.5 rounded bg-primary text-primary-foreground"><Plus className="w-3 h-3" /></button>
                                  <button type="button" onClick={() => setAddContentFor(null)} className="p-0.5 rounded hover:bg-secondary/50"><X className="w-3 h-3" /></button>
                                </form>
                              )}

                              {(contentsMap[sub.id] || []).map((content) => (
                                <button
                                  key={content.id}
                                  onClick={() => selectContent(content)}
                                  className={cn(
                                    "group/c w-full flex items-center gap-1.5 py-1 px-2 rounded text-xs transition-all",
                                    selectedContent?.id === content.id
                                      ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[1px]"
                                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                  )}
                                >
                                  <FileText className="w-3 h-3 shrink-0" />
                                  <span className="truncate flex-1 text-left">{content.title}</span>
                                  <span
                                    onClick={(e) => { e.stopPropagation(); handleDeleteContent(content.id, sub.id); }}
                                    className="hidden group-hover/c:block p-0.5 rounded hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}

              {topics.length === 0 && !addTopicOpen && (
                <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-2xl mt-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    Sem documentação
                  </p>
                  <button
                    onClick={() => setAddTopicOpen(true)}
                    className="text-xs text-primary font-semibold mt-3 hover:underline"
                  >
                    Criar primeiro tópico
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-background/40 overflow-hidden relative">
          {selectedContent ? (
            <>
              {/* Editor Toolbar & Tabs */}
              <div className="bg-card border-b border-border p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-20">
                <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl">
                   <button
                    onClick={() => setActiveTab("edit")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      activeTab === "edit" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Pencil size={14} /> Editor
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      activeTab === "preview" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Eye size={14} /> Visualizar
                  </button>
                </div>

                {activeTab === "edit" && (
                  <div className="flex flex-wrap items-center gap-1">
                    {toolbarButtons.map((btn, i) => (
                      <button
                        key={i}
                        onClick={btn.action}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        title={btn.label}
                      >
                        {btn.icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit / Preview Container */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                   <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-3xl font-black bg-transparent border-none outline-none placeholder:text-muted-foreground/30 mb-8"
                    placeholder="Sem título"
                  />

                  {activeTab === "edit" ? (
                    <div className="flex-1 flex flex-col">
                      <textarea
                        ref={textareaRef}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        placeholder="Comece a documentar... markdown e blocos de aviso (:::info) suportados."
                        className="flex-1 w-full bg-transparent border-none outline-none text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/20 font-mono resize-none min-h-[500px]"
                      />
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-1 prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-2xl prose-pre:bg-transparent prose-pre:p-0"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents as any}
                      >
                        {editBody || "*Conteúdo vazio.*"}
                      </ReactMarkdown>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Floating Save Hint */}
              <AnimatePresence>
                {!saving && selectedContent.body !== editBody && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-6 right-6 hidden md:flex items-center gap-3 bg-card border border-border p-3 rounded-2xl shadow-2xl z-50"
                  >
                    <span className="text-xs text-muted-foreground">Alterações não salvas</span>
                    <button
                      onClick={handleSave}
                      className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-glow"
                    >
                      Salvar agora
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                <FileText className="w-10 h-10 text-primary/40 relative z-10" />
              </div>
              <h3 className="text-xl font-bold">Nenhum conteúdo selecionado</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-2">
                Navegue pelos tópicos na barra lateral ou crie uma nova página de documentação para começar.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectDocPage;
