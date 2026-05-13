/**
 * VIEW — Dashboard: Lists projects, allows creating new ones.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@app/controllers/AuthController";
import { projectApi, type Project } from "@app/models/api";
import { cn } from "@app/lib/utils";
import { branding } from "@/values/config/branding";
import {
  Plus, FolderKanban, LogOut, Loader2, Search, Building2, ChevronRight
} from "lucide-react";

const DashboardPage = () => {
  const { user, profile, enterprise, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // New project form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!enterprise) return;
    try {
      const data = await projectApi.getByEnterprise(enterprise.id);
      setProjects(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [enterprise]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enterprise || !newName.trim()) return;
    setCreating(true);
    try {
      const p = await projectApi.create({ name: newName.trim(), enterprise: enterprise.id });
      setProjects((prev) => [...prev, p]);
      setNewName("");
      setShowNewForm(false);
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!enterprise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nenhuma empresa configurada</h2>
          <button
            onClick={() => navigate("/app/onboarding")}
            className="mt-4 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            Configurar agora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={branding.logo} alt={branding.name} className="h-7 object-contain" />
            <div className="border-l border-border pl-3">
              <h1 className="text-sm font-semibold leading-none">{enterprise.name}</h1>
              <p className="text-xs text-muted-foreground">{profile?.fullname}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Projetos</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie e documente seus projetos.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar projeto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo</span>
            </button>
          </div>
        </div>

        {/* New Project Form */}
        {showNewForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 p-4 bg-card border border-border rounded-2xl flex flex-col sm:flex-row gap-3 items-end"
          >
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-1.5">Nome do projeto</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Emmibot, EmmiERP..."
                required
                autoFocus
                className="w-full h-10 px-4 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 sm:flex-none h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
              </button>
            </div>
          </form>
        )}

        {/* Project Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FolderKanban className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              {search ? "Nenhum projeto encontrado" : "Nenhum projeto ainda"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? "Tente outro termo de busca." : "Crie seu primeiro projeto para começar a documentar."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/app/project/${project.id}`)}
                className="group text-left p-5 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique para gerenciar documentação
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
