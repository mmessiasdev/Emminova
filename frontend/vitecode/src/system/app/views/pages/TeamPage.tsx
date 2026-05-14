/**
 * VIEW — Team Management Page: Manage enterprise profiles.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@app/controllers/AuthController";
import { profileApi, type Profile } from "@app/models/api";
import { branding } from "@/values/config/branding";
import { ArrowLeft, Loader2, Users, Plus, Mail, Shield, User, Copy, CheckCircle2, Pencil, X, Lock, Trash2 } from "lucide-react";
import { AppHeader } from "@app/views/components/AppHeader";

const TeamPage = () => {
  const { enterprise, profile } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // New member form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPermission, setNewPermission] = useState("collaborator");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Invite link logic
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/register?invite=${profile?.id}`;

  // Edit member logic
  const [editingMember, setEditingMember] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPermission, setEditPermission] = useState("collaborator");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");
  
  // Delete logic
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadTeam = useCallback(async () => {
    try {
      const data = await profileApi.getAll();
      setTeam(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    setCreating(true);
    setError("");
    try {
      const p = await profileApi.createDependent({
        fullname: newName.trim(),
        email: newEmail.trim(),
        permission: newPermission,
        password: newPassword.trim() || undefined
      });
      setTeam((prev) => [...prev, p]);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewPermission("collaborator");
      setShowNewForm(false);
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar membro.");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (member: Profile) => {
    setEditingMember(member);
    setEditName(member.fullname);
    setEditEmail(member.email);
    setEditPassword("");
    setEditPermission(member.permission || "collaborator");
    setEditError("");
    setShowNewForm(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editName.trim() || !editEmail.trim()) return;
    setUpdating(true);
    setEditError("");
    try {
      const data: any = {
        fullname: editName.trim(),
        email: editEmail.trim(),
        permission: editPermission
      };
      if (editPassword.trim()) {
        data.password = editPassword.trim();
      }
      
      const p = await profileApi.update(editingMember.id, data);
      setTeam((prev) => prev.map(m => m.id === p.id ? p : m));
      setEditingMember(null);
    } catch (err: any) {
      setEditError(err.message || "Erro ao atualizar membro.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este membro e todo o seu acesso? Esta ação não pode ser desfeita.")) return;
    setDeletingId(id);
    try {
      await profileApi.delete(id);
      setTeam((prev) => prev.filter(m => m.id !== id));
      if (editingMember?.id === id) setEditingMember(null);
    } catch (err: any) {
      alert(err.message || "Erro ao excluir membro.");
    } finally {
      setDeletingId(null);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!enterprise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div data-lenis-prevent className="min-h-screen bg-background">
      <AppHeader showBack backPath="/app" title="Equipe" icon={Users} />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Gestão de Equipe</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie quem tem acesso à empresa <strong>{enterprise.name}</strong>.
            </p>
          </div>

          <button
            onClick={() => setShowNewForm(true)}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shrink-0 shadow-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Membro</span>
          </button>
        </div>

        {/* Invite Link Info */}
        {/* <div className="mb-8 p-4 bg-secondary/30 border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Link de Convite</h3>
            <p className="text-xs text-muted-foreground">Envie este link para que novos membros se cadastrem e sejam vinculados automaticamente à empresa.</p>
          </div>
          <button 
            onClick={copyInviteLink}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-all shrink-0"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado!" : "Copiar Link"}
          </button>
        </div> */}

        {/* New Member Form */}
        {showNewForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 p-6 bg-card border border-border rounded-2xl shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Novo Membro</h3>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-1.5">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="João da Silva"
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="joao@exemplo.com"
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1.5">Permissão</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={newPermission}
                    onChange={(e) => setNewPermission(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                  >
                    <option value="collaborator">Colaborador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1.5">Senha (Opcional)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Deixe em branco para invite"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="h-10 px-4 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creating}
                className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
              </button>
            </div>
          </form>
        )}

        {/* Edit Member Form */}
        {editingMember && (
          <form
            onSubmit={handleUpdate}
            className="mb-8 p-6 bg-card border border-border rounded-2xl shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Editar Membro</h3>
              <button type="button" onClick={() => setEditingMember(null)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground"><X className="w-5 h-5"/></button>
            </div>
            
            {editError && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                {editError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-1.5">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1.5">Permissão</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={editPermission}
                    onChange={(e) => setEditPermission(e.target.value)}
                    disabled={editingMember.permission === 'owner'}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="collaborator">Colaborador</option>
                    <option value="admin">Administrador</option>
                    {editingMember.permission === 'owner' && <option value="owner">Dono</option>}
                  </select>
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1.5">Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Manter atual"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="h-10 px-4 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updating}
                className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
              </button>
            </div>
          </form>
        )}

        {/* Team List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : team.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">Nenhum membro encontrado</h3>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {team.map((member) => (
                <div key={member.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold text-sm">
                        {member.fullname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        {member.fullname}
                        {member.id === profile?.id && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Você</span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-secondary text-xs font-medium text-muted-foreground">
                      {member.permission === 'owner' ? 'Dono' : member.permission === 'admin' ? 'Admin' : 'Colaborador'}
                    </span>
                    {(profile?.permission === 'owner' || profile?.permission === 'admin') && member.id !== profile?.id && (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEdit(member)}
                          className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                          title="Editar membro"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          disabled={deletingId === member.id}
                          className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground disabled:opacity-50"
                          title="Excluir membro"
                        >
                          {deletingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamPage;
