import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, ExternalLink, Search, Briefcase, TrendingUp, X } from "lucide-react";

const STATUSES = [
  { key: "aplicado", label: "Aplicado", color: "#5B7B9A" },
  { key: "entrevista", label: "Entrevista", color: "#C9982E" },
  { key: "teste", label: "Teste técnico", color: "#8B6BAE" },
  { key: "oferta", label: "Oferta", color: "#4C8C5B" },
  { key: "rejeitado", label: "Rejeitado", color: "#B0554A" },
];

const STORAGE_KEY = "rastreador-vagas:jobs";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function emptyForm() {
  return { empresa: "", cargo: "", link: "", status: "aplicado", data: new Date().toISOString().slice(0, 10), notas: "" };
}

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [filter, setFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) setJobs(JSON.parse(res.value));
      } catch (e) {
        // no data yet
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(next) {
    setJobs(next);
    try {
      const res = await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
      setSaveError(!res);
    } catch (e) {
      setSaveError(true);
    }
  }

  function addJob(e) {
    e.preventDefault();
    if (!form.empresa.trim() || !form.cargo.trim()) return;
    const next = [{ ...form, id: uid() }, ...jobs];
    persist(next);
    setForm(emptyForm());
    setShowForm(false);
  }

  function updateStatus(id, status) {
    persist(jobs.map((j) => (j.id === id ? { ...j, status } : j)));
  }

  function removeJob(id) {
    persist(jobs.filter((j) => j.id !== id));
  }

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchesStatus = filter === "todos" || j.status === filter;
      const q = query.toLowerCase();
      const matchesQuery = !q || j.empresa.toLowerCase().includes(q) || j.cargo.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [jobs, filter, query]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const entrevistas = jobs.filter((j) => j.status === "entrevista" || j.status === "teste" || j.status === "oferta").length;
    const ofertas = jobs.filter((j) => j.status === "oferta").length;
    const taxa = total ? Math.round((entrevistas / total) * 100) : 0;
    return { total, entrevistas, ofertas, taxa };
  }, [jobs]);

  return (
    <div style={{ fontFamily: "'Iowan Old Style', 'Georgia', serif", background: "#EEF1EC", minHeight: "100%", color: "#20261F", padding: "32px 20px" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .card { animation: fadeIn 0.25s ease; }
        input, textarea, select { font-family: 'Helvetica Neue', Arial, sans-serif; }
        button { font-family: 'Helvetica Neue', Arial, sans-serif; cursor: pointer; }
        ::placeholder { color: #8A9285; }
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>Trilha de candidaturas</h1>
            <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", color: "#5C6656", fontSize: 14, margin: "4px 0 0" }}>
              Cada vaga é um passo. Registre, acompanhe, avance.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#20261F", color: "#EEF1EC", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 600 }}
          >
            <Plus size={16} /> Nova vaga
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, margin: "24px 0" }}>
          <StatCard icon={<Briefcase size={16} />} label="Candidaturas" value={stats.total} />
          <StatCard icon={<TrendingUp size={16} />} label="Em andamento" value={stats.entrevistas} />
          <StatCard icon={<TrendingUp size={16} />} label="Ofertas" value={stats.ofertas} accent="#4C8C5B" />
          <StatCard icon={<TrendingUp size={16} />} label="Taxa de resposta" value={`${stats.taxa}%`} />
        </div>

        {saveError && (
          <div style={{ background: "#F6E3DF", color: "#8A3B2E", padding: "8px 12px", borderRadius: 6, fontSize: 13, marginBottom: 16, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
            Não consegui salvar agora. Tente novamente em instantes.
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #D6DBCF", borderRadius: 8, padding: "8px 12px", flex: "1 1 200px" }}>
            <Search size={15} color="#8A9285" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por empresa ou cargo"
              style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent" }}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ border: "1px solid #D6DBCF", borderRadius: 8, padding: "9px 10px", fontSize: 13, background: "#fff" }}
          >
            <option value="todos">Todos os status</option>
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <p style={{ color: "#8A9285", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14 }}>Carregando...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#8A9285", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
            <p style={{ fontSize: 15, margin: 0 }}>
              {jobs.length === 0 ? "Nenhuma vaga registrada ainda. Toda trilha começa com o primeiro passo." : "Nenhuma vaga corresponde ao filtro."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((job) => {
              const statusInfo = STATUSES.find((s) => s.key === job.status);
              return (
                <div key={job.id} className="card" style={{ background: "#fff", border: "1px solid #E1E5DA", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusInfo.color, flexShrink: 0 }} />
                      <strong style={{ fontSize: 16 }}>{job.cargo}</strong>
                    </div>
                    <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: "#5C6656", margin: "4px 0 0 16px" }}>
                      {job.empresa} · {new Date(job.data + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                    {job.notas && (
                      <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: "#3A4133", margin: "6px 0 0 16px" }}>{job.notas}</p>
                    )}
                    {job.link && (
                      <a href={job.link} target="_blank" rel="noreferrer" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: "#5B7B9A", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, marginLeft: 16, textDecoration: "none" }}>
                        Ver vaga <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <select
                      value={job.status}
                      onChange={(e) => updateStatus(job.id, e.target.value)}
                      style={{ border: "1px solid #D6DBCF", borderRadius: 6, padding: "6px 8px", fontSize: 12, background: "#fff" }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeJob(job.id)}
                      style={{ background: "transparent", border: "none", color: "#B0554A", padding: 6, borderRadius: 6, display: "flex" }}
                      aria-label="Remover"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(32,38,31,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 10 }}>
          <form onSubmit={addJob} style={{ background: "#fff", borderRadius: 12, padding: 24, width: "100%", maxWidth: 420, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 19, margin: 0 }}>Nova candidatura</h2>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <Field label="Empresa">
              <input required value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Cargo">
              <input required value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Link da vaga (opcional)">
              <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} style={inputStyle} placeholder="https://..." />
            </Field>
            <div style={{ display: "flex", gap: 10 }}>
              <Field label="Status" style={{ flex: 1 }}>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                  {STATUSES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Data" style={{ flex: 1 }}>
                <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} style={inputStyle} />
              </Field>
            </div>
            <Field label="Notas (opcional)">
              <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
            </Field>
            <button type="submit" style={{ width: "100%", background: "#20261F", color: "#EEF1EC", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 600, marginTop: 8 }}>
              Adicionar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, accent = "#20261F" }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5DA", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8A9285", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, color: accent, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <label style={{ display: "block", fontSize: 12, color: "#5C6656", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #D6DBCF",
  borderRadius: 7,
  padding: "8px 10px",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
};
