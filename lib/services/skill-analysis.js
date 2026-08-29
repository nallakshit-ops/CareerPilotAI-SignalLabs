// ============================================================================
// SKILLS_MASTER — Canonical skill registry (key → display name)
// Only skills in this map will be returned from extraction.
// ============================================================================
const SKILLS_MASTER = {
    // Programming Languages
    "javascript": "JavaScript",
    "python": "Python",
    "java": "Java",
    "c++": "C++",
    "c#": "C#",
    "ruby": "Ruby",
    "php": "PHP",
    "typescript": "TypeScript",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "go": "Go",
    "rust": "Rust",
    "scala": "Scala",
    "r": "R",
    "perl": "Perl",
    "dart": "Dart",
    "lua": "Lua",
    "haskell": "Haskell",
    "elixir": "Elixir",

    // Frontend
    "html": "HTML",
    "css": "CSS",
    "react": "React",
    "angular": "Angular",
    "vue": "Vue",
    "svelte": "Svelte",
    "next.js": "Next.js",
    "nuxt.js": "Nuxt.js",
    "tailwind css": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "sass": "Sass",
    "webpack": "Webpack",
    "vite": "Vite",
    "jquery": "jQuery",

    // Backend
    "node.js": "Node.js",
    "express": "Express",
    "django": "Django",
    "flask": "Flask",
    "spring boot": "Spring Boot",
    "ruby on rails": "Ruby on Rails",
    "asp.net": "ASP.NET",
    "fastapi": "FastAPI",
    "nestjs": "NestJS",
    "graphql": "GraphQL",
    "rest api": "REST API",

    // Databases
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "cassandra": "Cassandra",
    "elasticsearch": "Elasticsearch",
    "oracle": "Oracle",
    "sqlite": "SQLite",
    "dynamodb": "DynamoDB",
    "firebase": "Firebase",
    "supabase": "Supabase",
    "prisma": "Prisma",

    // Cloud & DevOps
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "jenkins": "Jenkins",
    "gitlab ci": "GitLab CI",
    "github actions": "GitHub Actions",
    "ci/cd": "CI/CD",
    "nginx": "Nginx",
    "apache": "Apache",
    "heroku": "Heroku",
    "vercel": "Vercel",
    "netlify": "Netlify",

    // Version Control & OS
    "git": "Git",
    "linux": "Linux",
    "unix": "Unix",
    "bash": "Bash",
    "powershell": "PowerShell",

    // AI / ML / Data
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "computer vision": "Computer Vision",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "data analysis": "Data Analysis",
    "data science": "Data Science",
    "data engineering": "Data Engineering",
    "apache spark": "Apache Spark",
    "hadoop": "Hadoop",
    "tableau": "Tableau",
    "power bi": "Power BI",
    "jupyter": "Jupyter",

    // Methodologies & Tools
    "agile": "Agile",
    "scrum": "Scrum",
    "kanban": "Kanban",
    "jira": "Jira",
    "confluence": "Confluence",
    "trello": "Trello",
    "slack": "Slack",

    // Soft Skills
    "communication": "Communication",
    "teamwork": "Teamwork",
    "problem solving": "Problem Solving",
    "leadership": "Leadership",
    "time management": "Time Management",
    "critical thinking": "Critical Thinking",
    "adaptability": "Adaptability",
    "collaboration": "Collaboration",
    "creativity": "Creativity",
    "attention to detail": "Attention to Detail",

    // Management
    "project management": "Project Management",
    "product management": "Product Management",
    "stakeholder management": "Stakeholder Management",

    // Design
    "ui/ux": "UI/UX",
    "figma": "Figma",
    "sketch": "Sketch",
    "adobe xd": "Adobe XD",
    "adobe photoshop": "Adobe Photoshop",
    "adobe illustrator": "Adobe Illustrator",

    // Security
    "cybersecurity": "Cybersecurity",
    "information security": "Information Security",
    "penetration testing": "Penetration Testing",
    "cryptography": "Cryptography",
    "owasp": "OWASP",

    // Blockchain / Web3
    "blockchain": "Blockchain",
    "smart contracts": "Smart Contracts",
    "solidity": "Solidity",
    "web3": "Web3",
    "ethereum": "Ethereum",

    // Marketing
    "seo": "SEO",
    "sem": "SEM",
    "digital marketing": "Digital Marketing",
    "content creation": "Content Creation",
    "copywriting": "Copywriting",
    "google analytics": "Google Analytics",

    // Business
    "sales": "Sales",
    "business development": "Business Development",
    "customer service": "Customer Service",
    "business analysis": "Business Analysis",

    // Testing
    "unit testing": "Unit Testing",
    "integration testing": "Integration Testing",
    "selenium": "Selenium",
    "cypress": "Cypress",
    "jest": "Jest",
    "mocha": "Mocha",

    // Mobile
    "react native": "React Native",
    "flutter": "Flutter",
    "ios development": "iOS Development",
    "android development": "Android Development",
    "swiftui": "SwiftUI",
};

