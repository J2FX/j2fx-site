// player.js

(function() {
  // Configuração - Mude apenas esta seção ao fornecer o widget para clientes
  const widgetConfig = {
    title: "🔊 Tour em Áudio",
    position: "top-right", // Opções: top-right, top-left, bottom-right, bottom-left
    theme: "light", // Opções: light, dark
    autoplay: false,
    
    // Opção 1: Buscar áudio da API (deixe audioUrl vazio para usar esta opção)
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaGdxbWZlZ2F3a2piaXdndmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTA5MDUsImV4cCI6MjA2MTc4NjkwNX0.SjMbOC1zmsorsx8c9658Mu2MZQOpEQtT5jtNcUdAsl4",
    supabaseUrl: "https://cnhqgmfegawkjbiwgvef.supabase.co/rest/v1/audios",
    
    // Opção 2: URL direta do áudio (use esta opção para ignorar a chamada API)
    audioUrl: "https://example.com/audio/demo.mp3", // Especifique diretamente o URL do áudio aqui
    
    // Imagem fixa para o player
    imageUrl: "https://pluralweb-audios.s3.sa-east-1.amazonaws.com/setup/logo-pluralweb.png"
  };

  // Insere CSS do Plyr e estilo do widget
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn.plyr.io/3.7.8/plyr.css";
  document.head.appendChild(link);

  // Posições do widget
  const positions = {
    'top-right': 'top: 20px; right: 20px;',
    'top-left': 'top: 20px; left: 20px;',
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-left': 'bottom: 20px; left: 20px;'
  };

  // Estilos de temas
  const themes = {
    'light': {
      background: 'white',
      text: '#333',
      border: '#ccc'
    },
    'dark': {
      background: '#333',
      text: 'white',
      border: '#555'
    }
  };

  const theme = themes[widgetConfig.theme] || themes.light;
  const position = positions[widgetConfig.position] || positions['top-right'];

  // Widget CSS
  const style = document.createElement("style");
  style.innerHTML = `
    #audioWidget {
      position: fixed;
      ${position}
      background: ${theme.background};
      color: ${theme.text};
      border: 1px solid ${theme.border};
      padding: 15px;
      z-index: 9999;
      width: 300px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.15);
      border-radius: 10px;
      font-family: sans-serif;
      transition: all 0.3s ease;
    }
    #audioWidget.collapsed {
      width: 60px;
      height: 60px;
      overflow: hidden;
      padding: 0;
      border-radius: 50%;
    }
    #audioHeader {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    #audioWidget h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    #audioToggle {
      background: none;
      border: none;
      color: ${theme.text};
      cursor: pointer;
      font-size: 18px;
      padding: 0;
    }
    #audioImage {
      width: 100%;
      height: auto;
      border-radius: 8px;
      margin-bottom: 10px;
      display: block;
    }
    .loading-message {
      padding: 10px;
      text-align: center;
      font-style: italic;
      color: #666;
    }
  `;
  document.head.appendChild(style);

  // Cria o widget HTML
  const widget = document.createElement("div");
  widget.id = "audioWidget";
  
  // Conteúdo inicial do widget
  widget.innerHTML = `
    <div id="audioHeader">
      <h4>${widgetConfig.title}</h4>
      <button id="audioToggle" aria-label="Minimizar">−</button>
    </div>
    <div id="audioContent">
      <div id="audioImageContainer">
        <img id="audioImage" src="${widgetConfig.imageUrl}" alt="Capa do áudio">
      </div>
      <div id="audioPlayerContainer">
        <div class="loading-message">Carregando áudio...</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(widget);

  // Adiciona funcionalidade para expandir/colapsar
  const toggleBtn = document.getElementById("audioToggle");
  const content = document.getElementById("audioContent");
  
  toggleBtn.addEventListener("click", function() {
    if (this.innerHTML === "−") {
      this.innerHTML = "+";
      this.setAttribute("aria-label", "Expandir");
      content.style.display = "none";
    } else {
      this.innerHTML = "−";
      this.setAttribute("aria-label", "Minimizar");
      content.style.display = "block";
    }
  });

  // Função para criar o player de áudio
  function createAudioPlayer(audioUrl) {
    const playerContainer = document.getElementById("audioPlayerContainer");
    playerContainer.innerHTML = `<audio id="accessiblePlayer" controls></audio>`;
    
    const audioElement = document.getElementById("accessiblePlayer");
    audioElement.src = audioUrl;
    
    // Inicializar Plyr quando o script estiver carregado
    if (window.Plyr) {
      const player = new Plyr("#accessiblePlayer", {
        controls: ['play', 'progress', 'current-time', 'mute', 'volume']
      });
      
      // Reprodução automática (se configurado)
      if (widgetConfig.autoplay) {
        audioElement.play().catch(e => {
          console.log("Audio: Reprodução automática bloqueada pelo navegador");
        });
      }
    }
  }

  // Função para buscar áudio do Supabase
  async function fetchAudioFromSupabase() {
    try {
      // Detectar site e página
      const site = window.location.hostname;
      const page = window.location.pathname === "/" ? "home" : window.location.pathname.replace(/\//g, "");
      
      console.log(`Audio: Buscando áudio para site: ${site}, página: ${page}`);
      
      // Buscar dados do áudio no Supabase
      const response = await fetch(`${widgetConfig.supabaseUrl}?site=eq.${site}&page=eq.${page}`, {
        headers: {
          "apikey": widgetConfig.apiKey,
          "Authorization": `Bearer ${widgetConfig.apiKey}`,
          "Content-Type": "application/json"
        },
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Audio: Resposta da API:", data);

      if (data && data.length > 0 && data[0]?.audio_url) {
        const audioUrl = data[0].audio_url;
        console.log("Audio: URL de áudio encontrada:", audioUrl);
        return audioUrl;
      } else {
        console.warn("Audio: Áudio não encontrado para esta página:", site, page);
        return null;
      }
    } catch (error) {
      console.error("Audio: Erro ao carregar o áudio da API:", error);
      return null;
    }
  }

  // Carrega Plyr e inicia o player
  const script = document.createElement("script");
  script.src = "https://cdn.plyr.io/3.7.8/plyr.polyfilled.js";
  script.onload = async () => {
    try {
      let audioUrl;
      
      // Se já temos uma URL de áudio configurada, use-a diretamente
      if (widgetConfig.audioUrl) {
        audioUrl = widgetConfig.audioUrl;
      } else {
        // Caso contrário, tente buscar da API
        audioUrl = await fetchAudioFromSupabase();
      }
      
      if (audioUrl) {
        createAudioPlayer(audioUrl);
      } else {
        // Se não conseguir obter o áudio, use um áudio de fallback ou esconda o widget
        const playerContainer = document.getElementById("audioPlayerContainer");
        playerContainer.innerHTML = `<div class="loading-message">Áudio não disponível para esta página.</div>`;
        
        // Opcionalmente, esconda o widget após alguns segundos
        setTimeout(() => {
          document.getElementById("audioWidget").style.display = "none";
        }, 3000);
      }
    } catch (error) {
      console.error("Audio: Erro ao inicializar o player:", error);
      document.getElementById("audioWidget").style.display = "none";
    }
  };
  document.body.appendChild(script);
})();
