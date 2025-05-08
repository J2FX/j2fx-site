// player.js

(function() {
  // Configuração - Mude apenas esta seção ao fornecer o widget para clientes
  const widgetConfig = {
    title: "🔊 Tour em Áudio",
    position: "bottom-right", // Opções: top-right, top-left, bottom-right, bottom-left
    theme: "light", // Opções: light, dark
    autoplay: false,
    
    // Configuração do Supabase
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaGdxbWZlZ2F3a2piaXdndmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTA5MDUsImV4cCI6MjA2MTc4NjkwNX0.SjMbOC1zmsorsx8c9658Mu2MZQOpEQtT5jtNcUdAsl4",
    supabaseUrl: "https://cnhqgmfegawkjbiwgvef.supabase.co/rest/v1/audios",
    
    // Para teste rápido (use uma URL direta de áudio público)
    // Descomente abaixo para testar com um áudio específico
    testAudioUrl: "https://pluralweb-audios.s3.sa-east-1.amazonaws.com/clientes/j2fx/LOC+J2FX.mp3",
    
    // Logo fixo da PluralWeb
    logoUrl: "https://pluralweb-audios.s3.sa-east-1.amazonaws.com/setup/logo-pluralweb.png"
  };

  // Insere CSS do widget
  const style = document.createElement("style");
  style.innerHTML = `
    #audioWidget {
      position: fixed;
      ${widgetConfig.position === "top-right" ? "top: 20px; right: 20px;" : 
        widgetConfig.position === "top-left" ? "top: 20px; left: 20px;" :
        widgetConfig.position === "bottom-right" ? "bottom: 20px; right: 20px;" :
        "bottom: 20px; left: 20px;"}
      background: ${widgetConfig.theme === "dark" ? "#333" : "#fff"};
      color: ${widgetConfig.theme === "dark" ? "#fff" : "#333"};
      border: 1px solid ${widgetConfig.theme === "dark" ? "#555" : "#ccc"};
      padding: 15px;
      z-index: 9999;
      width: 300px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.15);
      border-radius: 10px;
      font-family: Arial, sans-serif;
      transition: all 0.3s ease;
    }
    #audioWidget.collapsed {
      width: auto;
      padding: 10px;
    }
    #audioHeader {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    #audioLogo {
      width: 30px;
      height: auto;
      margin-right: 10px;
    }
    #audioTitle {
      flex-grow: 1;
    }
    #audioWidget h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    #audioToggle {
      background: none;
      border: none;
      color: ${widgetConfig.theme === "dark" ? "#fff" : "#333"};
      cursor: pointer;
      font-size: 18px;
      padding: 0;
    }
    #audioPlayer {
      width: 100%;
    }
    .status-message {
      padding: 10px 0;
      text-align: center;
      font-style: italic;
      color: #666;
      font-size: 13px;
    }
    .debug-info {
      margin-top: 10px;
      padding: 5px;
      border: 1px dashed #ccc;
      border-radius: 4px;
      font-size: 11px;
      color: #666;
      display: none;
    }
  `;
  document.head.appendChild(style);

  // Cria o widget HTML
  const widget = document.createElement("div");
  widget.id = "audioWidget";
  
  // Conteúdo inicial do widget
  widget.innerHTML = `
    <div id="audioHeader">
      <img id="audioLogo" src="${widgetConfig.logoUrl}" alt="PluralWeb Logo">
      <div id="audioTitle">
        <h4>${widgetConfig.title}</h4>
      </div>
      <button id="audioToggle" aria-label="Minimizar">−</button>
    </div>
    <div id="audioContent">
      <div id="playerContainer">
        <div class="status-message">Inicializando player...</div>
      </div>
      <div class="debug-info" id="debugInfo"></div>
    </div>
  `;
  
  document.body.appendChild(widget);

  // Funcionalidade para expandir/colapsar
  const toggleBtn = document.getElementById("audioToggle");
  const content = document.getElementById("audioContent");
  const widgetElement = document.getElementById("audioWidget");
  const titleDiv = document.getElementById("audioTitle");
  
  toggleBtn.addEventListener("click", function() {
    if (this.innerHTML === "−") {
      this.innerHTML = "+";
      this.setAttribute("aria-label", "Expandir");
      content.style.display = "none";
      titleDiv.style.display = "none";
      widgetElement.classList.add("collapsed");
    } else {
      this.innerHTML = "−";
      this.setAttribute("aria-label", "Minimizar");
      content.style.display = "block";
      titleDiv.style.display = "block";
      widgetElement.classList.remove("collapsed");
    }
  });

  // Função para atualizar o status
  function updateStatus(message) {
    const container = document.getElementById("playerContainer");
    if (!container) return;
    
    const statusElement = container.querySelector(".status-message");
    if (statusElement) {
      statusElement.textContent = message;
    } else {
      const newStatus = document.createElement("div");
      newStatus.classList.add("status-message");
      newStatus.textContent = message;
      container.appendChild(newStatus);
    }
  }

  // Função para mostrar informações de debug (útil para troubleshooting)
  function updateDebug(info) {
    const debugElement = document.getElementById("debugInfo");
    if (debugElement) {
      // Mostrar o elemento de debug quando for atualizado
      debugElement.style.display = "block";
      
      // Formatar o objeto como JSON bonito, ou apenas mostrar texto
      if (typeof info === "object") {
        debugElement.textContent = JSON.stringify(info, null, 2);
      } else {
        debugElement.textContent = info;
      }
    }
  }

  // Função para criar o player de áudio HTML nativo (sem Plyr)
  function createSimplePlayer(audioUrl) {
    updateStatus("Carregando áudio...");
    
    const container = document.getElementById("playerContainer");
    container.innerHTML = `
      <audio id="audioPlayer" controls>
        <source src="${audioUrl}" type="audio/mpeg">
        Seu navegador não suporta o elemento de áudio.
      </audio>
      <div class="status-message">Clique no play para ouvir</div>
    `;
    
    const audioElement = document.getElementById("audioPlayer");
    
    // Monitorar eventos do player para depurar
    audioElement.addEventListener("loadstart", () => {
      updateStatus("Iniciando carregamento...");
      console.log("Audio: Iniciando carregamento");
    });
    
    audioElement.addEventListener("canplay", () => {
      updateStatus("Áudio pronto para reprodução. Clique no play!");
      console.log("Audio: Pronto para reprodução");
    });
    
    audioElement.addEventListener("playing", () => {
      updateStatus("Em reprodução...");
      console.log("Audio: Em reprodução");
    });
    
    audioElement.addEventListener("error", (e) => {
      const errorMessages = {
        1: "Carregamento abortado",
        2: "Erro de rede",
        3: "Erro de decodificação",
        4: "Áudio não suportado"
      };
      
      const errorCode = audioElement.error ? audioElement.error.code : 0;
      const errorMessage = errorMessages[errorCode] || "Erro desconhecido";
      
      updateStatus(`Erro: ${errorMessage}. Tente novamente.`);
      updateDebug(`Erro ${errorCode}: ${errorMessage}`);
      console.error("Audio: Erro ao carregar", audioElement.error);
    });
    
    // Tentar reprodução automática se configurado
    if (widgetConfig.autoplay) {
      audioElement.play().catch(e => {
        console.log("Audio: Reprodução automática bloqueada pelo navegador");
        updateStatus("Clique no play para ouvir o áudio");
      });
    }
  }

  // Função principal para buscar áudio
  async function loadAudio() {
    try {
      // *** IMPORTANTE: Para teste rápido, use a URL direta se fornecida ***
      if (widgetConfig.testAudioUrl) {
        console.log("Audio: Usando URL de teste direto");
        createSimplePlayer(widgetConfig.testAudioUrl);
        return;
      }
      
      // Caso contrário, buscar do Supabase
      updateStatus("Buscando informações do áudio...");
      
      // Detectar site e página atual
      const site = window.location.hostname;
      const page = window.location.pathname === "/" ? "home" : window.location.pathname.replace(/\//g, "");
      
      console.log(`Audio: Buscando áudio para site: ${site}, página: ${page}`);
      
      // Requisição para o Supabase
      const apiUrl = `${widgetConfig.supabaseUrl}?site=eq.${encodeURIComponent(site)}&page=eq.${encodeURIComponent(page)}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "apikey": widgetConfig.apiKey,
          "Authorization": `Bearer ${widgetConfig.apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      // Verificar resposta HTTP
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      // Parsear dados da resposta
      const data = await response.json();
      console.log("Audio: Resposta da API:", data);
      
      // Verificar se temos dados de áudio
      if (data && data.length > 0 && data[0].audio_url) {
        const audioUrl = data[0].audio_url;
        console.log("Audio: URL encontrada:", audioUrl);
        
        // Criar o player com a URL encontrada
        createSimplePlayer(audioUrl);
      } else {
        updateStatus("Nenhum áudio disponível para esta página");
        console.warn("Audio: Nenhum áudio encontrado para", site, page);
      }
    } catch (error) {
      console.error("Audio: Erro ao carregar", error);
      updateStatus("Erro ao carregar áudio");
      updateDebug(error.toString());
    }
  }

  // Iniciar o carregamento do áudio quando o documento estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAudio);
  } else {
    loadAudio();
  }
})();
