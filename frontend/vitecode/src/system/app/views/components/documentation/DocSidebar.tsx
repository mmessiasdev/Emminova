import React, { useState } from 'react';
import { cn } from "@app/lib/utils";
import {
  Plus, X, ChevronDown, ChevronRight, FileText, Trash2, FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Topic, Subtopic, Content } from "@app/models/api";

interface DocSidebarProps {
  topics: Topic[];
  expandedTopics: Set<number>;
  expandedSubtopics: Set<number>;
  subtopicsMap: Record<number, Subtopic[]>;
  contentsMap: Record<number, Content[]>;
  selectedContent: Content | null;
  sidebarOpen: boolean;
  onToggleTopic: (id: number) => void;
  onToggleSubtopic: (id: number) => void;
  onSelectContent: (content: Content) => void;
  onAddTopic: (title: string) => Promise<void>;
  onAddSubtopic: (topicId: number, title: string) => Promise<void>;
  onAddContent: (subtopicId: number, title: string) => Promise<void>;
  onDeleteTopic: (id: number) => Promise<void>;
  onDeleteSubtopic: (subId: number, topicId: number) => Promise<void>;
  onDeleteContent: (contentId: number, subtopicId: number) => Promise<void>;
}

export const DocSidebar: React.FC<DocSidebarProps> = ({
  topics, expandedTopics, expandedSubtopics, subtopicsMap, contentsMap,
  selectedContent, sidebarOpen, onToggleTopic, onToggleSubtopic, onSelectContent,
  onAddTopic, onAddSubtopic, onAddContent, onDeleteTopic, onDeleteSubtopic, onDeleteContent
}) => {
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [addSubtopicFor, setAddSubtopicFor] = useState<number | null>(null);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState("");
  const [addContentFor, setAddContentFor] = useState<number | null>(null);
  const [newContentTitle, setNewContentTitle] = useState("");

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    await onAddTopic(newTopicTitle.trim());
    setNewTopicTitle("");
    setAddTopicOpen(false);
  };

  const handleAddSubtopic = async (e: React.FormEvent, topicId: number) => {
    e.preventDefault();
    if (!newSubtopicTitle.trim()) return;
    await onAddSubtopic(topicId, newSubtopicTitle.trim());
    setNewSubtopicTitle("");
    setAddSubtopicFor(null);
  };

  const handleAddContent = async (e: React.FormEvent, subtopicId: number) => {
    e.preventDefault();
    if (!newContentTitle.trim()) return;
    await onAddContent(subtopicId, newContentTitle.trim());
    setNewContentTitle("");
    setAddContentFor(null);
  };

  return (
    <aside
      data-lenis-prevent
      className={cn(
        "w-72 border-r border-border bg-card flex-shrink-0 overflow-y-auto transition-transform duration-300 min-h-0",
        "fixed md:relative inset-y-0 left-0 z-40 md:z-0 md:translate-x-0 pt-14 md:pt-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documentação</h2>
          <button
            onClick={() => setAddTopicOpen(true)}
            className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

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

        <div className="space-y-1">
          {topics.map((topic) => (
            <div key={topic.id}>
              <div className={cn(
                "group flex items-center gap-1 py-1.5 px-2 rounded-lg transition-colors",
                expandedTopics.has(topic.id) ? "bg-secondary/30" : "hover:bg-secondary/50"
              )}>
                <button onClick={() => onToggleTopic(topic.id)} className="shrink-0">
                  {expandedTopics.has(topic.id) ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                </button>
                <button onClick={() => onToggleTopic(topic.id)} className="flex-1 text-left text-sm font-medium truncate">
                  {topic.title}
                </button>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button onClick={() => { setAddSubtopicFor(topic.id); if (!expandedTopics.has(topic.id)) onToggleTopic(topic.id); }} className="p-1 rounded hover:bg-secondary text-muted-foreground"><Plus className="w-3 h-3" /></button>
                  <button onClick={() => onDeleteTopic(topic.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>

              {expandedTopics.has(topic.id) && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="ml-4 border-l border-border pl-2 space-y-0.5 mt-1">
                  {addSubtopicFor === topic.id && (
                    <form onSubmit={(e) => handleAddSubtopic(e, topic.id)} className="flex gap-1 py-1">
                      <input type="text" value={newSubtopicTitle} onChange={(e) => setNewSubtopicTitle(e.target.value)} placeholder="Subtópico" autoFocus className="flex-1 h-7 px-2 rounded-md bg-secondary/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary/50" />
                      <button type="submit" className="p-1 rounded bg-primary text-primary-foreground"><Plus className="w-3 h-3" /></button>
                      <button type="button" onClick={() => setAddSubtopicFor(null)} className="p-1 rounded hover:bg-secondary/50"><X className="w-3 h-3" /></button>
                    </form>
                  )}
                  {(subtopicsMap[topic.id] || []).map((sub) => (
                    <div key={sub.id}>
                      <div className={cn("group flex items-center gap-1 py-1 px-2 rounded-md transition-colors", expandedSubtopics.has(sub.id) ? "bg-secondary/20" : "hover:bg-secondary/50")}>
                        <button onClick={() => onToggleSubtopic(sub.id)} className="shrink-0">
                          {expandedSubtopics.has(sub.id) ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                        </button>
                        <button onClick={() => onToggleSubtopic(sub.id)} className="flex-1 text-left text-xs text-muted-foreground hover:text-foreground truncate">{sub.title}</button>
                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button onClick={() => { setAddContentFor(sub.id); if (!expandedSubtopics.has(sub.id)) onToggleSubtopic(sub.id); }} className="p-0.5 rounded hover:bg-secondary text-muted-foreground"><Plus className="w-3 h-3" /></button>
                          <button onClick={() => onDeleteSubtopic(sub.id, topic.id)} className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                      {expandedSubtopics.has(sub.id) && (
                        <div className="ml-4 border-l border-border/50 pl-2 space-y-0.5 mt-0.5">
                          {addContentFor === sub.id && (
                            <form onSubmit={(e) => handleAddContent(e, sub.id)} className="flex gap-1 py-1">
                              <input type="text" value={newContentTitle} onChange={(e) => setNewContentTitle(e.target.value)} placeholder="Título" autoFocus className="flex-1 h-6 px-2 rounded text-xs bg-secondary/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary/50" />
                              <button type="submit" className="p-0.5 rounded bg-primary text-primary-foreground"><Plus className="w-3 h-3" /></button>
                              <button type="button" onClick={() => setAddContentFor(null)} className="p-0.5 rounded hover:bg-secondary/50"><X className="w-3 h-3" /></button>
                            </form>
                          )}
                          {(contentsMap[sub.id] || []).map((content) => (
                            <button
                              key={content.id}
                              onClick={() => onSelectContent(content)}
                              className={cn(
                                "group/c w-full flex items-center gap-1.5 py-1 px-2 rounded text-xs transition-all",
                                selectedContent?.id === content.id
                                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[1px]"
                                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                              )}
                            >
                              <FileText className="w-3 h-3 shrink-0" />
                              <span className="truncate flex-1 text-left">{content.title}</span>
                              <span onClick={(e) => { e.stopPropagation(); onDeleteContent(content.id, sub.id); }} className="hidden group-hover/c:block p-0.5 rounded hover:bg-destructive/10 hover:text-destructive cursor-pointer">
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
        </div>
      </div>
    </aside>
  );
};
