/**
 * Smart Resume Screening and Candidate Ranking Tool - Advanced NLP Core Engine
 */

const SKILL_CATEGORIES = {
  frontend: [
    "javascript", "js", "typescript", "ts", "react", "react.js", "reactjs", "next.js", 
    "nextjs", "vue", "vue.js", "angular", "html", "css", "tailwind", "bootstrap", 
    "sass", "redux", "zustand", "webpack", "vite"
  ],
  backend: [
    "node", "node.js", "nodejs", "express", "python", "django", "flask", "fastapi", 
    "java", "spring", "spring boot", "c#", "csharp", ".net", "dotnet", "c++", 
    "cpp", "golang", "go", "php", "laravel", "graphql", "rest", "restful", "api", "microservices"
  ],
  database: [
    "sql", "postgresql", "postgres", "mysql", "sqlite", "oracle", "nosql", 
    "mongodb", "mongo", "dynamodb", "redis", "elasticsearch", "cassandra"
  ],
  devops_cloud: [
    "aws", "azure", "gcp", "docker", "kubernetes", "k8s", "ci/cd", "jenkins", 
    "github actions", "gitlab ci", "git", "github", "linux", "bash", "terraform", 
    "ansible", "cloudformation", "prometheus", "grafana"
  ],
  ai_data: [
    "machine learning", "ml", "deep learning", "dl", "tensorflow", "pytorch", 
    "keras", "nlp", "pandas", "numpy", "scikit-learn", "sklearn", "tableau", 
    "power bi", "llm", "transformers", "spacy", "opencv", "r", "pyspark"
  ],
  mobile: [
    "flutter", "dart", "react native", "swift", "swiftui", "kotlin", "android", 
    "ios", "objective-c", "xcode"
  ],
  cybersecurity: [
    "cybersecurity", "penetration testing", "pen testing", "ethical hacking", 
    "soc", "siem", "wireshark", "cissp", "ceh", "firewall", "vulnerability assessment", 
    "iam", "zero trust"
  ],
  product_management: [
    "product management", "product strategy", "user stories", "market research", 
    "a/b testing", "kpis", "okrs", "user research", "wireframing", "feature prioritization", 
    "product analytics"
  ],
  design_ux: [
    "figma", "sketch", "adobe xd", "ui/ux", "user experience", "user interface", 
    "prototyping", "design systems", "usability testing"
  ],
  qa_testing: [
    "unit testing", "integration testing", "selenium", "cypress", "playwright", 
    "jest", "junit", "postman", "qa automation", "manual testing"
  ],
  agile_management: [
    "agile", "scrum", "kanban", "jira", "confluence", "pmp", "project management", 
    "sprint planning", "stakeholder management"
  ],
  soft_domain: [
    "leadership", "mentorship", "communication", "problem solving", 
    "time management", "critical thinking", "collaboration", "cross-functional"
  ]
};

const SKILL_TAXONOMY = {};
Object.entries(SKILL_CATEGORIES).forEach(([category, skills]) => {
  skills.forEach(skill => {
    SKILL_TAXONOMY[skill] = category;
  });
});

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing",
  "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
  "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
  "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
  "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should",
  "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
  "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
  "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn me", "we",
  "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
  "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
  "experience", "work", "responsible", "working", "using", "used", "ability", "strong", "good", "well", "team"
]);

