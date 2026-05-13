/**
 * VIEW — Project Documentation Page: manages topics → subtopics → contents.
 * Sidebar navigation with content editor.
 */

import React, { useState, useEffect, useCallback } from "react";
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
  FileText, FolderOpen, Trash2, Pencil, Save, X, BookOpen
} from "lucide-react";

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

  // Selected content for editing
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

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
    await topicApi.remove(topicId);
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  const handleDeleteSubtopic = async (subtopicId: number, topicId: number) => {
    await subtopicApi.remove(subtopicId);
    setSubtopicsMap((prev) => ({
      ...prev,
      [topicId]: (prev[topicId] || []).filter((s) => s.id !== subtopicId),
    }));
  };

  const handleDeleteContent = async (contentId: number, subtopicId: number) => {
    await contentApi.remove(contentId);
    setContentsMap((prev) => ({
      ...prev,
      [subtopicId]: (prev[subtopicId] || []).filter((c) => c.id !== contentId),
    }));
    if (selectedContent?.id === contentId) setSelectedContent(null);
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
            <h1 className="text-sm font-semibold">{project?.name || "Projeto"}</h1>
          </div>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
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
            {addTopicOpen && (
              <form onSubmit={handleAddTopic} className="mb-3 flex gap-2">
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
              </form>
            )}

            {/* Topic Tree */}
            <div className="space-y-1">
              {topics.map((topic) => (
                <div key={topic.id}>
                  {/* Topic */}
                  <div className="group flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
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
                    <div className="ml-4 border-l border-border pl-2 space-y-0.5">
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
                          <div className="group flex items-center gap-1 py-1 px-2 rounded-md hover:bg-secondary/50 transition-colors">
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
                            <div className="ml-4 border-l border-border/50 pl-2 space-y-0.5">
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
                                    "group/c w-full flex items-center gap-1.5 py-1 px-2 rounded text-xs transition-colors",
                                    selectedContent?.id === content.id
                                      ? "bg-primary/10 text-primary font-medium"
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
                    </div>
                  )}
                </div>
              ))}

              {topics.length === 0 && !addTopicOpen && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Nenhum tópico ainda.<br />Clique no + acima para criar.
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {selectedContent ? (
            <div className="max-w-4xl mx-auto p-6 md:p-10">
              {/* Title */}
              <div className="mb-6">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl md:text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
                  placeholder="Título do conteúdo"
                />
              </div>

              {/* Body (textarea editor) */}
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={20}
                placeholder="Escreva o conteúdo da documentação aqui... (Markdown suportado)"
                className="w-full bg-transparent border border-border rounded-xl p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[300px]"
              />

              {/* Save */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
              <div className="text-center">
                <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Selecione um conteúdo
                </h3>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Escolha um item da barra lateral ou crie um novo.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectDocPage;
