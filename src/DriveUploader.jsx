import React, { useState, useRef } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
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

function sanitize(str) {
  return (str || "").replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]/g, "").trim().replace(/\s+/g, "_");
}

// Estructura sin sociedad: MM_Panel / 001_Cliente / L-01_Modulo / Tipo_Doc / archivo.pdf
// Estructura con sociedad: MM_Panel / 001_Cliente / Sociedad_Nombre / L-01_Modulo / Tipo_Doc / archivo.pdf
async function uploadToDrive({ file, clientId, clientName, sociedadNombre, modId, modNombre, docLabel, token }) {
  const rootId = await getRootId(token);

  const clientFolderName = `${clientId}_${sanitize(clientName || "Cliente")}`;
  const clientFolderId = await getOrCreate(clientFolderName, rootId, token);

  // Si hay sociedad, crear subcarpeta intermedia
  let parentForMod = clientFolderId;
  if (sociedadNombre) {
    const socFolderName = sanitize(sociedadNombre).slice(0, 50);
    parentForMod = await getOrCreate(socFolderName, clientFolderId, token);
  }

  const modFolderName = modId && modNombre
    ? `${modId}_${sanitize(modNombre).slice(0, 40)}`
    : "Documentos_Generales";
  const modFolderId = await getOrCreate(modFolderName, parentForMod, token);

  const subFolderName = docLabel ? sanitize(docLabel).slice(0, 50) : "Documentos";
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

export function DriveUploader({ clientId, clientName, sociedadNombre, modId, modNombre, docLabel, onUploaded, label = "Subir a Drive" }) {
  const [status, setStatus] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [token, setToken] = useState(null);
  const fileRef = useRef(null);

  async function handleButtonClick() {
    if (status === "uploading") return;
    if (token) { fileRef.current?.click(); return; }
    setStatus("auth");
    setStatusMsg("Conectando con Google...");
    try {
      const t = await getAccessToken();
      setToken(t);
      setStatus("ready");
      setStatusMsg("");
      fileRef.current?.click();
    } catch (err) {
      setStatus("error");
      setStatusMsg("No se pudo conectar con Google.");
    }
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file || !token) return;
    setStatus("uploading");
    setStatusMsg("Preparando carpetas...");
    try {
      const result = await uploadToDrive({ file, clientId, clientName, sociedadNombre, modId, modNombre, docLabel, token });
      setStatus("done");
      setStatusMsg(`✓ ${result.name}`);
      onUploaded && onUploaded(result.url, result.name);
      setTimeout(() => { setStatus("idle"); setStatusMsg(""); }, 4000);
    } catch (err) {
      if (err.message?.includes("401") || err.message?.includes("invalid_token")) setToken(null);
      setStatus("error");
      setStatusMsg("Error: " + (err.message || "intenta de nuevo"));
      setTimeout(() => { setStatus("idle"); setStatusMsg(""); }, 5000);
    }
    e.target.value = "";
  }

  const isLoading = status === "auth" || status === "uploading";
  const btnLabel = status === "auth" ? "Conectando..." : status === "uploading" ? "Subiendo..." : label;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} />
      <button
        style={{
          background: status === "done" ? "#5A8A3C" : "#4A5C45",
          color: "#F0F4EE", border: "none", borderRadius: 4,
          padding: "6px 14px", fontSize: 11,
          cursor: isLoading ? "not-allowed" : "pointer",
          fontFamily: "system-ui,sans-serif",
          opacity: isLoading ? 0.7 : 1, transition: "background 0.2s",
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
