// ===============================
//  QuantOre Gemini Chatbot
// ===============================

const API_KEY = "AIzaSyDkWRY1dzO6tju1nwLl35ItRuZd_Fx4bSU";
const MODEL = "gemini-2.5-flash";

// --------------- Gemini API ---------------
async function generateContent(prompt) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "(No response)";
}

// --------------- Parse data.js ---------------
let parsedCompanies = [];

if (typeof csvData !== "undefined") {
    parsedCompanies = Papa.parse(csvData.trim(), {
        header: true,
        skipEmptyLines: true,
    }).data;
}

// --------------- Context Builder ---------------
function getCurrentContext(userMsg = "") {
    // No data loaded?
    if (!parsedCompanies.length) return "No CSV data loaded yet.";

    // Find the company mentioned by the user
    const match = parsedCompanies.find(
        (c) =>
            userMsg.toLowerCase().includes(c.Name.toLowerCase()) ||
            userMsg.toLowerCase().includes(c.Symbol.toLowerCase())
    );

    if (match) {
        let context = `
Company: ${match.Name}
Symbol: ${match.Symbol}
Rank: ${match.Rank}
Country: ${match.country}
Market Cap: $${Number(match.marketcap).toLocaleString()}
Price: $${match["price (USD)"]} USD
`;

        // Add mock financial data if available
        const fin = window.MOCK_FINANCIAL_DATA?.[match.Symbol];
        if (fin && fin.length) {
            const recent = fin[fin.length - 1];
            context += `
Latest Financial Snapshot:
- Market Cap (M): ${recent.marketcap}
- Revenue (M): ${recent.revenue}
- Earnings (M): ${recent.earnings}
- Debt (M): ${recent.debt}
- Price: $${recent.price}
`;
        }

        return context;
    }


    const summary = parsedCompanies
        .slice(0, 50)
        .map(
            (c) =>
                `${c.Rank}. ${c.Name} (${c.Symbol}) — $${c["price (USD)"]} — ${c.country}`
        )
        .join("\n");

    return `Top 50 Mining Companies:\n${summary}`;
}

// --------------- Chat UI Logic ---------------
const chatBtn = document.getElementById("chatbot-toggle");
const chatPanel = document.getElementById("chatbot-panel");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const chatOutput = document.getElementById("chat-output");

// Toggle panel visibility
chatBtn.addEventListener("click", () => {
    chatPanel.classList.toggle("hidden");
});

// --------------- Send Message ---------------
async function sendMessage() {
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;

    appendMessage("user", userMsg);
    chatInput.value = "";

    appendMessage("bot", "Thinking...");

    try {
        const context = getCurrentContext(userMsg);
        const fullPrompt = `
You are QuantOre AI, a financial and geospatial assistant that helps analyze mining companies, markets, and climate risk.

Context data (from QuantOre):
${context}

User question:
${userMsg}

Respond clearly using the context data. If you’re unsure, state what data you need.
`;

        const reply = await generateContent(fullPrompt);
        updateLastBotMessage(reply);
    } catch (err) {
        updateLastBotMessage(`⚠️ Error: ${err.message}`);
    }
}

// Send on button click or Enter key
chatSend.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

// --------------- Helper functions ---------------
function appendMessage(sender, text) {
    const div = document.createElement("div");
    div.className = sender === "user" ? "text-right" : "text-left";
    div.innerHTML = `<div class="${sender === "user" ? "bg-green-600" : "bg-gray-700"
        } inline-block px-3 py-2 rounded-lg whitespace-pre-line">${text}</div>`;
    chatOutput.appendChild(div);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

function updateLastBotMessage(newText) {
    const botMessages = chatOutput.querySelectorAll(".text-left div");
    const lastBotMsg = botMessages[botMessages.length - 1];
    if (lastBotMsg) lastBotMsg.textContent = newText;
    chatOutput.scrollTop = chatOutput.scrollHeight;
}