// ============================================================================
// SYNONYM_MAP — Maps common aliases/variations → canonical SKILLS_MASTER key
// ============================================================================
const SYNONYM_MAP = {
    // JavaScript variants
    "js": "javascript",
    "es6": "javascript",
    "ecmascript": "javascript",
    "vanilla js": "javascript",
    "vanilla javascript": "javascript",

    // TypeScript
    "ts": "typescript",

    // Python
    "py": "python",
    "python3": "python",
    "python 3": "python",

    // Node.js variants
    "nodejs": "node.js",
    "node": "node.js",
    "node js": "node.js",
    "node.js": "node.js",

    // React variants
    "reactjs": "react",
    "react.js": "react",
    "react js": "react",

    // Angular variants
    "angularjs": "angular",
    "angular.js": "angular",
    "angular js": "angular",

    // Vue variants
    "vuejs": "vue",
    "vue.js": "vue",
    "vue js": "vue",

    // Next.js variants
    "nextjs": "next.js",
    "next js": "next.js",
    "next": "next.js",

    // NestJS variants
    "nest.js": "nestjs",
    "nest js": "nestjs",
    "nest": "nestjs",

    // Nuxt.js
    "nuxtjs": "nuxt.js",
    "nuxt": "nuxt.js",

    // Express
    "expressjs": "express",
    "express.js": "express",
    "express js": "express",

    // Svelte
    "sveltejs": "svelte",
    "svelte.js": "svelte",

    // Databases
    "mongo": "mongodb",
    "mongo db": "mongodb",
    "postgres": "postgresql",
    "pg": "postgresql",
    "dynamo db": "dynamodb",
    "dynamo": "dynamodb",

    // Cloud
    "amazon web services": "aws",
    "amazon aws": "aws",
    "microsoft azure": "azure",
    "google cloud": "gcp",
    "google cloud platform": "gcp",

    // DevOps
    "k8s": "kubernetes",
    "kube": "kubernetes",
    "k8": "kubernetes",
    "ci cd": "ci/cd",
    "cicd": "ci/cd",
    "continuous integration": "ci/cd",
    "continuous deployment": "ci/cd",

    // AI/ML
    "ml": "machine learning",
    "ai": "machine learning",
    "artificial intelligence": "machine learning",
    "dl": "deep learning",
    "tf": "tensorflow",
    "sklearn": "scikit-learn",
    "sk-learn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "cv": "computer vision",
    "nlp": "nlp",

    // Data
    "data analytics": "data analysis",
    "bi": "power bi",
    "powerbi": "power bi",

    // Design
    "ux": "ui/ux",
    "ui": "ui/ux",
    "user experience": "ui/ux",
    "user interface": "ui/ux",
    "ux design": "ui/ux",
    "ui design": "ui/ux",

    // Mobile
    "rn": "react native",
    "ios": "ios development",
    "android": "android development",

    // Testing
    "e2e testing": "integration testing",
    "end to end testing": "integration testing",
    "tdd": "unit testing",
    "test driven development": "unit testing",

    // Tailwind
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",

    // Rails
    "rails": "ruby on rails",
    "ror": "ruby on rails",

    // Spring
    "spring": "spring boot",

    // GraphQL
    "gql": "graphql",

    // REST
    "restful": "rest api",
    "restful api": "rest api",
    "rest": "rest api",

    // Other
    "github action": "github actions",
    "gitlab": "gitlab ci",
    "photoshop": "adobe photoshop",
    "illustrator": "adobe illustrator",
    "xd": "adobe xd",
    "google analytic": "google analytics",
    "ga": "google analytics",
};

