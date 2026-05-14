import { useState, useMemo } from "react";
import { S, B } from "../styles";
import { api, setToken } from "../api";
import GranotecLogo from "./GranotecLogo";

// Generate falling soccer balls once per mount
function FallingBalls() {
  const balls = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left:     `${Math.random() * 100}%`,
      size:     20 + Math.random() * 28,
      duration: `${7 + Math.random() * 8}s`,
      delay:    `${-Math.random() * 14}s`,
      opacity:  0.25 + Math.random() * 0.35,
    }));
  }, []);

  return (
    <>
      {balls.map(b => (
        <span
          key={b.id}
          className="ball"
          style={{
            left:            b.left,
            fontSize:        b.size,
            animationDuration: b.duration,
            animationDelay:  b.delay,
            opacity:         b.opacity,
            top:             0,
          }}
        >
          ⚽
        </span>
      ))}
    </>
  );
}

export default function Login({ onLogin }) {
  const [mode, setMode]       = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm]     = useState({ email: "", password: "", first_name: "", last_name: "", company: "" });

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(loginForm.email.trim(), loginForm.password);
      setToken(data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.register(regForm);
      setToken(data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { ...S.inputField, marginBottom: 14 };

  return (
    <div style={{
      ...S.loginWrap,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated background */}
      <FallingBalls />

      {/* Card */}
      <div style={{ ...S.loginCard, maxWidth: mode === "register" ? 480 : 420, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={S.loginLogoRow}>
          <GranotecLogo height={36} />
        </div>

        {/* Title — Montserrat Black, large, tight tracking */}
        <div style={{
          fontFamily:    "'Montserrat', sans-serif",
          fontWeight:    900,
          fontSize:      52,
          lineHeight:    1,
          letterSpacing: -2,
          color:         B.blue,
          textTransform: "uppercase",
          textAlign:     "center",
          marginBottom:  6,
        }}>
          Prode<br />2026
        </div>

        <div style={{ ...S.loginSub, marginBottom: 28 }}>
          Copa Mundial · USA · Canadá · México
        </div>

        {error && <div style={S.errorMsg}>{error}</div>}

        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <label style={S.label}>Email</label>
            <input style={inputStyle} type="email" placeholder="tu@empresa.com" autoComplete="email"
              value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} />

            <label style={S.label}>Contraseña</label>
            <input style={{ ...inputStyle, marginBottom: 24 }} type="password" placeholder="••••••••" autoComplete="current-password"
              value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} />

            <button style={{ ...S.primaryBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Entrar al Prode →"}
            </button>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: B.gray50 }}>
              ¿Primera vez?{" "}
              <span style={{ color: B.blue, fontWeight: 700, cursor: "pointer" }}
                onClick={() => { setMode("register"); setError(""); }}>
                Registrate aquí
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <div>
                <label style={S.label}>Nombre</label>
                <input style={inputStyle} placeholder="Juan" autoComplete="given-name"
                  value={regForm.first_name} onChange={e => setRegForm(f => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Apellido</label>
                <input style={inputStyle} placeholder="García" autoComplete="family-name"
                  value={regForm.last_name} onChange={e => setRegForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>

            <label style={S.label}>Empresa</label>
            <input style={inputStyle} placeholder="Nombre de tu empresa" autoComplete="organization"
              value={regForm.company} onChange={e => setRegForm(f => ({ ...f, company: e.target.value }))} />

            <label style={S.label}>Email</label>
            <input style={inputStyle} type="email" placeholder="tu@empresa.com" autoComplete="email"
              value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} />

            <label style={S.label}>Contraseña</label>
            <input style={{ ...inputStyle, marginBottom: 24 }} type="password" placeholder="Mínimo 6 caracteres" autoComplete="new-password"
              value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} />

            <button style={{ ...S.primaryBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta →"}
            </button>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: B.gray50 }}>
              ¿Ya tenés cuenta?{" "}
              <span style={{ color: B.blue, fontWeight: 700, cursor: "pointer" }}
                onClick={() => { setMode("login"); setError(""); }}>
                Ingresá aquí
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
