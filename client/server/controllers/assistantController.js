const ChatMessage = require("../models/ChatMessage");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { logActivity } = require("../utils/activityLogger");

// ─── Fallback responses ───────────────────────────────────────────────────────
// Only used when GROQ_API_KEY is absent OR when Groq request fails.
const FALLBACK_RESPONSES = {
  pipeline: `I've analyzed the **E2E Testing Pipeline** failure.\n\n**Root Cause:** The build fails at \`mock-test.js:42\` due to a missing dependency \`tw-animate-css\` in the test environment.\n\n**Recommended Fix:**\n\`\`\`bash\nnpm install tw-animate-css --save-dev\n\`\`\`\n\nI can also create a pull request that:\n1. Adds the missing dependency\n2. Updates the CI config to cache node_modules\n3. Adds a retry policy for flaky tests\n\nShall I proceed with the auto-fix?`,
  sprint: `Here's the **Sprint 4 Status Report:**\n\n| Metric | Value |\n|--------|-------|\n| Completion | 87.5% (28/32 tasks) |\n| Velocity | 94.2 pts (+8.3%) |\n| Blocked | 1 item (E2E Pipeline) |\n| At Risk | 2 items nearing deadline |\n\n**Recommendation:** Move the 2 pending items to Sprint 5 and auto-assign the blocked task to AI Agent for resolution. This will close Sprint 4 at 93.75% completion.\n\nWould you like me to generate the sprint outline?`,
  review: `**Code Review Summary — Auth Module (PR #47)**\n\n✅ **Security:** JWT refresh token rotation implemented correctly\n✅ **Performance:** Login API response time: ~120ms (within target)\n⚠️ **Warning:** Password hashing uses bcrypt with cost=10. Recommend upgrading to cost=12 for production.\n\n\`\`\`javascript\n// Current (PR #47)\nconst hash = await bcrypt.hash(password, 10);\n\n// Recommended\nconst hash = await bcrypt.hash(password, 12);\n\`\`\`\n\n📝 **Style:** 2 minor ESLint warnings in \`authController.js\` (unused imports). Auto-fixable.\n\nOverall: **Approve with minor changes**. Shall I auto-fix the ESLint issues?`,
  velocity: `**Team Velocity Analysis (Last 12 Weeks):**\n\n📈 Sprint velocity has increased **30.5%** from W1 (72 pts) → W12 (94.2 pts).\n\n**Top Performers:**\n1. 🥇 Pilot Agent α — 100% velocity, 74 tasks resolved\n2. 🥈 Priya Nair — 99% velocity, 55 tasks\n3. 🥉 Sarah Jenkins — 98% velocity, 42 tasks\n\n**AI Impact:** 47 tasks auto-resolved this month, saving approximately **38 engineering hours**.\n\n**Forecast:** At current trajectory, Q3 backlog will clear **2 weeks ahead of schedule**. I recommend expanding AI auto-assignment to Code Review and QA workflows.`,
  default: `I've processed your request. Here's what I found:\n\nBased on current workspace data, I can help you with:\n- **Task Analysis** — blockers, risk scoring, auto-resolution\n- **Sprint Planning** — velocity forecasting, workload distribution\n- **Code Reviews** — automated quality checks, dependency audits\n- **Team Insights** — performance metrics, availability optimization\n\nCould you provide more details about what you'd like me to focus on?`,
};

function getFallbackAIResponse(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("pipeline") || p.includes("block") || p.includes("e2e") || p.includes("fix")) return FALLBACK_RESPONSES.pipeline;
  if (p.includes("sprint") || p.includes("plan") || p.includes("status")) return FALLBACK_RESPONSES.sprint;
  if (p.includes("review") || p.includes("code") || p.includes("pr") || p.includes("auth")) return FALLBACK_RESPONSES.review;
  if (p.includes("velocity") || p.includes("team") || p.includes("performance") || p.includes("analytics")) return FALLBACK_RESPONSES.velocity;
  return FALLBACK_RESPONSES.default;
}

function getFormattedTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Detect if prompt is workspace-specific ───────────────────────────────────
// If yes, we inject live DB context into the system prompt.
function isWorkspaceQuery(prompt) {
  const p = prompt.toLowerCase();
  return (
    p.includes("task") ||
    p.includes("project") ||
    p.includes("sprint") ||
    p.includes("backlog") ||
    p.includes("team") ||
    p.includes("blocked") ||
    p.includes("deadline") ||
    p.includes("velocity") ||
    p.includes("my work") ||
    p.includes("pending") ||
    p.includes("overdue") ||
    p.includes("assign")
  );
}

