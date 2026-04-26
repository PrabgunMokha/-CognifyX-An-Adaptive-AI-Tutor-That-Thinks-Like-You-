const API = "http://127.0.0.1:8000";
const USER_ID = "cognifyx-demo-user";
let currentAssessment = null;

function byId(id) {
  return document.getElementById(id);
}

function setStatus(text) {
  byId("status").textContent = text || "";
}

function showModule(name) {
  document.querySelectorAll(".module").forEach((button) => {
    button.classList.toggle("active", button.dataset.module === name);
  });
  document.querySelectorAll(".module-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === name);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function request(path, body) {
  const response = await fetch(`${API}${path}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

function renderTutor(data) {
  const node = byId("tutorResult");
  node.classList.remove("hidden");
  node.innerHTML = `
    <div>
      <span class="pill">${data.style_used}</span>
      <span class="pill">${data.confusion_detected ? "Confusion detected" : "Clear signal"}</span>
    </div>
    <pre>${escapeHtml(data.reply)}</pre>
    <div class="card-grid">
      <div class="mini-card"><span class="label">Compression</span><p>${data.compression}</p></div>
      <div class="mini-card"><span class="label">Curiosity paths</span><p>${data.curiosity_paths.join(" | ")}</p></div>
    </div>
  `;
}

function renderInterview(data) {
  const node = byId("interviewResult");
  node.classList.remove("hidden");
  node.innerHTML = `
    <div class="mini-card"><span class="label">Scenario</span><p>${data.scenario}</p></div>
    <div class="mini-card"><span class="label">Question</span><p>${data.question}</p></div>
    <div class="card-grid">
      <div class="mini-card"><span class="label">Challenge</span><p>${data.challenge_level}</p></div>
      <div class="mini-card"><span class="label">Confidence</span><p>${data.confidence_state}</p></div>
    </div>
    <div class="mini-card"><span class="label">Feedback</span><p>${data.feedback}</p></div>
  `;
}

function renderConcept(data) {
  const slides = data.slides
    .map((slide) => `<div class="slide"><span class="label">Slide</span><h3>${slide.title}</h3><ul>${slide.bullets.map((b) => `<li>${b}</li>`).join("")}</ul></div>`)
    .join("");
  const node = byId("conceptResult");
  node.classList.remove("hidden");
  node.innerHTML = `
    <div class="card-grid">
      <div class="mini-card"><span class="label">Knowledge gaps</span><p>${data.knowledge_gaps.join(" | ")}</p></div>
      <div class="mini-card"><span class="label">Compression</span><p>${data.compression}</p></div>
    </div>
    <div class="mini-card"><span class="label">Concept graph</span><pre>${escapeHtml(data.mermaid)}</pre></div>
    ${slides}
  `;
}

function renderDebate(data) {
  const node = byId("debateResult");
  node.classList.remove("hidden");
  node.innerHTML = `
    <span class="pill">${data.debate_mode}</span>
    <div class="mini-card"><span class="label">Counterexample</span><p>${data.counterexample}</p></div>
    <div class="mini-card"><span class="label">Skeptical question</span><p>${data.skeptical_question}</p></div>
  `;
}

function renderCalibration(data) {
  const node = byId("calibrationResult");
  node.classList.remove("hidden");
  node.innerHTML = `
    <div class="card-grid">
      <div class="mini-card"><span class="label">Correctness</span><p>${data.is_correct ? "Correct" : "Needs work"}</p></div>
      <div class="mini-card"><span class="label">Confidence state</span><p>${data.confidence_state}</p></div>
      <div class="mini-card"><span class="label">Challenge</span><p>${data.challenge_adjustment}</p></div>
      <div class="mini-card"><span class="label">Next revision</span><p>${data.next_revision}</p></div>
    </div>
    <div class="mini-card"><span class="label">Pattern</span><p>${data.mistake_pattern}</p></div>
  `;
}

function renderRevisionList(data) {
  const revisions = data.revisions.length
    ? `<ul>${data.revisions.map((item) => `<li>${item.topic} -> ${item.next_revision} (${item.reason})</li>`).join("")}</ul>`
    : "<p>No revision items yet.</p>";
  byId("revisionList").innerHTML = `
    <div class="mini-card"><span class="label">Revision queue</span>${revisions}</div>
  `;
}

function renderQuestion(data, topic) {
  currentAssessment = data;
  const node = byId("questionBox");
  node.classList.remove("hidden");
  node.innerHTML = `
    <div class="mini-card">
      <span class="label">Question for ${topic}</span>
      <p>${data.question}</p>
      <p><strong>Hint:</strong> ${data.hint}</p>
    </div>
  `;
}

async function refreshSummary() {
  const dashboard = await request(`/api/dashboard?user_id=${USER_ID}`);
  const radar = await request(`/api/revision-radar?user_id=${USER_ID}`);
  byId("personaText").textContent = dashboard.persona;
  byId("challengeText").textContent = dashboard.challenge_level;
  byId("revisionCount").textContent = String(radar.revisions.length);
  renderRevisionList(radar);
}

async function boot() {
  const savedProfile = localStorage.getItem("cognifyx-profile");
  if (savedProfile) {
    byId("authScreen").classList.add("hidden");
  }

  byId("enterDashboard").addEventListener("click", () => {
    const profile = {
      username: byId("authUsername").value.trim(),
      email: byId("authEmail").value.trim(),
      password: byId("authPassword").value.trim(),
      school: byId("authSchool").value.trim(),
      className: byId("authClass").value.trim(),
    };
    if (!profile.username || !profile.email || !profile.password || !profile.school || !profile.className) {
      setStatus("Fill all login fields.");
      return;
    }
    localStorage.setItem("cognifyx-profile", JSON.stringify(profile));
    byId("authScreen").classList.add("hidden");
    setStatus("Profile saved.");
  });

  document.querySelectorAll(".module").forEach((button) => {
    button.addEventListener("click", () => showModule(button.dataset.module));
  });

  byId("runTutor").addEventListener("click", async () => {
    setStatus("Running tutor session...");
    try {
      const data = await request("/api/tutor/session", {
        user_id: USER_ID,
        topic: byId("tutorTopic").value,
        message: byId("tutorMessage").value,
        goal: byId("tutorGoal").value,
        preferred_style: byId("tutorStyle").value,
      });
      renderTutor(data);
      await refreshSummary();
      setStatus("Tutor session ready.");
    } catch (error) {
      setStatus(`Tutor failed: ${error.message}`);
    }
  });

  document.querySelectorAll("[data-reframe]").forEach((button) => {
    button.addEventListener("click", async () => {
      setStatus("Reframing explanation...");
      try {
        const data = await request("/api/tutor/reframe", {
          user_id: USER_ID,
          topic: byId("tutorTopic").value,
          message: byId("tutorMessage").value,
          goal: byId("tutorGoal").value,
          requested_style: button.dataset.reframe,
        });
        renderTutor({
          ...data,
          confusion_detected: true,
          compression: "Reframed for faster understanding.",
          curiosity_paths: ["Try the roleplay module next", "Map this concept", "Debate the claim"],
        });
        setStatus("Explanation reframed.");
      } catch (error) {
        setStatus(`Reframe failed: ${error.message}`);
      }
    });
  });

  byId("runInterview").addEventListener("click", async () => {
    setStatus("Generating interview round...");
    try {
      const data = await request("/api/interview/session", {
        user_id: USER_ID,
        topic: byId("interviewTopic").value,
        role: byId("interviewRole").value,
        goal: "interview readiness",
        history: [{ role: "user", content: byId("interviewReply").value }],
        confidence: Number(byId("interviewConfidence").value),
      });
      renderInterview(data);
      await refreshSummary();
      setStatus("Interview round ready.");
    } catch (error) {
      setStatus(`Interview failed: ${error.message}`);
    }
  });

  byId("runConcept").addEventListener("click", async () => {
    setStatus("Building concept map...");
    try {
      const data = await request("/api/concept-map", {
        user_id: USER_ID,
        topic: byId("conceptTopic").value,
        goal: byId("conceptGoal").value,
      });
      renderConcept(data);
      await refreshSummary();
      setStatus("Concept map ready.");
    } catch (error) {
      setStatus(`Concept map failed: ${error.message}`);
    }
  });

  byId("runDebate").addEventListener("click", async () => {
    setStatus("Starting debate...");
    try {
      const data = await request("/api/debate/session", {
        user_id: USER_ID,
        topic: byId("debateTopic").value,
        claim: byId("debateClaim").value,
        history: [],
      });
      renderDebate(data);
      byId("debateAnswerBox").classList.remove("hidden");
      setStatus("Debate ready.");
    } catch (error) {
      setStatus(`Debate failed: ${error.message}`);
    }
  });

  byId("reviewDebate").addEventListener("click", async () => {
    setStatus("Reviewing your defense...");
    try {
      const data = await request("/api/debate/review", {
        user_id: USER_ID,
        topic: byId("debateTopic").value,
        claim: byId("debateClaim").value,
        defense: byId("debateDefense").value,
        confidence: Number(byId("debateConfidence").value),
      });
      const node = byId("debateReview");
      node.classList.remove("hidden");
      node.innerHTML = `
        <div class="card-grid">
          <div class="mini-card"><span class="label">Confidence state</span><p>${data.confidence_state}</p></div>
          <div class="mini-card"><span class="label">Next revision</span><p>${data.next_revision}</p></div>
        </div>
        <div class="mini-card"><span class="label">Critique</span><p>${data.critique}</p></div>
        <div class="mini-card"><span class="label">Expected answer</span><p>${data.expected_answer}</p></div>
      `;
      await refreshSummary();
      setStatus("Debate review ready.");
    } catch (error) {
      setStatus(`Debate review failed: ${error.message}`);
    }
  });

  byId("loadQuestion").addEventListener("click", async () => {
    setStatus("Generating question...");
    try {
      const data = await request("/api/assessment/question", {
        user_id: USER_ID,
        topic: byId("calTopic").value,
        mode: "revision",
      });
      renderQuestion(data, byId("calTopic").value);
      setStatus("Question ready.");
    } catch (error) {
      setStatus(`Question failed: ${error.message}`);
    }
  });

  byId("runCalibration").addEventListener("click", async () => {
    if (!currentAssessment) {
      setStatus("Ask a question first.");
      return;
    }
    setStatus("Calibrating knowledge...");
    try {
      const data = await request("/api/calibrate", {
        user_id: USER_ID,
        topic: byId("calTopic").value,
        learner_answer: byId("learnerAnswer").value,
        expected_answer: currentAssessment.expected_answer,
        confidence: Number(byId("calConfidence").value),
      });
      renderCalibration(data);
      byId("calibrationResult").innerHTML += `
        <div class="mini-card"><span class="label">Expected answer</span><p>${currentAssessment.expected_answer}</p></div>
      `;
      await refreshSummary();
      setStatus("Calibration ready.");
    } catch (error) {
      setStatus(`Calibration failed: ${error.message}`);
    }
  });

  try {
    await refreshSummary();
    setStatus("Ready.");
  } catch (error) {
    setStatus(`Backend connection failed: ${error.message}`);
  }
}

boot();
