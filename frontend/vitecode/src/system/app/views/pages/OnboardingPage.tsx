/**
 * VIEW — Onboarding page: Create Profile → Create Enterprise (step wizard).
 * Shown after registration when user has no profile/enterprise yet.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@app/controllers/AuthController";
import { profileApi, enterpriseApi, uploadApi } from "@app/models/api";
import { cn } from "@app/lib/utils";
import { branding } from "@/values/config/branding";
import { User, Building2, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Upload, Camera } from "lucide-react";

type Step = "profile" | "enterprise" | "done";

const OnboardingPage = () => {
  const { user, setProfile, setEnterprise, refreshEnterprise } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<Step>("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const inviteId = queryParams.get("invite");

  // Profile fields
  const [fullname, setFullname] = useState("");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");

  // Enterprise fields
  const [enterpriseName, setEnterpriseName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [createdProfileId, setCreatedProfileId] = useState<number | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);
    try {
      const profile = await profileApi.create({
        fullname,
        email: profileEmail,
        user: user.id,
        ...(inviteId ? { father: parseInt(inviteId, 10) } : {})
      });
      setProfile(profile);
      setCreatedProfileId(profile.id);
      
      if (inviteId) {
        await refreshEnterprise();
        setStep("done");
        setTimeout(() => navigate("/app"), 1500);
      } else {
        setStep("enterprise");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdProfileId) return;
    setError("");
    setLoading(true);
    try {
      let logoId = null;
      if (logoFile) {
        // We need uploadApi from @app/models/api, let's import it if not imported
        const uploaded = await uploadApi.upload(logoFile);
        logoId = uploaded.id;
      }

      const enterprise = await enterpriseApi.create({
        name: enterpriseName,
        profile: createdProfileId,
        ...(logoId ? { logo: logoId } : {})
      } as any);
      setEnterprise(enterprise);
      setStep("done");
      setTimeout(() => navigate("/app"), 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao criar empresa.");
    } finally {
      setLoading(false);
    }
  };

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Perfil", icon: <User className="w-4 h-4" /> },
    { key: "enterprise", label: "Empresa", icon: <Building2 className="w-4 h-4" /> },
    { key: "done", label: "Pronto", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <div data-lenis-prevent className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <img src={branding.logo} alt={branding.name} className="h-9 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight">Configurar sua conta</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Complete as informações abaixo para começar.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, idx) => (
            <React.Fragment key={s.key}>
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  idx <= currentIdx
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn("h-px w-8", idx < currentIdx ? "bg-primary" : "bg-border")} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}

          {/* STEP 1: Profile */}
          {step === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Seu Perfil</h2>
                  <p className="text-xs text-muted-foreground">Informações pessoais</p>
                </div>
              </div>

              <div>
                <label htmlFor="ob-fullname" className="block text-sm font-medium mb-1.5">
                  Nome completo
                </label>
                <input
                  id="ob-fullname"
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="ob-email" className="block text-sm font-medium mb-1.5">
                  E-mail de contato
                </label>
                <input
                  id="ob-email"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="contato@empresa.com"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Próximo <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* STEP 2: Enterprise */}
          {step === "enterprise" && (
            <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Sua Empresa</h2>
                  <p className="text-xs text-muted-foreground">Informações da organização</p>
                </div>
              </div>

              <div>
                <label htmlFor="ob-enterprise-name" className="block text-sm font-medium mb-1.5">
                  Nome da empresa
                </label>
                <input
                  id="ob-enterprise-name"
                  type="text"
                  value={enterpriseName}
                  onChange={(e) => setEnterpriseName(e.target.value)}
                  placeholder="Minha Empresa Ltda"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Logo da empresa (opcional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl border border-dashed border-border bg-secondary/50 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
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
                  <div className="text-xs text-muted-foreground">
                    <p>Recomendado: 512x512px</p>
                    <p>Formatos: PNG, JPG, SVG</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("profile")}
                  className="flex-1 h-11 rounded-xl border border-border text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-secondary/50 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finalizar <CheckCircle2 className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Done */}
          {step === "done" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Tudo pronto!</h2>
              <p className="text-muted-foreground text-sm">
                Redirecionando para o painel...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
