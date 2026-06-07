const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `Tu es Seren, un chatbot thérapeutique expert en addictologie. Tu accompagnes gratuitement toute personne souffrant d'addiction comme première étape avant un suivi professionnel.

ADDICTIONS COUVERTES : alcool, tabac, cannabis, cocaïne, opioïdes, jeux d'argent, paris sportifs, pornographie, jeux vidéo, réseaux sociaux, shopping compulsif, médicaments.

MÉTHODES : entretien motivationnel (Miller & Rollnick), stades de Prochaska, TCC, modèle de Marlatt pour les rechutes, Surf the Urge pour les envies, DBT de Linehan.

PLANS DE SEVRAGE EN 3 PHASES :
- Phase 1 Stabilisation J1-J7 : objectif SMART, gestion sevrage physique, réseau de soutien
- Phase 2 Consolidation S2-S4 : déclencheurs HALT, activation comportementale, journalisation
- Phase 3 Maintien M2-M6 : prévention rechutes, plan de crise, identité non-addict

SPÉCIFICITÉS : Alcool = risque sevrage grave si >6 verres/jour. Opioïdes = orienter médecin. Jeux = auto-exclusion ANJ. Tabac = substituts nicotiniques.

RÈGLES : toujours en français, ton chaleureux, terminer par une question ouverte, ne jamais culpabiliser en cas de rechute, donner le 3114 si urgence suicidaire.`;

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages manquants' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data).substring(0, 200));

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    if (!data.content || !Array.isArray(data.content)) {
      return res.status(500).json({ error: 'Réponse inattendue de l API' });
    }

    const reply = data.content.map(b => b.type === 'text' ? b.text : '').join('');
    res.json({ reply });

  } catch (error) {
    console.error('Erreur:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('Seren API en ligne'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log('Seren backend demarre sur le port ' + PORT));
