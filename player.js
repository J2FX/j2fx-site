<!-- Leitor Acessível -->
<link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
<style>
  #audioWidget {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 1px solid #ccc;
    padding: 10px;
    z-index: 9999;
    width: 300px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    border-radius: 8px;
    font-family: sans-serif;
  }
  #audioWidget h4 {
    margin: 0 0 10px;
    font-size: 16px;
  }
</style>

<div id="audioWidget">
  <h4>🔊 Tour em Áudio</h4>
  <audio id="accessiblePlayer" controls></audio>
</div>

<script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>
<script type="module">
  const site = window.location.origin;
  const page = "home"; // ou use window.location.pathname

  const fetchAudio = async () => {
    const res = await fetch(`https://cnhqgmfegawkjbiwgvef.supabase.co/rest/v1/audios?site=eq.${site}&page=eq.${page}`, {
      headers: {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    });
    const data = await res.json();
    const audioUrl = data[0]?.audio_url;
    if (audioUrl) {
      const player = new Plyr("#accessiblePlayer");
      document.getElementById("accessiblePlayer").src = audioUrl;
    } else {
      console.warn("Áudio não encontrado para esta página.");
    }
  };

  fetchAudio();
</script>
