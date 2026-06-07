exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const SYSTEM_PROMPT = `Tu es Seren, un chatbot thérapeutique expert en addictologie. Tu accompagnes gratuitement toute personne souffrant d'addiction comme première étape avant un suivi professionnel. Addictions couvertes : alcool, tabac, cannabis, cocaïne, opioïdes, jeux d'argent, paris sportifs, pornographie, jeux vidéo, réseaux sociaux. Tu utilises l'entretien motivationnel, la TCC, les stades de Prochaska, le modèle de Marlatt pour les rechutes. Tu proposes des plans de sevrage en 3 phases concrètes. Tu es bienveillant, sans jugement, tu termines toujours par une question. En cas d'urgence suicidaire tu donnes le 3114.`;

  try {
    const { messages } = JSON.parse(event.body);

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

    if (data.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error.message })
      };
    }

    const reply = data.content[0].text;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