class NLPEngine {
  static tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .filter(token => token.length > 1 && !STOP_WORDS.has(token));
  }

  static getTF(tokens) {
    const tf = {};
    const total = tokens.length || 1;
    tokens.forEach(t => tf[t] = (tf[t] || 0) + 1);
    Object.keys(tf).forEach(k => tf[k] = tf[k] / total);
    return tf;
  }

  static calculateCosineSimilarity(textA, textB) {
    const tokensA = this.tokenize(textA);
    const tokensB = this.tokenize(textB);
    if (tokensA.length === 0 || tokensB.length === 0) return 0;

    const tfA = this.getTF(tokensA);
    const tfB = this.getTF(tokensB);
    const allWords = new Set([...Object.keys(tfA), ...Object.keys(tfB)]);

    let dotProduct = 0, magA = 0, magB = 0;
    allWords.forEach(w => {
      const valA = tfA[w] || 0;
      const valB = tfB[w] || 0;
      dotProduct += valA * valB;
      magA += valA * valA;
      magB += valB * valB;
    });

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    return (magA && magB) ? (dotProduct / (magA * magB)) : 0;
  }

  static extractEntities(text) {
    if (!text) return { name: "Candidate", email: null, phone: null, skills: [], skillCategories: {} };

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

    const nameLine = text.split("\n")
      .map(l => l.trim())
      .find(l => l.length > 2 && l.length < 35 && !l.includes("@") && !l.toLowerCase().includes("resume")) || "Candidate";

    const detectedSkills = new Set();
    const skillCategories = { 
      frontend: [], backend: [], database: [], devops_cloud: [], ai_data: [], 
      mobile: [], cybersecurity: [], product_management: [], design_ux: [], 
      qa_testing: [], agile_management: [], soft_domain: [] 
    };

    Object.keys(SKILL_TAXONOMY).forEach(skill => {
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(text)) {
        const formatted = skill.length <= 4 ? skill.toUpperCase() : skill.charAt(0).toUpperCase() + skill.slice(1);
        detectedSkills.add(formatted);

        const category = SKILL_TAXONOMY[skill];
        if (category && skillCategories[category] && !skillCategories[category].includes(formatted)) {
          skillCategories[category].push(formatted);
        }
      }
    });

    return {
      name: nameLine,
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      skills: Array.from(detectedSkills),
      skillCategories
    };
  }

  static calculateATSScore(resumeText, candidateEntities) {
    if (!resumeText) return { totalScore: 0, breakdown: {} };

    let contactScore = 0;
    if (candidateEntities.email) contactScore += 10;
    if (candidateEntities.phone) contactScore += 10;

    let structureScore = 0;
    const upperText = resumeText.toUpperCase();
    if (upperText.includes("SUMMARY") || upperText.includes("PROFILE")) structureScore += 5;
    if (upperText.includes("SKILL")) structureScore += 5;
    if (upperText.includes("EXPERIENCE") || upperText.includes("WORK")) structureScore += 5;
    if (upperText.includes("EDUCATION")) structureScore += 5;

    let impactScore = 0;
    const metricsMatch = resumeText.match(/\d+%/g) || resumeText.match(/\$\d+/g) || resumeText.match(/\b\d{2,}\b/g);
    if (metricsMatch && metricsMatch.length >= 3) impactScore = 20;
    else if (metricsMatch && metricsMatch.length >= 1) impactScore = 10;

    let verbScore = 0;
    const actionVerbs = ["developed", "built", "engineered", "architected", "managed", "created", "spearheaded", "designed", "led", "increased", "optimized", "delivered", "deployed"];
    let verbCount = 0;
    const lowerText = resumeText.toLowerCase();
    actionVerbs.forEach(v => { if (lowerText.includes(v)) verbCount++; });
    if (verbCount >= 4) verbScore = 20;
    else if (verbCount >= 2) verbScore = 10;

    let lengthScore = 0;
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount >= 200 && wordCount <= 900) lengthScore = 20;
    else if (wordCount > 80) lengthScore = 10;

    const totalScore = Math.min(100, contactScore + structureScore + impactScore + verbScore + lengthScore);

    return {
      totalScore,
      breakdown: { contactScore, structureScore, impactScore, verbScore, lengthScore }
    };
  }

  static analyzeGap(resumeText, jobDesc) {
    const candidateEntities = this.extractEntities(resumeText);
    const jdEntities = this.extractEntities(jobDesc);

    const requiredSkills = jdEntities.skills;
    const candidateSkillsSet = new Set(candidateEntities.skills);

    const matchedSkills = requiredSkills.filter(s => candidateSkillsSet.has(s));
    const missingSkills = requiredSkills.filter(s => !candidateSkillsSet.has(s));

    const semanticSim = this.calculateCosineSimilarity(resumeText, jobDesc);
    const skillMatchRatio = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) : 0.75;
 /**
 * Instead of relying on a single raw number,
 *  I combine three distinct components:
 *  50% Hard Skill Taxonomy overlap, 
 *  30% TF-IDF Cosine Vector similarity, 
 *  20% ATS Structural formatting. 
 * This calculated composite score powers the entire platform."
 */

/**
Relying on just one metric creates blind spots.

If we only checked Keywords, people could cheat the system by keyword stuffing.

If we only checked Semantic Vectors, we might miss missing technical prerequisites.

If we only checked ATS Formatting, a beautifully formatted resume with zero technical skills could pass.

Our 50/30/20 hybrid formula balances technical qualifications, contextual depth, and ATS readability to give recruiters an honest, holistic score.
 */