// ============================================================================
// Utility: Normalize text for matching
// ============================================================================
function normalizeText(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        // Replace common separators with spaces
        .replace(/[/\\|,;:()[\]{}<>]/g, " ")
        // Remove remaining special chars EXCEPT hyphens, dots, plus, hash (for C++, C#, Node.js, etc.)
        .replace(/[^a-z0-9\s\-+#.]/g, " ")
        // Collapse multiple spaces
        .replace(/\s+/g, " ")
        .trim();
}

// ============================================================================
// Utility: Sørensen–Dice similarity coefficient (bigram-based)
// Returns a value between 0 and 1. ≥ 0.80 is considered a strong match.
// ============================================================================
function diceSimilarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;

    const aNorm = a.toLowerCase();
    const bNorm = b.toLowerCase();

    if (aNorm.length < 2 || bNorm.length < 2) return aNorm === bNorm ? 1 : 0;

    const bigramsA = new Map();
    for (let i = 0; i < aNorm.length - 1; i++) {
        const bigram = aNorm.substring(i, i + 2);
        bigramsA.set(bigram, (bigramsA.get(bigram) || 0) + 1);
    }

    let intersectionSize = 0;
    for (let i = 0; i < bNorm.length - 1; i++) {
        const bigram = bNorm.substring(i, i + 2);
        const count = bigramsA.get(bigram) || 0;
        if (count > 0) {
            bigramsA.set(bigram, count - 1);
            intersectionSize++;
        }
    }

    return (2.0 * intersectionSize) / (aNorm.length - 1 + (bNorm.length - 1));
}

// ============================================================================
// Resolve a token to a canonical SKILLS_MASTER key (or null)
// ============================================================================
function resolveToCanonical(token) {
    // Direct match in SKILLS_MASTER
    if (SKILLS_MASTER[token] !== undefined) {
        return token;
    }
    // Check SYNONYM_MAP
    if (SYNONYM_MAP[token] !== undefined) {
        const canonical = SYNONYM_MAP[token];
        if (SKILLS_MASTER[canonical] !== undefined) {
            return canonical;
        }
    }
    return null;
}

// ============================================================================
// Generate n-grams from a list of words
// ============================================================================
function generateNGrams(words, n) {
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
        ngrams.push(words.slice(i, i + n).join(" "));
    }
    return ngrams;
}

// ============================================================================
// MAIN: Extract skills from text
// Returns clean array of canonical display names from SKILLS_MASTER only.
// ============================================================================
export function extractSkills(text) {
    if (!text) return [];

    const normalized = normalizeText(text);
    const words = normalized.split(" ").filter(Boolean);
    const foundKeys = new Set();

    // Pass 1: Check trigrams, bigrams, unigrams for exact / synonym match
    // Start from longest n-grams to prefer multi-word skills
    const trigrams = generateNGrams(words, 3);
    const bigrams = generateNGrams(words, 2);
    const unigrams = words;

    const allCandidates = [
        ...trigrams,
        ...bigrams,
        ...unigrams,
    ];

    for (const candidate of allCandidates) {
        const key = resolveToCanonical(candidate);
        if (key) {
            foundKeys.add(key);
        }
    }

    // Pass 2: Fuzzy match remaining unigrams against SKILLS_MASTER keys
    // Only for tokens with length >= 3 to avoid false positives on short words
    const FUZZY_THRESHOLD = 0.80;
    const masterKeys = Object.keys(SKILLS_MASTER);

    for (const token of unigrams) {
        if (token.length < 3) continue;

        // Skip if any canonical key was already found for this token
        if (resolveToCanonical(token)) continue;

        let bestMatch = null;
        let bestScore = 0;

        for (const masterKey of masterKeys) {
            // Only fuzzy-match single-word master keys against single-word tokens
            // Multi-word master keys are handled by ngrams above
            if (masterKey.includes(" ")) continue;

            const score = diceSimilarity(token, masterKey);
            if (score >= FUZZY_THRESHOLD && score > bestScore) {
                bestScore = score;
                bestMatch = masterKey;
            }
        }

        if (bestMatch) {
            foundKeys.add(bestMatch);
        }
    }

    // Convert canonical keys to display names
    const result = Array.from(foundKeys).map((key) => SKILLS_MASTER[key]);

    console.log("[SkillExtraction] Extracted skills:", result);
    return result;
}