// ─── Build live workspace context string for the system prompt ────────────────
async function buildWorkspaceContext(userId) {
  try {
    const [tasks, projects] = await Promise.all([
      Task.find({ createdBy: userId })
        .sort({ dueDate: 1 })
        .limit(20)
        .select("title status priority dueDate project")
        .lean(),
      Project.find({ createdBy: userId })
        .limit(10)
        .select("name status priority progress dueDate")
        .lean(),
    ]);

    const taskLines = tasks.map((t) => {
      const due = t.dueDate ? ` (due: ${new Date(t.dueDate).toLocaleDateString()})` : "";
      return `- [${t.status}] ${t.title} | Priority: ${t.priority} | Project: ${t.project || "General"}${due}`;
    });

    const projectLines = projects.map(
      (p) =>
        `- [${p.status}] ${p.name} | Priority: ${p.priority} | Progress: ${p.progress}%`
    );

    let context = "";
    if (projectLines.length > 0) {
      context += `\n\nActive Projects:\n${projectLines.join("\n")}`;
    }
    if (taskLines.length > 0) {
      context += `\n\nRecent Tasks:\n${taskLines.join("\n")}`;
    }
    return context;
  } catch (_err) {
    return "";
  }
}

// @desc    Get chat history
// @route   GET /api/assistant/history
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Send a message to the AI assistant
// @route   POST /api/assistant/chat
// @access  Private
exports.sendChatMessage = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a prompt message",
      });
    }

    const userId = req.user._id;
    const timestampStr = getFormattedTime();

    // ── Diagnostic: verify env key is loaded ──────────────────────────────────
    const apiKey = process.env.GROQ_API_KEY;
    console.log("GROQ KEY EXISTS:", !!apiKey);

    // 1. Save user message to database
    await ChatMessage.create({
      user: userId,
      sender: "user",
      text: prompt.trim(),
      timestamp: timestampStr,
    });

    let aiResponseText = "";
    let usedGroq = false;

    if (apiKey && apiKey.trim()) {
      try {
        // ── Fetch last 10 messages for conversational memory ──────────────────
        const pastMessages = await ChatMessage.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        const formattedMessages = pastMessages.reverse().map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }));

        // ── Build system prompt — inject live DB context if workspace query ───
        let systemContent =
          "You are TaskPilot AI, an autonomous workspace intelligence agent and general-purpose AI assistant. " +
          "You help with code analysis, sprint planning, team velocity, task management, AND general knowledge questions. " +
          "Answer all questions fully and helpfully. " +
          "Format responses with clean Markdown, lists, and tables where applicable. " +
          "For general knowledge questions (geography, history, science, etc.), answer directly and accurately.";

        if (isWorkspaceQuery(prompt)) {
          const workspaceContext = await buildWorkspaceContext(userId);
          if (workspaceContext) {
            systemContent += "\n\nHere is the user's current workspace data to reference when answering:" + workspaceContext;
          }
        }

        const systemPrompt = { role: "system", content: systemContent };

        // ── Call Groq API ─────────────────────────────────────────────────────
        console.log("USING GROQ MODEL: llama-3.1-8b-instant");
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [systemPrompt, ...formattedMessages],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        const data = await groqRes.json();

        // ── Detect and surface API-level errors (model deprecated, quota, etc.)
        if (data?.error) {
          throw new Error(`Groq API error: ${data.error.message}`);
        }

        if (data?.choices?.[0]?.message?.content) {
          aiResponseText = data.choices[0].message.content;
          usedGroq = true;
          console.log("GROQ RESPONSE RECEIVED — length:", aiResponseText.length);
        } else {
          throw new Error("Groq returned an unexpected response structure: " + JSON.stringify(data));
        }
      } catch (groqErr) {
        // ── Groq failed — log full error and fall back ────────────────────────
        console.error("Groq API failed, using fallback:", groqErr.message);
        aiResponseText = getFallbackAIResponse(prompt);
      }
    } else {
      // ── No API key configured — use fallback simulation ───────────────────
      console.log("GROQ_API_KEY not set — using fallback simulation");
      aiResponseText = getFallbackAIResponse(prompt);
    }

    console.log("RESPONSE SOURCE:", usedGroq ? "Groq LLM" : "Fallback");

    // 2. Save AI response to database
    const aiMsg = await ChatMessage.create({
      user: userId,
      sender: "ai",
      text: aiResponseText,
      timestamp: getFormattedTime(),
    });

    logActivity(
      userId,
      "Assistant Message Exchanged",
      "ChatMessage",
      aiMsg._id,
      `User queried AI [${usedGroq ? "Groq" : "Fallback"}]: "${prompt.substring(0, 40)}..."`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      data: aiMsg,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Clear chat history
// @route   DELETE /api/assistant/chat
// @access  Private
exports.clearChatHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });

    logActivity(
      req.user._id,
      "Assistant History Cleared",
      "ChatMessage",
      null,
      "Assistant chat history cleared",
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};
