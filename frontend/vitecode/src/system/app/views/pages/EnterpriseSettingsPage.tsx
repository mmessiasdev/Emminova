/**
 * VIEW — Enterprise Settings Page: Edit enterprise details and logo.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@app/controllers/AuthController";
import { enterpriseApi, uploadApi } from "@app/models/api";
import { branding } from "@/values/config/branding";
import { ArrowLeft, Loader2, Save, Building2, Camera, Building } from "lucide-react";
import { AppHeader } from "@app/views/components/AppHeader";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";

const EnterpriseSettingsPage = () => {
  const { enterprise, setEnterprise } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState(enterprise?.name || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (enterprise) {
      setName(enterprise.name);
      if (enterprise.logo) {
        const url = enterprise.logo.url.startsWith("http")
          ? enterprise.logo.url
          : `${API_URL}${enterprise.logo.url}`;
        setLogoPreview(url);
      }
    }
  }, [enterprise]);

  if (!enterprise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let logoId = null;
      if (logoFile) {
        const uploaded = await uploadApi.upload(logoFile);
        logoId = uploaded.id;
      }

      const updateData: any = { name };
      if (logoId) {
        updateData.logo = logoId;
      }

      const updatedEnterprise = await enterpriseApi.update(enterprise.id, updateData);
      setEnterprise(updatedEnterprise);
      setSuccess(true);

      // Clear file since it's uploaded
      setLogoFile(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar empresa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-lenis-prevent className="min-h-screen bg-background">
      <AppHeader showBack backPath="/app" title="Configurações da Empresa" icon={Building} />

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Informações da Organização</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Atualize o nome e a logomarca da sua empresa.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 rounded-lg bg-green-500/10 text-green-500 text-sm border border-green-500/20 font-medium">
              Empresa atualizada com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Logomarca
              </label>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-secondary/30 flex items-center justify-center overflow-hidden group">
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Camera className="w-6 h-6 mb-1" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Upload de nova imagem</p>
                  <p>Recomendado: 512x512px (Quadrado)</p>
                  <p>Formatos suportados: PNG, JPG, SVG</p>
                  <p>Tamanho máximo: 2MB</p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="ent-name" className="block text-sm font-medium mb-1.5">
                Nome da empresa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  id="ent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome oficial ou fantasia"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={loading || (!logoFile && name === enterprise.name)}
                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-glow"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EnterpriseSettingsPage;
