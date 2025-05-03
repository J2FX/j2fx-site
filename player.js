// player.js

// Insere o CSS do Plyr e estilos personalizados
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://cdn.plyr.io/3.7.8/plyr.css";
document.head.appendChild(link);

const style = document.createElement("style");
style.innerHTML = `
#audioWidget {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border: 1px solid #ccc;
  padding: 15px 10px;
  z-index: 9999;
  width: 300px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  border-radius: 10px;
  font-family: sans-serif;
  text-align: center;
}
#audioWidget h4 {
  font-size: 16px;
  margin: 10px 0;
}
#audioWidget .logo {
  width: 100px;
  margin: 0 auto 10px;
}
#audioWidget .footer {
  font-size: 10px;
  color: #888;
  margin-top: 8px;
}
#audioWidget #toggleBtn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
`;
document.head.appendChild(style);

// Cria o widget HTML
const widget = document.createElement("div");
widget.id = "audioWidget";
widget.innerHTML = `
  <button id="toggleBtn">−</button>
  <img src="https://drive.google.com/file/d/1yChx4cmdO9rpyhotzJxdD6Ld9zFe1tGm/view?usp=sharing" alt="Logo PluralWeb" class="logo" />
  <h4>🔊 Tour em Áudio</h4>
  <audio id="accessiblePlayer" controls style="width: 100%;"></audio>
  <div class="footer">by Plural Web</div>
`;
document.body.appendChild(widget);

// Minimizar/restaurar o player
let minimized = false;
document.getElementById("toggleBtn").addEventListener("click", () => {
  minimized = !minimized;
  const content = widget.querySelectorAll("img, h4, audio, .footer");
  content.forEach(el => el.style.display = minimized ? "none" : "block");
  document.getElementById("toggleBtn").textContent = minimized ? "+" : "−";
});

// Carrega Plyr e busca o áudio da API
const script = document.createElement("script");
script.src = "https://cdn.plyr.io/3.7.8/plyr.polyfilled.js";
script.onload = async () => {
  const site = window.location.origin;
  const page = window.location.pathname === "/" ? "home" : window.location.pathname.replace(/\//g, "");

  const res = await fetch(`https://cnhqgmfegawkjbiwgvef.supabase.co/rest/v1/audios?site=eq.${site}&page=eq.${page}`, {
    headers: {
      "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaGdxbWZlZ2F3a2piaXdndmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTA5MDUsImV4cCI6MjA2MTc4NjkwNX0.SjMbOC1zmsorsx8c9658Mu2MZQOpEQtT5jtNcUdAsl4",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaGdxbWZlZ2F3a2piaXdndmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTA5MDUsImV4cCI6MjA2MTc4NjkwNX0.SjMbOC1zmsorsx8c9658Mu2MZQOpEQtT5jtNcUdAsl4"
    }
  });

  const data = await res.json();
  const audioUrl = data[0]?.audio_url;
  if (audioUrl) {
    const player = new Plyr("#accessiblePlayer");
    document.getElementById("accessiblePlayer").src = audioUrl;
  } else {
    console.warn("Áudio não encontrado para esta página.");
    document.getElementById("audioWidget").style.display = "none";
  }
};
document.body.appendChild(script);
