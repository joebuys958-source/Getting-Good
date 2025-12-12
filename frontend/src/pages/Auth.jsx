import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";



export default function Auth() {
  const [mode, setMode] = useState("login"); // login | signup
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [name, setName] = useState("");
const [loading, setLoading] = useState(false);
const navigate = useNavigate();
const [leaving, setLeaving] = useState(false);



  return (
    <div
  style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  }}
>

      <div
        className="glass"
        style={{
          width: 420,
          padding: 32,
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 24 }}>
          <span className="emoji">
            {mode === "login" ? "🔐" : "✨"}
          </span>{" "}
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>

        {mode === "signup" && (
  <input
    className="input"
    placeholder="👤 Full name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    style={{ marginBottom: 14 }}
  />
)}


        <input
  className="input"
  placeholder="📧 Email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  style={{ marginBottom: 14 }}
/>

        <input
  className="input"
  type="password"
  placeholder="🔒 Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  style={{ marginBottom: 20 }}
/>


   <button
  className="auth-btn"
  disabled={loading}
  onClick={async () => {
    try {
      setLoading(true);

      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      // 🔹 STEP 3 STARTS HERE
      setLeaving(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 600);
      // 🔹 STEP 3 ENDS HERE

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }}
>
  {loading
    ? "Please wait..."
    : mode === "login"
    ? "Login"
    : "Sign Up"}
</button>



        <div
          className="auth-toggle"
          onClick={() =>
            setMode(mode === "login" ? "signup" : "login")
          }
        >
          {mode === "login" ? (
            <>
              Don’t have an account? <span>Sign up</span>
            </>
          ) : (
            <>
              Already have an account? <span>Login</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