/**
 *The 50/50 "Binary vs. Contextual" Balance
Mathematically, a 50/30/20 split creates a clean 50 / 50 balance:

50% Direct Technical Match (Hard Skill Taxonomy)

50% Context & Quality Match (Semantic Vector Similarity + ATS Format Quality)

This ensures that hard technical requirements carry the most single weight 
without completely overpowering contextual experience.
 */
    
    const hardSkillsScore = Math.round(skillMatchRatio * 100);
    const semanticMatchScore = Math.round(semanticSim * 100);
    const atsResult = this.calculateATSScore(resumeText, candidateEntities);

    const matchScore = Math.round(
     (hardSkillsScore * 0.50) +
     (semanticMatchScore * 0.30) + 
     (atsResult.totalScore * 0.20)
    );

    const suggestions = [];
    if (missingSkills.length > 0) {
      const topMissing = missingSkills.slice(0, 4).join(", ");
      suggestions.push({
        title: `High-Priority Missing Keywords: ${topMissing}`,
        text: `Include these required job keywords in your Technical Skills section to pass automated ATS filters: ${topMissing}.`,
        type: "skill"
      });
    }

    if (atsResult.breakdown.impactScore < 20) {
      suggestions.push({
        title: "Low Quantified Achievements Detected",
        text: "Incorporate numerical proof (e.g., 'Improved performance by 30%', 'Managed 4 microservices') into your experience bullet points.",
        type: "metric"
      });
    }

    const interviewQuestions = missingSkills.slice(0, 3).map(skill => {
      return `How would you rate your hands-on experience with ${skill}, and how quickly can you onboard to stack components requiring ${skill}?`;
    });

    return {
      matchScore: Math.min(99, Math.max(15, matchScore)),
      subScores: {
        hardSkills: hardSkillsScore,
        semanticSimilarity: semanticMatchScore,
        atsReadiness: atsResult.totalScore
      },
      atsResult,
      candidateEntities,
      requiredSkills,
      matchedSkills,
      missingSkills,
      suggestions,
      interviewQuestions
    };
  }

  static generateTailoredResume(resumeText, jobDesc, gapAnalysis) {
    const candidate = gapAnalysis.candidateEntities;
    const name = candidate.name !== "Candidate" ? candidate.name : "FIRSTNAME LASTNAME";
    const email = candidate.email || "email@example.com";
    const phone = candidate.phone || "+1 (555) 000-0000";

    const allSkills = Array.from(new Set([...candidate.skills, ...gapAnalysis.missingSkills]));
    const firstLine = jobDesc.split("\n")[0] || "Target Professional Role";
    const targetTitle = firstLine.length < 45 ? firstLine : "Software Engineer";

    return `${name.toUpperCase()}
Email: ${email} | Phone: ${phone} | Location: Open to Relocation / Remote

================================================================================
EXECUTIVE SUMMARY
================================================================================
Results-driven ${targetTitle} with background in ${allSkills.slice(0, 4).join(", ")}. Proven track record of optimizing application workflows and delivering robust software features aligned with business requirements.

================================================================================
TECHNICAL SKILLS & COMPETENCIES
================================================================================
• Core Technologies: ${allSkills.join(", ")}
• Newly Integrated Key Competencies: ${gapAnalysis.missingSkills.join(", ") || "System Design, Microservices"}
• Tools & Methodologies: Git, RESTful APIs, CI/CD, Agile Scrum

================================================================================
PROFESSIONAL EXPERIENCE
================================================================================
${targetTitle} — Technical Specialist
• Architected and executed critical backend services utilizing ${allSkills[0] || 'Modern Stack'} and ${allSkills[1] || 'Cloud Services'}.
• Improved code efficiency and database throughput by 28% across major production components.
• Integrated service endpoints using ${gapAnalysis.missingSkills[0] || 'REST APIs'} to enable cross-system communication.

================================================================================
EDUCATION & CERTIFICATIONS
================================================================================
• Bachelor of Science in Computer Science or Related Technical Field
• Technical Certifications: ${allSkills.slice(0, 2).join(" & ")} Domain Mastery`;
  }
}

if (typeof window !== "undefined") {
  window.NLPEngine = NLPEngine;
}