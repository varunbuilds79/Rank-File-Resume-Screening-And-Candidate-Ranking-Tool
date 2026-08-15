/**
 * Smart Resume Screening and Candidate Ranking Tool - Expanded Initial Mock Datasets
 */

const SAMPLE_JOBS = [
  {
    id: "job_01",
    title: "AI & Data Scientist",
    department: "Data Science",
    experienceRequired: "4+ Years",
    requiredSkills: ["Python", "Pandas", "NumPy", "Scikit-Learn", "PyTorch", "TensorFlow", "NLP", "SQL"],
    description: `We are looking for an AI & Data Scientist to design, train, and deploy predictive machine learning and NLP models.

Requirements:
- Master's or Ph.D. in Computer Science, Data Science, or related field.
- 4+ years of professional machine learning experience using Python, Pandas, NumPy, and Scikit-Learn.
- Deep Learning framework proficiency in PyTorch or TensorFlow.
- Strong background in Natural Language Processing (NLP) and LLM fine-tuning.
- Advanced SQL skills for data extraction and feature engineering.`
  },
  {
    id: "job_02",
    title: "Lead Product Manager",
    department: "Product",
    experienceRequired: "5+ Years",
    requiredSkills: ["Product Management", "Product Strategy", "User Stories", "Jira", "A/B Testing", "KPIs", "Agile"],
    description: `We are seeking a Lead Product Manager to drive product vision, roadmaps, and execution across cross-functional engineering teams.

Requirements:
- 5+ years of software Product Management experience in SaaS or B2B platforms.
- Track record of defining product strategy, user stories, and managing product roadmaps.
- Expertise using Jira, Confluence, and Agile Scrum methodologies.
- Strong analytical skills with A/B testing, KPIs, and user analytics tools.`
  },
  {
    id: "job_03",
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    experienceRequired: "4+ Years",
    requiredSkills: ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS", "REST APIs"],
    description: `Seeking a Senior Full Stack Engineer to architect web applications and cloud backend microservices.

Requirements:
- 4+ years building applications with React, TypeScript, and Node.js.
- Strong proficiency in relational databases (PostgreSQL) and RESTful APIs.
- Experience containerizing services with Docker and deploying on AWS.`
  },
  {
    id: "job_04",
    title: "Cybersecurity Analyst",
    department: "Security",
    experienceRequired: "3+ Years",
    requiredSkills: ["Cybersecurity", "SIEM", "Penetration Testing", "Firewall", "Wireshark", "IAM", "Linux"],
    description: `Looking for a Cybersecurity Analyst to monitor systems, conduct vulnerability assessments, and implement zero-trust access controls.

Requirements:
- 3+ years experience in Information Security and SOC operations.
- Proficiency with SIEM tools, Wireshark, penetration testing, and firewall configuration.
- Deep knowledge of Linux environment security and Identity & Access Management (IAM).`
  },
  {
    id: "job_05",
    title: "Mobile Application Developer",
    department: "Mobile Engineering",
    experienceRequired: "3+ Years",
    requiredSkills: ["Flutter", "Dart", "React Native", "iOS", "Android", "REST APIs", "Git"],
    description: `Seeking a Mobile Application Developer to build cross-platform mobile apps for iOS and Android.

Requirements:
- 3+ years experience using Flutter, Dart, or React Native.
- Published apps on Apple App Store or Google Play Store.
- Experience integrating REST APIs and state management.`
  },
  {
    id: "job_06",
    title: "DevOps & Cloud Engineer",
    department: "Infrastructure",
    experienceRequired: "4+ Years",
    requiredSkills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "Linux", "Bash"],
    description: `Hiring a Cloud Infrastructure Specialist to maintain Kubernetes clusters and CI/CD automation pipelines.

Requirements:
- 4+ years in DevOps managing AWS infrastructure with Terraform.
- Hands-on experience with Docker, Kubernetes (K8s), and Jenkins CI/CD.`
  }
];

const SAMPLE_CANDIDATES = [
  {
    id: "cand_01",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 234-5678",
    resumeText: `ALEX RIVERA
Email: alex.rivera@example.com | Phone: +1 (555) 234-5678

EXECUTIVE SUMMARY
Full Stack Engineer with 5 years of experience building modern web applications using JavaScript, TypeScript, React, Node.js, and PostgreSQL.

TECHNICAL SKILLS
• Languages: JavaScript, TypeScript, Python, SQL
• Web Technologies: React, Node.js, Express, HTML, CSS, REST APIs
• Database & Cloud: PostgreSQL, MongoDB, AWS, Git`
  }
];