// ============================================================================
// Normalize an array of skills to their canonical SKILLS_MASTER keys
// Handles synonyms and deduplication
// ============================================================================
function normalizeSkillsList(skills) {
    const canonicalSet = new Set();

    for (const skill of skills) {
        const normalized = skill.toLowerCase().trim();

        // Direct match
        if (SKILLS_MASTER[normalized] !== undefined) {
            canonicalSet.add(normalized);
            continue;
        }

        // Check synonym
        if (SYNONYM_MAP[normalized] !== undefined) {
            const canonical = SYNONYM_MAP[normalized];
            if (SKILLS_MASTER[canonical] !== undefined) {
                canonicalSet.add(canonical);
                continue;
            }
        }

        // Reverse lookup: check if the skill matches a display name
        for (const [key, displayName] of Object.entries(SKILLS_MASTER)) {
            if (displayName.toLowerCase() === normalized) {
                canonicalSet.add(key);
                break;
            }
        }
    }

    return canonicalSet;
}

// ============================================================================
// Calculate skill gap with canonical mapping, deduplication, confidence score
// ============================================================================
export function calculateSkillGap(candidateSkills, requiredSkills) {
    // Normalize both lists to canonical keys
    const candidateSet = normalizeSkillsList(candidateSkills);
    const requiredSet = normalizeSkillsList(requiredSkills);

    console.log("[SkillGap] Normalized candidate skills:", Array.from(candidateSet));
    console.log("[SkillGap] Normalized required skills:", Array.from(requiredSet));

    if (requiredSet.size === 0) {
        return {
            matchedSkills: [],
            missingSkills: [],
            matchPercentage: 0,
            confidenceScore: 0,
        };
    }

    const matchedKeys = [];
    const missingKeys = [];

    for (const skill of requiredSet) {
        if (candidateSet.has(skill)) {
            matchedKeys.push(skill);
        } else {
            missingKeys.push(skill);
        }
    }

    // Convert keys to display names
    const matchedSkills = matchedKeys.map((k) => SKILLS_MASTER[k]);
    const missingSkills = missingKeys.map((k) => SKILLS_MASTER[k]);

    const matchPercentage = Math.round(
        (matchedKeys.length / requiredSet.size) * 100 * 100
    ) / 100;

    // Confidence score: matched / total detected (candidate + required unique)
    const totalDetected = new Set([...candidateSet, ...requiredSet]).size;
    const confidenceScore = totalDetected > 0
        ? Math.round((matchedKeys.length / totalDetected) * 100 * 100) / 100
        : 0;

    console.log("[SkillGap] Matched skills:", matchedSkills);
    console.log("[SkillGap] Missing skills:", missingSkills);
    console.log("[SkillGap] Match %:", matchPercentage, "| Confidence:", confidenceScore);

    return {
        matchedSkills,
        missingSkills,
        matchPercentage,
        confidenceScore,
    };
}

// ============================================================================
// Generate AI summary (rule-based, includes confidence)
// ============================================================================
export function generateAISummary(gapAnalysis) {
    const { matchedSkills, missingSkills, matchPercentage, confidenceScore } = gapAnalysis;

    let summary = `You match ${Math.round(matchPercentage)}% of the required skills for this position. `;

    if (matchPercentage >= 80) {
        summary += "You are a strong fit! ";
    } else if (matchPercentage >= 50) {
        summary += "You have a solid foundation, but there is room for improvement. ";
    } else {
        summary += "You may need to acquire more skills to be competitive for this role. ";
    }

    if (missingSkills.length > 0) {
        const topMissing = missingSkills.slice(0, 5);
        summary += `Focus on learning ${topMissing.join(", ")} to boost your chances. `;
    } else {
        summary += "You have all the required skills mentioned in the job description! ";
    }

    if (confidenceScore !== undefined) {
        summary += `Analysis confidence: ${Math.round(confidenceScore)}%.`;
    }

    return summary;
}
