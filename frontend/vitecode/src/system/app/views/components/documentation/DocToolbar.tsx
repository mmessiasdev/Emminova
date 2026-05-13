import React from 'react';
import { cn } from "@app/lib/utils";
import {
  Heading1, Heading2, Heading3, Heading4, Heading5,
  Bold, Italic, List, ListOrdered, Code, FileUp, Youtube,
  Quote, Highlighter, Type, Minus, Info, AlertTriangle, AlertCircle
} from "lucide-react";

interface ToolbarButton {
  icon: React.ReactNode;
  action: () => void;
  label: string;
}

interface DocToolbarProps {
  buttons: ToolbarButton[];
  activeTab: "edit" | "preview" | "simplified";
  onTabChange: (tab: "edit" | "preview" | "simplified") => void;
  className?: string;
}

export const DocToolbar: React.FC<DocToolbarProps> = ({ buttons, activeTab, onTabChange, className }) => {
  return (
    <div className={cn(
      "shrink-0 bg-background/80 backdrop-blur-xl border-b border-border p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-30",
      className
    )}>
      <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl">
        <button
          onClick={() => onTabChange("preview")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeTab === "preview" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Visualizar
        </button>
        <button
          onClick={() => onTabChange("edit")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeTab === "edit" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Editor
        </button>
        <button
          onClick={() => onTabChange("simplified")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeTab === "simplified" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Editor Simplificado
        </button>
      </div>

      {(activeTab === "edit" || activeTab === "simplified") && (
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-secondary/10 rounded-xl">
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-border/50">
            {buttons.slice(0, 5).map((btn, i) => (
              <button key={i} onClick={btn.action} className="p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-foreground" title={btn.label}>{btn.icon}</button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-border/50">
            {buttons.slice(5, 11).map((btn, i) => (
              <button key={i} onClick={btn.action} className="p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-foreground" title={btn.label}>{btn.icon}</button>
            ))}
          </div>
          <div className="flex items-center gap-0.5">
            {buttons.slice(11).map((btn, i) => (
              <button key={i} onClick={btn.action} className="p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-foreground" title={btn.label}>{btn.icon}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
