(async () => {
  // CONFIGURAÇÃO
  const supabaseUrl = 'https://cnhgqmfegawkjbiwgvef.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaGdxbWZlZ2F3a2piaXdndmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTA5MDUsImV4cCI6MjA2MTc4NjkwNX0.SjMbOC1zmsorsx8c9658Mu2MZQOpEQtT5jtNcUdAsl4';
  const site = window.location.hostname;
  const page = window.location.pathname === "/" ? "home" : window.location.pathname.replace(/\//g, '');

  // ESTILO
  const style = document.createElement('style');
  style.innerHTML = `
    #plural-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      font-family: Arial, sans-serif;
      z-index: 9999;
      overflow: hidden;
    }
    #plural-header {
      text-align: center;
      background: #f8f8f8;
      padding: 10px;
    }
    #plural-header img {
      max-width: 100px;
      margin: auto;
      display: block;
    }
    #plural-body {
      padding: 10px;
      text-align: center;
    }
    #plural-footer {
      text-align: center;
      font-size: 10px;
      color: #999;
      padding: 5px 0;
    }
    #plural-toggle {
      position: absolute;
      top: 5px;
      right: 5px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // HTML
  const widget = document.createElement('div');
  widget.id = 'plural-widget';
  widget.innerHTML = `
    <div id="plural-header">
      <button id="plural-toggle">−</button>
      <img src="https://pluralweb-audios.s3.sa-east-1.amazonaws.com/setup/logo-pluralweb.png" alt="Plural Web" />
    </div>
    <div id="plural-body">
      <p>Clique para fazer um tour em áudio desta página:</p>
      <audio id="plural-audio" controls style="width: 100%"></audio>
    </div>
    <div id="plural-footer">by Plural Web</div>
  `;
  document.body.appendChild(widget);

  // TOGGLE (minimizar/restaurar)
  const toggleButton = document.getElementById('plural-toggle');
  const body = document.getElementById('plural-body');
  toggleButton.onclick = () => {
    if (body.style.display === 'none') {
      body.style.display = 'block';
      toggleButton.textContent = '−';
    } else {
      body.style.display = 'none';
      toggleButton.textContent = '+';
    }
  };

  // FETCH do áudio
  async function fetchAudio() {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/audios?site=eq.${site}&page=eq.${page}`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      const data = await res.json();
      if (data.length > 0 && data[0].url) {
        document.getElementById('plural-audio').src = data[0].url;
      } else {
        document.getElementById('plural-body').innerHTML = '<p>Áudio não encontrado para esta página.</p>';
      }
    } catch (err) {
      console.error('Erro ao carregar áudio:', err);
      document.getElementById('plural-body').innerHTML = '<p>Erro ao carregar o áudio.</p>';
    }
  }

  fetchAudio();
})();
