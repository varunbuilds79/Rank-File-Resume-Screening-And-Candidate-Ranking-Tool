/**
 * Smart Resume Screening and Candidate Ranking Tool - Application Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  function loadInitialJobs() {
    const saved = localStorage.getItem("app_jobs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return typeof SAMPLE_JOBS !== "undefined" ? [...SAMPLE_JOBS] : [];
  }

  function loadInitialCandidates() {
    const saved = localStorage.getItem("app_candidates");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return typeof SAMPLE_CANDIDATES !== "undefined" ? [...SAMPLE_CANDIDATES] : [];
  }

  let jobs = loadInitialJobs();
  let candidates = loadInitialCandidates();
  let activeTab = "tab-landing";

  function saveJobs() {
    localStorage.setItem("app_jobs", JSON.stringify(jobs));
  }

  function saveCandidates() {
    localStorage.setItem("app_candidates", JSON.stringify(candidates));
  }

  const navLinks = document.querySelectorAll(".nav-link");
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const tabNavBtns = document.querySelectorAll(".tab-nav-btn, .nav-cta");

  const resumeTextarea = document.getElementById("resume-text");
  const jobTextarea = document.getElementById("job-text");
  const selectSampleJob = document.getElementById("select-sample-job");

  const dropzone = document.getElementById("resume-dropzone");
  const fileInput = document.getElementById("file-input");
  const btnAnalyze = document.getElementById("btn-analyze");
  const btnResetResume = document.getElementById("btn-reset-resume");
  const resultsSection = document.getElementById("results-section");

  const scoreMeter = document.getElementById("score-meter");
  const scoreVal = document.getElementById("score-val");
  const scoreBadge = document.getElementById("score-badge");

  const subHardskillMeter = document.getElementById("sub-hardskill-meter");
  const subHardskillVal = document.getElementById("sub-hardskill-val");

  const subSemanticMeter = document.getElementById("sub-semantic-meter");
  const subSemanticVal = document.getElementById("sub-semantic-val");

  const atsScoreMeter = document.getElementById("ats-score-meter");
  const atsScoreVal = document.getElementById("ats-score-val");
  const atsScoreBadge = document.getElementById("ats-score-badge");

  const matchedSkillsContainer = document.getElementById("matched-skills-container");
  const missingSkillsContainer = document.getElementById("missing-skills-container");
  const interviewQuestionsContainer = document.getElementById("interview-questions-container");
  const suggestionsContainer = document.getElementById("suggestions-container");
  const tailoredResumePreview = document.getElementById("tailored-resume-preview");

  const btnCopyResume = document.getElementById("btn-copy-resume");
  const btnDownloadTxt = document.getElementById("btn-download-txt");
  const btnThemeToggle = document.getElementById("btn-theme-toggle");

  const adminJobsContainer = document.getElementById("admin-jobs-container");
  const adminApplicantsContainer = document.getElementById("admin-applicants-container");
  const adminFilterJobSelect = document.getElementById("admin-filter-job-select");
  const btnClearAllApplicants = document.getElementById("btn-clear-all-applicants");
  const btnExportCsv = document.getElementById("btn-export-csv");

  const modalAddJob = document.getElementById("modal-add-job");
  const modalAddApplicant = document.getElementById("modal-add-applicant");

  const chatbotToggleBtn = document.getElementById("chatbot-toggle-btn");
  const chatbotWindow = document.getElementById("chatbot-window");
  const chatbotCloseBtn = document.getElementById("chatbot-close-btn");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSendBtn = document.getElementById("chatbot-send-btn");

  let chatHistory = [];

  if (btnResetResume) {
    btnResetResume.addEventListener("click", () => {
      if (resumeTextarea) resumeTextarea.value = "";
      if (fileInput) fileInput.value = "";
      if (resultsSection) resultsSection.style.display = "none";
      if (typeof lucide !== "undefined") lucide.createIcons();
    });
  }

  function switchTab(targetTabId) {
    activeTab = targetTabId;

    tabContents.forEach(c => c.classList.remove("active"));
    navLinks.forEach(l => l.classList.remove("active"));
    tabBtns.forEach(b => b.classList.remove("active"));

    const targetContent = document.getElementById(targetTabId);
    if (targetContent) targetContent.classList.add("active");

    const activeNav = document.querySelector(`.nav-link[data-tab="${targetTabId}"]`);
    if (activeNav) activeNav.classList.add("active");

    const activeSubTab = document.querySelector(`.tab-btn[data-tab="${targetTabId}"]`);
    if (activeSubTab) activeSubTab.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (activeTab === "tab-admin") {
      renderAdminView();
    }
  }

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      switchTab(link.getAttribute("data-tab"));
    });
  });

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.getAttribute("data-tab"));
    });
  });

  tabNavBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.getAttribute("data-tab"));
    });
  });

  function renderJobSelects() {
    if (selectSampleJob) {
      selectSampleJob.innerHTML = jobs.map(j => `
        <option value="${j.id}">${j.title} (${j.department || 'Engineering'})</option>
      `).join("");
    }

    if (adminFilterJobSelect) {
      adminFilterJobSelect.innerHTML = jobs.map(j => `
        <option value="${j.id}">Filter Applicants by: ${j.title}</option>
      `).join("");
    }

    if (jobs.length > 0 && jobTextarea) {
      jobTextarea.value = jobs[0].description;
    }
  }

  if (selectSampleJob) {
    selectSampleJob.addEventListener("change", (e) => {
      const selected = jobs.find(j => j.id === e.target.value);
      if (selected && jobTextarea) {
        jobTextarea.value = selected.description;
      }
    });
  }

  if (adminFilterJobSelect) {
    adminFilterJobSelect.addEventListener("change", () => {
      renderAdminApplicants();
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.style.borderColor = "var(--primary)";
      dropzone.style.background = "rgba(79, 70, 229, 0.08)";
    });
    dropzone.addEventListener("dragleave", () => {
      dropzone.style.borderColor = "var(--glass-border-glow)";
      dropzone.style.background = "rgba(79, 70, 229, 0.03)";
    });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.style.borderColor = "var(--glass-border-glow)";
      dropzone.style.background = "rgba(79, 70, 229, 0.03)";
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0], resumeTextarea);
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length) handleFile(e.target.files[0], resumeTextarea);
    });
  }

  function handleFile(file, targetTextarea) {
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (evt) => { targetTextarea.value = evt.target.result; };
      reader.readAsText(file);
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      parsePdfFile(file, targetTextarea);
    } else {
      alert("Please upload a .TXT or .PDF file.");
    }
  }

  function parsePdfFile(file, targetTextarea) {
    const fileReader = new FileReader();
    fileReader.onload = function () {
      const typedarray = new Uint8Array(this.result);
      if (typeof pdfjsLib !== "undefined") {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        pdfjsLib.getDocument(typedarray).promise.then((pdf) => {
          let textPromises = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            textPromises.push(pdf.getPage(i).then(page => page.getTextContent()));
          }
          Promise.all(textPromises).then(pagesText => {
            let fullText = pagesText.map(pt => pt.items.map(item => item.str).join(" ")).join("\n");
            targetTextarea.value = fullText;
          });
        }).catch(() => {
          alert("Could not parse PDF. Please paste resume text directly into the box.");
        });
      } else {
        alert("PDF parser library loading. Please paste text directly into the box.");
      }
    };
    fileReader.readAsArrayBuffer(file);
  }

  if (btnAnalyze) {
    btnAnalyze.addEventListener("click", async () => {
      const resumeText = resumeTextarea.value.trim();
      const jobText = jobTextarea.value.trim();

      if (!resumeText) {
        alert("Please upload or paste your resume text first!");
        return;
      }
      if (!jobText) {
        alert("Please paste the target job description!");
        return;
      }

      const gapAnalysis = NLPEngine.analyzeGap(resumeText, jobText);

      try {
        const pyRes = await fetch("/api/py-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_text: resumeText, job_description: jobText })
        });
        if (pyRes.ok) {
          const pyData = await pyRes.json();
          if (pyData.semanticScore) {
            gapAnalysis.subScores.semanticSimilarity = pyData.semanticScore;
            gapAnalysis.matchScore = Math.round(
              (gapAnalysis.subScores.hardSkills * 0.5) +
              (pyData.semanticScore * 0.3) +
              (gapAnalysis.subScores.atsReadiness * 0.2)
            );
          }
        }
      } catch (err) {
        console.log("Python AI Engine offline. Using JavaScript local fallback.");
      }

      scoreVal.textContent = `${gapAnalysis.matchScore}%`;
      const scoreColor = gapAnalysis.matchScore >= 80 ? "var(--success)" : gapAnalysis.matchScore >= 60 ? "var(--warning)" : "var(--danger)";
      scoreMeter.style.borderColor = scoreColor;
      scoreMeter.style.boxShadow = `0 0 20px ${scoreColor}40`;
      scoreBadge.className = gapAnalysis.matchScore >= 80 ? "badge badge-success" : gapAnalysis.matchScore >= 60 ? "badge badge-warning" : "badge badge-danger";
      scoreBadge.textContent = gapAnalysis.matchScore >= 80 ? "High Match Ready" : gapAnalysis.matchScore >= 60 ? "Moderate Match" : "Needs Optimization";

      if (subHardskillVal) {
        subHardskillVal.textContent = `${gapAnalysis.subScores.hardSkills}%`;
        subHardskillMeter.style.borderColor = gapAnalysis.subScores.hardSkills >= 75 ? "var(--primary)" : "var(--warning)";
      }

      if (subSemanticVal) {
        subSemanticVal.textContent = `${gapAnalysis.subScores.semanticSimilarity}%`;
        subSemanticMeter.style.borderColor = gapAnalysis.subScores.semanticSimilarity >= 70 ? "var(--accent-cyan)" : "var(--warning)";
      }

      atsScoreVal.textContent = `${gapAnalysis.atsResult.totalScore}%`;
      const atsColor = gapAnalysis.atsResult.totalScore >= 80 ? "var(--success)" : gapAnalysis.atsResult.totalScore >= 60 ? "var(--warning)" : "var(--danger)";
      atsScoreMeter.style.borderColor = atsColor;
      atsScoreBadge.textContent = gapAnalysis.atsResult.totalScore >= 80 ? "ATS Optimized" : "Fix Formatting";

      matchedSkillsContainer.innerHTML = gapAnalysis.matchedSkills.length > 0
        ? gapAnalysis.matchedSkills.map(s => `<span class="skill-pill match">${s}</span>`).join("")
        : '<span style="font-size:0.8rem; color:var(--text-muted);">No direct skill matches detected</span>';

      missingSkillsContainer.innerHTML = gapAnalysis.missingSkills.length > 0
        ? gapAnalysis.missingSkills.map(s => `<span class="skill-pill missing">${s}</span>`).join("")
        : '<span style="font-size:0.8rem; color:var(--success);">All key required skills present!</span>';

      if (interviewQuestionsContainer) {
        interviewQuestionsContainer.innerHTML = (gapAnalysis.interviewQuestions && gapAnalysis.interviewQuestions.length > 0)
          ? gapAnalysis.interviewQuestions.map((q, idx) => `
              <div style="background: rgba(2, 132, 199, 0.05); border-left: 3px solid var(--accent-cyan); padding: 10px 14px; border-radius: 6px; margin-bottom: 8px;">
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan);">QUESTION #${idx + 1}</span>
                <p style="font-size: 0.85rem; margin-top: 2px;">${q}</p>
              </div>
            `).join("")
          : '<p style="font-size:0.85rem; color:var(--text-muted);">Candidate meets core technical skill requirements.</p>';
      }

      suggestionsContainer.innerHTML = gapAnalysis.suggestions.map(s => `
        <div class="suggestion-item">
          <h4>${s.title}</h4>
          <p>${s.text}</p>
        </div>
      `).join("");

      const tailoredText = NLPEngine.generateTailoredResume(resumeText, jobText, gapAnalysis);
      tailoredResumePreview.textContent = tailoredText;

      resultsSection.style.display = "block";
      resultsSection.scrollIntoView({ behavior: "smooth" });

      if (typeof lucide !== "undefined") lucide.createIcons();
    });
  }

  if (btnCopyResume) {
    btnCopyResume.addEventListener("click", () => {
      const text = tailoredResumePreview.textContent;
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        btnCopyResume.innerHTML = `<i data-lucide="check"></i> Copied!`;
        setTimeout(() => {
          btnCopyResume.innerHTML = `<i data-lucide="copy"></i> Copy Text`;
          if (typeof lucide !== "undefined") lucide.createIcons();
        }, 2000);
      });
    });
  }

  if (btnDownloadTxt) {
    btnDownloadTxt.addEventListener("click", () => {
      const text = tailoredResumePreview.textContent;
      if (!text) return;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Tailored_Resume_Optimized.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  function renderAdminView() {
    renderAdminJobs();
    renderAdminApplicants();
  }

  function renderAdminJobs() {
    if (!adminJobsContainer) return;
    if (jobs.length === 0) {
      adminJobsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">
          No job openings found. Click "Add New Job Opening" to create one.
        </div>
      `;
      return;
    }

    adminJobsContainer.innerHTML = jobs.map(j => `
      <div class="admin-card">
        <div>
          <div class="admin-card-header">
            <div>
              <span class="badge badge-success">${j.department || 'Engineering'}</span>
              <h3 class="admin-card-title" style="margin-top: 4px;">${j.title}</h3>
              <p class="admin-card-sub">Experience Req: ${j.experienceRequired || '3+ Years'}</p>
            </div>
            <button class="btn btn-danger btn-sm btn-delete-job" data-job-id="${j.id}" title="Delete Job Opening">
              <i data-lucide="trash-2"></i> Delete
            </button>
          </div>
          <div class="skills-container" style="margin-top: 10px;">
            <div class="section-sub">REQUIRED SKILLS</div>
            <div class="skill-pills">
              ${(j.requiredSkills || []).map(s => `<span class="skill-pill match">${s}</span>`).join("")}
            </div>
          </div>
        </div>
      </div>
    `).join("");

    if (typeof lucide !== "undefined") lucide.createIcons();

    document.querySelectorAll(".btn-delete-job").forEach(btn => {
      btn.addEventListener("click", () => {
        const jobId = btn.getAttribute("data-job-id");
        const job = jobs.find(j => j.id === jobId);
        if (confirm(`Are you sure you want to delete the job opening "${job ? job.title : jobId}"?`)) {
          jobs = jobs.filter(j => j.id !== jobId);
          saveJobs();
          renderJobSelects();
          renderAdminView();
        }
      });
    });
  }

  function renderAdminApplicants() {
    if (!adminApplicantsContainer) return;
    const selectedJobId = adminFilterJobSelect ? adminFilterJobSelect.value : (jobs[0] ? jobs[0].id : null);
    const targetJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

    if (candidates.length === 0) {
      adminApplicantsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">
          No applicants currently in database. Click "Add Applicant" to upload candidate resumes.
        </div>
      `;
      return;
    }

    const evaluatedCandidates = candidates.map(c => {
      const entities = NLPEngine.extractEntities(c.resumeText);
      const gap = targetJob ? NLPEngine.analyzeGap(c.resumeText, targetJob.description) : { matchScore: 75, atsResult: { totalScore: 80 }, matchedSkills: [], missingSkills: [] };
      return { ...c, entities, gap };
    });

    evaluatedCandidates.sort((a, b) => b.gap.matchScore - a.gap.matchScore);

    adminApplicantsContainer.innerHTML = evaluatedCandidates.map((c, index) => {
      const matchedPills = c.gap.matchedSkills.slice(0, 4).map(s => `<span class="skill-pill match">${s}</span>`).join("");
      const missingPills = c.gap.missingSkills.slice(0, 3).map(s => `<span class="skill-pill missing">${s}</span>`).join("");

      const rankNum = index + 1;
      const rankColor = rankNum === 1 ? "#eab308" : rankNum === 2 ? "#94a3b8" : rankNum === 3 ? "#b45309" : "#4f46e5";

      return `
        <div class="admin-card">
          <div>
            <div class="admin-card-header">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="badge" style="background: ${rankColor}; color: #ffffff; font-weight: 800; font-size: 0.85rem; padding: 4px 10px;">
                  Rank #${rankNum}
                </span>
                <div>
                  <h3 class="admin-card-title">${c.name}</h3>
                  <p class="admin-card-sub">${c.email || c.entities.email || 'No Email'} • ${c.phone || c.entities.phone || 'No Phone'}</p>
                </div>
              </div>
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span class="badge ${c.gap.matchScore >= 80 ? 'badge-success' : c.gap.matchScore >= 60 ? 'badge-warning' : 'badge-danger'}">
                  ${c.gap.matchScore}% Match
                </span>
                <span class="badge" style="background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc;">
                  ${c.gap.atsResult ? c.gap.atsResult.totalScore : 80}% ATS
                </span>
                <button class="btn btn-danger btn-sm btn-delete-candidate" data-cand-id="${c.id}" title="Remove Candidate">
                  <i data-lucide="trash-2"></i> Delete
                </button>
              </div>
            </div>

            <div class="skills-container" style="margin-top: 8px;">
              <div class="section-sub">MATCHED SKILLS (${c.gap.matchedSkills.length})</div>
              <div class="skill-pills">${matchedPills || '<span style="font-size:0.75rem; color:var(--text-muted);">None</span>'}</div>
            </div>

            ${missingPills ? `
              <div class="skills-container" style="margin-top: 8px;">
                <div class="section-sub" style="color:var(--danger);">MISSING SKILLS (${c.gap.missingSkills.length})</div>
                <div class="skill-pills">${missingPills}</div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join("");

    if (typeof lucide !== "undefined") lucide.createIcons();

    document.querySelectorAll(".btn-delete-candidate").forEach(btn => {
      btn.addEventListener("click", () => {
        const candId = btn.getAttribute("data-cand-id");
        const candidate = candidates.find(c => c.id === candId);
        if (confirm(`Are you sure you want to remove candidate "${candidate ? candidate.name : candId}"?`)) {
          candidates = candidates.filter(c => c.id !== candId);
          saveCandidates();
          renderAdminApplicants();
        }
      });
    });
  }

  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", () => {
      if (candidates.length === 0) {
        alert("No candidate data to export!");
        return;
      }
      let csvContent = "data:text/csv;charset=utf-8,Rank,Name,Email,MatchScore,MatchedSkills\n";
      candidates.forEach((c, idx) => {
        const entities = NLPEngine.extractEntities(c.resumeText);
        csvContent += `${idx + 1},"${c.name}","${c.email || entities.email || ''}",75%,"${entities.skills.join('; ')}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "RankAndFile_Candidate_Leaderboard.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  if (btnClearAllApplicants) {
    btnClearAllApplicants.addEventListener("click", () => {
      if (confirm("Are you sure you want to remove ALL applicants from the database?")) {
        candidates = [];
        saveCandidates();
        renderAdminApplicants();
      }
    });
  }

  const btnOpenAddJob = document.getElementById("btn-open-add-job-modal");
  const btnCloseJob = document.getElementById("btn-close-job-modal");
  const btnSubmitJob = document.getElementById("btn-submit-job");

  if (btnOpenAddJob) btnOpenAddJob.addEventListener("click", () => modalAddJob.classList.add("open"));
  if (btnCloseJob) btnCloseJob.addEventListener("click", () => modalAddJob.classList.remove("open"));

  if (btnSubmitJob) {
    btnSubmitJob.addEventListener("click", () => {
      const title = document.getElementById("input-job-title").value.trim();
      const dept = document.getElementById("input-job-dept").value.trim() || "Engineering";
      const exp = document.getElementById("input-job-exp").value.trim() || "3+ Years";
      const skillsRaw = document.getElementById("input-job-skills").value.trim();
      const desc = document.getElementById("input-job-desc").value.trim();

      if (!title || !desc) {
        alert("Please enter both Job Title and Job Description!");
        return;
      }

      const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()) : ["JavaScript", "SQL"];

      const newJob = {
        id: `job_${Date.now()}`,
        title,
        department: dept,
        experienceRequired: exp,
        requiredSkills: skills,
        description: desc
      };

      jobs.unshift(newJob);
      saveJobs();

      document.getElementById("input-job-title").value = "";
      document.getElementById("input-job-desc").value = "";
      document.getElementById("input-job-skills").value = "";
      modalAddJob.classList.remove("open");

      renderJobSelects();
      renderAdminView();
      alert(`New Job Opening "${title}" added successfully!`);
    });
  }

  const btnOpenAddApp = document.getElementById("btn-open-add-applicant-modal");
  const btnCloseApp = document.getElementById("btn-close-applicant-modal");
  const btnSubmitApp = document.getElementById("btn-submit-applicant");

  if (btnOpenAddApp) btnOpenAddApp.addEventListener("click", () => modalAddApplicant.classList.add("open"));
  if (btnCloseApp) btnCloseApp.addEventListener("click", () => modalAddApplicant.classList.remove("open"));

  const modalAppDropzone = document.getElementById("modal-app-dropzone");
  const modalAppFileInput = document.getElementById("modal-app-file-input");
  const inputAppResume = document.getElementById("input-app-resume");

  if (modalAppDropzone && modalAppFileInput) {
    modalAppDropzone.addEventListener("click", () => modalAppFileInput.click());
    modalAppFileInput.addEventListener("change", (e) => {
      if (e.target.files.length) handleFile(e.target.files[0], inputAppResume);
    });
  }

  if (btnSubmitApp) {
    btnSubmitApp.addEventListener("click", () => {
      const nameInput = document.getElementById("input-app-name").value.trim();
      const emailInput = document.getElementById("input-app-email").value.trim();
      const text = inputAppResume.value.trim();

      if (!text) {
        alert("Please upload or paste resume text!");
        return;
      }

      const entities = NLPEngine.extractEntities(text);
      const candidateName = nameInput || entities.name || "New Applicant";

      const newApplicant = {
        id: `cand_${Date.now()}`,
        name: candidateName,
        email: emailInput || entities.email || "",
        phone: entities.phone || "",
        resumeText: text
      };

      candidates.unshift(newApplicant);
      saveCandidates();

      document.getElementById("input-app-name").value = "";
      document.getElementById("input-app-email").value = "";
      inputAppResume.value = "";
      modalAddApplicant.classList.remove("open");

      renderAdminApplicants();
      alert(`Applicant "${candidateName}" added successfully!`);
    });
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      const icon = btnThemeToggle.querySelector("i");
      if (icon) icon.setAttribute("data-lucide", next === "light" ? "sun" : "moon");
      if (typeof lucide !== "undefined") lucide.createIcons();
    });
  }

  renderJobSelects();

  if (chatbotToggleBtn) {
    chatbotToggleBtn.addEventListener("click", () => {
      chatbotWindow.style.display = "flex";
      chatbotToggleBtn.style.display = "none";
    });
  }

  if (chatbotCloseBtn) {
    chatbotCloseBtn.addEventListener("click", () => {
      chatbotWindow.style.display = "none";
      chatbotToggleBtn.style.display = "flex";
    });
  }

  async function sendChatMessage() {
    const text = chatbotInput.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    chatbotInput.value = "";

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "chat-msg assistant";
    loadingDiv.textContent = "AI is typing...";
    loadingDiv.id = "grok-loader";
    chatbotMessages.appendChild(loadingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory.slice(-6),
        }),
      });

      const data = await response.json();
      document.getElementById("grok-loader")?.remove();

      if (data.reply) {
        appendMessage(data.reply, "assistant");
        chatHistory.push({ role: "user", content: text });
        chatHistory.push({ role: "assistant", content: data.reply });
      } else {
        fallbackLocalChatbotResponse(text);
      }
    } catch (err) {
      document.getElementById("grok-loader")?.remove();
      fallbackLocalChatbotResponse(text);
    }
  }

  function fallbackLocalChatbotResponse(userInput) {
    const query = userInput.toLowerCase();
    let reply = "I am your Rank&File assistant. Ask me about candidate skill gap analysis, ATS formatting rules, or how composite scores are calculated!";

    if (query.includes("ats") || query.includes("score")) {
      reply = "ATS scores measure contact detail formatting, section heading presence, action verb density, and quantifiable metric impact. Aim for 80%+!";
    } else if (query.includes("rank") || query.includes("candidate")) {
      reply = "In the Ranking Portal, candidates are sorted by composite match percentage combining hard skills overlap, TF-IDF vector similarity, and ATS readiness.";
    } else if (query.includes("skill") || query.includes("gap")) {
      reply = "The Skill Gap Finder compares candidate keywords against job descriptions to pinpoint missing high-priority technologies like Docker, AWS, or Python.";
    }

    appendMessage(reply, "assistant");
    chatHistory.push({ role: "user", content: userInput });
    chatHistory.push({ role: "assistant", content: reply });
  }

  function appendMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `chat-msg ${sender}`;
    div.textContent = text;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  if (chatbotSendBtn) chatbotSendBtn.addEventListener("click", sendChatMessage);
  if (chatbotInput) {
    chatbotInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendChatMessage();
    });
  }
});