import React, { useState, useRef, useEffect } from 'react';

const RESPONSES = {
  greet: ['Hello! 👋 Welcome to FloraNursery! How can I help you today?'],
  water: ['💧 Most indoor plants need watering once or twice a week. Always check the soil first — if the top inch is dry, it\'s time to water!'],
  sunlight: ['☀️ Most indoor plants prefer bright indirect sunlight. Avoid direct afternoon sun which can burn leaves.'],
  fertilize: ['🌱 Fertilize your plants every 2-4 weeks during spring and summer with a balanced liquid fertilizer. Reduce in winter.'],
  repot: ['🪴 Repot when roots start coming out of drainage holes, usually every 1-2 years. Choose a pot 2 inches larger.'],
  yellow: ['🟡 Yellow leaves can mean overwatering, underwatering, or nutrient deficiency. Check soil moisture first!'],
  brown: ['🟤 Brown tips usually mean low humidity or fluoride in tap water. Try misting leaves or using filtered water.'],
  indoor: ['🏠 Great indoor plants: Money Plant, Snake Plant, Peace Lily, Pothos, Areca Palm. All are low maintenance!'],
  outdoor: ['🌳 Great outdoor plants: Hibiscus, Neem, Bougainvillea, Jasmine. They need good sunlight and regular watering.'],
  medicinal: ['🌿 Popular medicinal plants: Tulsi, Aloe Vera, Neem, Ashwagandha, Mint. Great for home gardens!'],
  beginner: ['🌱 Best plants for beginners: Money Plant, Snake Plant, Aloe Vera, Pothos — all very forgiving and low maintenance!'],
  default: ['I\'m not sure about that. Try asking about watering, sunlight, fertilizing, or specific plant types! 🌿'],
};

function getBotReply(msg) {
  const m = msg.toLowerCase();
  if (m.match(/hi|hello|hey|namaste/)) return RESPONSES.greet[0];
  if (m.match(/water|irrigation|drink/)) return RESPONSES.water[0];
  if (m.match(/sun|light|shade/)) return RESPONSES.sunlight[0];
  if (m.match(/fertili|feed|nutrient/)) return RESPONSES.fertilize[0];
  if (m.match(/repot|pot|transplant/)) return RESPONSES.repot[0];
  if (m.match(/yellow|yellowing/)) return RESPONSES.yellow[0];
  if (m.match(/brown|tip|dry/)) return RESPONSES.brown[0];
  if (m.match(/indoor|inside|home/)) return RESPONSES.indoor[0];
  if (m.match(/outdoor|outside|garden/)) return RESPONSES.outdoor[0];
  if (m.match(/medicin|herb|ayurved/)) return RESPONSES.medicinal[0];
  if (m.match(/beginner|easy|start|new/)) return RESPONSES.beginner[0];
  return RESPONSES.default[0];
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: '🌿 Hi! I\'m Flora, your plant care assistant. Ask me about watering, sunlight, plant types and more!' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: getBotReply(userMsg) }]);
    }, 500);
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setOpen(o => !o)} title="Plant Care Assistant">
        {open ? '✕' : '🌿'}
      </button>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <strong>🌿 Flora</strong>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Plant Care Assistant</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>{m.text}</div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="chatbot-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about plant care..."
            />
            <button onClick={send}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
