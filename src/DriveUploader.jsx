import React, { useState, useRef } from "react";

const GOOGLE_CLIENT_ID = "530367322306-kssjas0e33hovkjiinnv4hsc6no553fv.apps.googleusercontent.com";
const ROOT_FOLDER_NAME = "MM_Panel";
const ROOT_ID_KEY = "mm_drive_root_id";

function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

async function getAccessToken() {
  await loadGoogleScript();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive",
      callback: (r) => {
        if (r.error) reject(new Error(r.error));
        else resolve(r.access_token);
      },
    });
    // requestAccessToken() DEBE llamarse dentro del handler de click del usuario
    // para que Chrome no lo bloquee como popup no solicitado
    client.requestAccessToken({ prompt: "" });
  });
}

async function createFolder(name, parentId, token) {
  const body = { name, mimeType: "application/vnd.google-apps.folder" };
  if (parentId) body.parents = [parentId];
  const res = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.id) throw new Error("Error creando carpeta: " + name + " — " + JSON.stringify(data));
  return data.id;
}

async function findFolderInParent(name, parentId, token) {
  const q = `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  if (data.files && data.files.length > 0) return data.files[0].id;
  return null;
}

async function getOrCreate(name, parentId, token) {
  const existing = await findFolderInParent(name, parentId, token);
  if (existing) return existing;
  return await createFolder(name, parentId, token);
}

async function getRootId(token) {
  const cached = localStorage.getItem(ROOT_ID_KEY);
  if (cached) {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${cached}?fields=id,trashed`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (data.id && !data.trashed) return cached;
    localStorage.removeItem(ROOT_ID_KEY);
  }

  const q = `name='${ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,parents)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    const id = data.files[0].id;
    localStorage.setItem(ROOT_ID_KEY, id);
    return id;
  }

  const id = await createFolder(ROOT_FOLDER_NAME, null, token);
  localStorage.setItem(ROOT_ID_KEY, id);
  return id;
}

// Estructura: MM_Panel / 001_Influye_Agency / L-01_Contratos_de_Trabajo / Contrato_Individual / archivo.pdf
async function uploadToDrive({ file, clientId, clientName, modId, modNombre, docLabel, token }) {
  const rootId = await getRootId(token);

  const clientFolderName = `${clientId}_${(clientName || "Cliente")
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")}`;
  const clientFolderId = await getOrCreate(clientFolderName, rootId, token);

  const modFolderName = modId && modNombre
    ? `${modId}_${modNombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]/g, "").trim().replace(/\s+/g, "_")}`
    : "Documentos_Generales";
  const modFolderId = await getOrCreate(modFolderName, clientFolderId, token);

  const subFolderName = docLabel
    ? docLabel.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]/g, "").trim().replace(/\s+/g, "_").slice(0, 50)
    : "Documentos";
  const subFolderId = await getOrCreate(subFolderName, modFolderId, token);

  const metadata = { name: file.name, parents: [subFolderId] };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form }
  );
  const uploaded = await uploadRes.json();
  if (!uploaded.id) throw new Error("Error subiendo archivo: " + JSON.stringify(uploaded));

  await fetch(`https://www.googleapis.com/drive/v3/files/${uploaded.id}/permissions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });

  return { id: uploaded.id, name: uploaded.name, url: uploaded.webViewLink };
}

export function DriveUploader({ clientId, clientName, modId, modNombre, docLabel, onUploaded, label = "Subir a Drive" }) {
  const [status, setStatus] = useState("idle"); // idle | auth | ready | uploading | done | error
  const [statusMsg, setStatusMsg] = useState("");
  const [token, setToken] = useState(null);
  const fileRef = useRef(null);

  // PASO 1 — Click en botón: obtener token (dentro del gesto de usuario → Chrome no bloquea el popup)
  async function handleButtonClick() {
    if (status === "uploading") return;

    // Si ya tenemos token válido, abrir file picker directamente
    if (token) {
      fileRef.current?.click();
      return;
    }

    setStatus("auth");
    setStatusMsg("Conectando con Google...");
    try {
      const t = await getAccessToken();
      setToken(t);
      setStatus("ready");
      setStatusMsg("");
      // Abrir file picker inmediatamente después de autenticar
      fileRef.current?.click();
    } catch (err) {
      console.error("DriveUploader auth:", err);
      setStatus("error");
      setStatusMsg("No se pudo conectar con Google. Revisa que los popups estén permitidos.");
    }
  }

  // PASO 2 — Usuario seleccionó archivo: subir con token ya obtenido
  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file || !token) return;

    setStatus("uploading");
    setStatusMsg("Preparando carpetas...");
    try {
      const result = await uploadToDrive({ file, clientId, clientName, modId, modNombre, docLabel, token });
      setStatus("done");
      setStatusMsg(`✓ ${result.name}`);
      onUploaded && onUploaded(result.url, result.name);
      setTimeout(() => { setStatus("idle"); setStatusMsg(""); }, 4000);
    } catch (err) {
      console.error("DriveUploader upload:", err);
      // Si el token expiró, limpiar para re-autenticar en el siguiente click
      if (err.message?.includes("401") || err.message?.includes("invalid_token")) {
        setToken(null);
      }
      setStatus("error");
      setStatusMsg("Error: " + (err.message || "intenta de nuevo"));
      setTimeout(() => { setStatus("idle"); setStatusMsg(""); }, 5000);
    }
    e.target.value = "";
  }

  const isLoading = status === "auth" || status === "uploading";
  const btnLabel = status === "auth"
    ? "Conectando..."
    : status === "uploading"
    ? "Subiendo..."
    : label;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} />
      <button
        style={{
          background: status === "done" ? "#5A8A3C" : "#4A5C45",
          color: "#F0F4EE",
          border: "none",
          borderRadius: 4,
          padding: "6px 14px",
          fontSize: 11,
          cursor: isLoading ? "not-allowed" : "pointer",
          fontFamily: "system-ui,sans-serif",
          opacity: isLoading ? 0.7 : 1,
          transition: "background 0.2s",
        }}
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        {btnLabel}
      </button>
      {statusMsg && (
        <span style={{
          fontSize: 11,
          color: status === "error" ? "#C0392B" : status === "done" ? "#5A8A3C" : "#4A5C45",
          fontFamily: "system-ui,sans-serif",
        }}>
          {statusMsg}
        </span>
      )}
    </div>
  );
}
