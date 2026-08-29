// ============================================================================
// Recommendation Engine — Verified course database with real URLs
// ============================================================================

const VALID_PLATFORMS = ["Udemy", "Coursera"];

/**
 * Validates a URL string.
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
        return false;
    }
}

// ============================================================================
// COURSE_DATABASE — Verified courses with real URLs
// Keys MUST match canonical SKILLS_MASTER keys (lowercase)
// ============================================================================
const COURSE_DATABASE = {
    // Programming Languages
    javascript: [
        { courseName: "The Complete JavaScript Course 2025: From Zero to Expert!", platform: "Udemy", url: "https://www.udemy.com/course/the-complete-javascript-course/", duration: "69 hours", certification: true },
        { courseName: "JavaScript for Beginners Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/javascript-beginner", duration: "12 hours", certification: true },
    ],
    python: [
        { courseName: "100 Days of Code: The Complete Python Pro Bootcamp", platform: "Udemy", url: "https://www.udemy.com/course/100-days-of-code/", duration: "60 hours", certification: true },
        { courseName: "Python for Everybody Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/python", duration: "25 hours", certification: true },
    ],
    java: [
        { courseName: "Java Programming and Software Engineering Fundamentals", platform: "Coursera", url: "https://www.coursera.org/specializations/java-programming", duration: "24 hours", certification: true },
        { courseName: "Java Programming Masterclass", platform: "Udemy", url: "https://www.udemy.com/course/java-the-complete-java-developer-course/", duration: "80 hours", certification: true },
    ],
    typescript: [
        { courseName: "Understanding TypeScript", platform: "Udemy", url: "https://www.udemy.com/course/understanding-typescript/", duration: "15 hours", certification: true },
    ],
    "c++": [
        { courseName: "Beginning C++ Programming - From Beginner to Beyond", platform: "Udemy", url: "https://www.udemy.com/course/beginning-c-plus-plus-programming/", duration: "46 hours", certification: true },
    ],
    "c#": [
        { courseName: "Complete C# Masterclass", platform: "Udemy", url: "https://www.udemy.com/course/complete-csharp-masterclass/", duration: "35 hours", certification: true },
    ],
    go: [
        { courseName: "Go: The Complete Developer's Guide (Golang)", platform: "Udemy", url: "https://www.udemy.com/course/go-the-complete-developers-guide/", duration: "9 hours", certification: true },
    ],
    rust: [
        { courseName: "The Rust Programming Language", platform: "Udemy", url: "https://www.udemy.com/course/rust-lang/", duration: "15 hours", certification: true },
    ],
    swift: [
        { courseName: "iOS & Swift - The Complete iOS App Development Bootcamp", platform: "Udemy", url: "https://www.udemy.com/course/ios-13-app-development-bootcamp/", duration: "60 hours", certification: true },
    ],
    kotlin: [
        { courseName: "The Complete Android 14 & Kotlin Development Masterclass", platform: "Udemy", url: "https://www.udemy.com/course/android-kotlin-developer/", duration: "40 hours", certification: true },
    ],
    ruby: [
        { courseName: "The Complete Ruby on Rails Developer Course", platform: "Udemy", url: "https://www.udemy.com/course/the-complete-ruby-on-rails-developer-course/", duration: "46 hours", certification: true },
    ],
    php: [
        { courseName: "PHP for Beginners - Become a PHP Master", platform: "Udemy", url: "https://www.udemy.com/course/php-for-complete-beginners-includes-msql-object-oriented/", duration: "37 hours", certification: true },
    ],
    dart: [
        { courseName: "Dart and Flutter: The Complete Developer's Guide", platform: "Udemy", url: "https://www.udemy.com/course/dart-and-flutter-the-complete-developers-guide/", duration: "32 hours", certification: true },
    ],

    // Frontend
    react: [
        { courseName: "React - The Complete Guide 2025 (incl. Next.js, Redux)", platform: "Udemy", url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", duration: "68 hours", certification: true },
        { courseName: "Full-Stack Web Development with React Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/full-stack-react", duration: "40 hours", certification: true },
    ],
    angular: [
        { courseName: "Angular - The Complete Guide (2025 Edition)", platform: "Udemy", url: "https://www.udemy.com/course/the-complete-guide-to-angular-2/", duration: "37 hours", certification: true },
    ],
    vue: [
        { courseName: "Vue - The Complete Guide (incl. Router & Composition API)", platform: "Udemy", url: "https://www.udemy.com/course/vuejs-2-the-complete-guide/", duration: "32 hours", certification: true },
    ],
    html: [
        { courseName: "Build Responsive Real-World Websites with HTML and CSS", platform: "Udemy", url: "https://www.udemy.com/course/design-and-develop-a-killer-website-with-html5-and-css3/", duration: "38 hours", certification: true },
    ],
    css: [
        { courseName: "Advanced CSS and Sass: Flexbox, Grid, Animations and More!", platform: "Udemy", url: "https://www.udemy.com/course/advanced-css-and-sass/", duration: "28 hours", certification: true },
    ],
    "next.js": [
        { courseName: "Next.js 14 & React - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/nextjs-react-the-complete-guide/", duration: "40 hours", certification: true },
    ],
    svelte: [
        { courseName: "Svelte.js - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/sveltejs-the-complete-guide/", duration: "13 hours", certification: true },
    ],
    "tailwind css": [
        { courseName: "Tailwind CSS From Scratch", platform: "Udemy", url: "https://www.udemy.com/course/tailwind-css-from-scratch/", duration: "12 hours", certification: true },
    ],

    // Backend
    "node.js": [
        { courseName: "The Complete Node.js Developer Course (3rd Edition)", platform: "Udemy", url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/", duration: "35 hours", certification: true },
        { courseName: "Server-side Development with NodeJS, Express and MongoDB", platform: "Coursera", url: "https://www.coursera.org/learn/server-side-nodejs", duration: "20 hours", certification: true },
    ],
    express: [
        { courseName: "Just Express (with a bunch of Node and HTTP)", platform: "Udemy", url: "https://www.udemy.com/course/just-express-with-a-bunch-of-node-and-http-in-detail/", duration: "12 hours", certification: true },
    ],
    django: [
        { courseName: "Python Django - The Practical Guide", platform: "Udemy", url: "https://www.udemy.com/course/python-django-the-practical-guide/", duration: "23 hours", certification: true },
    ],
    flask: [
        { courseName: "REST APIs with Flask and Python in 2025", platform: "Udemy", url: "https://www.udemy.com/course/rest-api-flask-and-python/", duration: "17 hours", certification: true },
    ],
    "spring boot": [
        { courseName: "Spring & Spring Boot Tutorial for Beginners", platform: "Udemy", url: "https://www.udemy.com/course/spring-tutorial-for-beginners/", duration: "45 hours", certification: true },
    ],
    "asp.net": [
        { courseName: "Complete ASP.NET Core and Entity Framework Development", platform: "Udemy", url: "https://www.udemy.com/course/complete-aspnet-core-21-course/", duration: "29 hours", certification: true },
    ],
    "ruby on rails": [
        { courseName: "The Complete Ruby on Rails Developer Course", platform: "Udemy", url: "https://www.udemy.com/course/the-complete-ruby-on-rails-developer-course/", duration: "46 hours", certification: true },
    ],
    graphql: [
        { courseName: "GraphQL by Example", platform: "Udemy", url: "https://www.udemy.com/course/graphql-by-example/", duration: "6 hours", certification: true },
    ],
    nestjs: [
        { courseName: "NestJS Zero to Hero", platform: "Udemy", url: "https://www.udemy.com/course/nestjs-zero-to-hero/", duration: "17 hours", certification: true },
    ],
    fastapi: [
        { courseName: "FastAPI - The Complete Course", platform: "Udemy", url: "https://www.udemy.com/course/fastapi-the-complete-course/", duration: "13 hours", certification: true },
    ],

    // Databases
    sql: [
        { courseName: "The Complete SQL Bootcamp: Go from Zero to Hero", platform: "Udemy", url: "https://www.udemy.com/course/the-complete-sql-bootcamp/", duration: "9 hours", certification: true },
        { courseName: "SQL for Data Science", platform: "Coursera", url: "https://www.coursera.org/learn/sql-for-data-science", duration: "15 hours", certification: true },
    ],
    mongodb: [
        { courseName: "MongoDB - The Complete Developer's Guide", platform: "Udemy", url: "https://www.udemy.com/course/mongodb-the-complete-developers-guide/", duration: "17 hours", certification: true },
    ],
    postgresql: [
        { courseName: "SQL and PostgreSQL: The Complete Developer's Guide", platform: "Udemy", url: "https://www.udemy.com/course/sql-and-postgresql/", duration: "22 hours", certification: true },
    ],
    mysql: [
        { courseName: "The Ultimate MySQL Bootcamp: Go from SQL Beginner to Expert", platform: "Udemy", url: "https://www.udemy.com/course/the-ultimate-mysql-bootcamp-go-from-sql-beginner-to-expert/", duration: "20 hours", certification: true },
    ],
    redis: [
        { courseName: "Redis: The Complete Developer's Guide", platform: "Udemy", url: "https://www.udemy.com/course/redis-the-complete-developers-guide-p/", duration: "14 hours", certification: true },
    ],
    firebase: [
        { courseName: "Firebase & Firestore Masterclass", platform: "Udemy", url: "https://www.udemy.com/course/firebase-course/", duration: "12 hours", certification: true },
    ],
    prisma: [
        { courseName: "Prisma ORM Course", platform: "Udemy", url: "https://www.udemy.com/course/prisma-orm-course/", duration: "8 hours", certification: true },
    ],

    // Cloud & DevOps
    aws: [
        { courseName: "Ultimate AWS Certified Solutions Architect Associate", platform: "Udemy", url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/", duration: "27 hours", certification: true },
        { courseName: "AWS Cloud Technical Essentials", platform: "Coursera", url: "https://www.coursera.org/learn/aws-cloud-technical-essentials", duration: "6 hours", certification: true },
    ],
    azure: [
        { courseName: "AZ-900: Microsoft Azure Fundamentals", platform: "Udemy", url: "https://www.udemy.com/course/az900-azure/", duration: "11 hours", certification: true },
    ],
    gcp: [
        { courseName: "Google Cloud Digital Leader Training Course", platform: "Udemy", url: "https://www.udemy.com/course/google-cloud-digital-leader-certification/", duration: "8 hours", certification: true },
    ],
    docker: [
        { courseName: "Docker & Kubernetes: The Practical Guide [2025 Edition]", platform: "Udemy", url: "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/", duration: "24 hours", certification: true },
    ],
    kubernetes: [
        { courseName: "Kubernetes for the Absolute Beginners - Hands-on", platform: "Udemy", url: "https://www.udemy.com/course/learn-kubernetes/", duration: "17 hours", certification: true },
    ],
    terraform: [
        { courseName: "HashiCorp Certified: Terraform Associate", platform: "Udemy", url: "https://www.udemy.com/course/terraform-beginner-to-advanced/", duration: "12 hours", certification: true },
    ],
    jenkins: [
        { courseName: "Jenkins, From Zero To Hero", platform: "Udemy", url: "https://www.udemy.com/course/jenkins-from-zero-to-hero/", duration: "10 hours", certification: true },
    ],
    "ci/cd": [
        { courseName: "DevOps Project: CI/CD with Jenkins, Ansible, Docker, Kubernetes", platform: "Udemy", url: "https://www.udemy.com/course/valaxy-devops/", duration: "12 hours", certification: true },
    ],
    "github actions": [
        { courseName: "The Complete GitHub Actions & Workflows Guide", platform: "Udemy", url: "https://www.udemy.com/course/github-actions/", duration: "8 hours", certification: true },
    ],

    // AI/ML
    "machine learning": [
        { courseName: "Machine Learning Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/machine-learning-introduction", duration: "90 hours", certification: true },
        { courseName: "Machine Learning A-Z: AI, Python & R", platform: "Udemy", url: "https://www.udemy.com/course/machinelearning/", duration: "44 hours", certification: true },
    ],
    "deep learning": [
        { courseName: "Deep Learning Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/deep-learning", duration: "60 hours", certification: true },
    ],
    nlp: [
        { courseName: "Natural Language Processing Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/natural-language-processing", duration: "40 hours", certification: true },
    ],
    "computer vision": [
        { courseName: "Deep Learning and Computer Vision A-Z", platform: "Udemy", url: "https://www.udemy.com/course/computer-vision-a-z/", duration: "18 hours", certification: true },
    ],
    tensorflow: [
        { courseName: "DeepLearning.AI TensorFlow Developer Professional Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/tensorflow-in-practice", duration: "30 hours", certification: true },
    ],
    pytorch: [
        { courseName: "PyTorch for Deep Learning with Python Bootcamp", platform: "Udemy", url: "https://www.udemy.com/course/pytorch-for-deep-learning-with-python-bootcamp/", duration: "17 hours", certification: true },
    ],
    "data analysis": [
        { courseName: "Google Data Analytics Professional Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-data-analytics", duration: "40 hours", certification: true },
    ],
    "data science": [
        { courseName: "IBM Data Science Professional Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/ibm-data-science", duration: "50 hours", certification: true },
    ],
    pandas: [
        { courseName: "Data Analysis with Pandas and Python", platform: "Udemy", url: "https://www.udemy.com/course/data-analysis-with-pandas/", duration: "19 hours", certification: true },
    ],
    numpy: [
        { courseName: "Deep Learning Prerequisites: The Numpy Stack in Python V2", platform: "Udemy", url: "https://www.udemy.com/course/deep-learning-prerequisites-the-numpy-stack-in-python/", duration: "6 hours", certification: true },
    ],
    "scikit-learn": [
        { courseName: "Machine Learning with Scikit-Learn", platform: "Coursera", url: "https://www.coursera.org/learn/machine-learning-with-scikit-learn", duration: "10 hours", certification: true },
    ],
    tableau: [
        { courseName: "Tableau 2024 A-Z: Hands-On Tableau Training for Data Science", platform: "Udemy", url: "https://www.udemy.com/course/tableau10/", duration: "9 hours", certification: true },
    ],
    "power bi": [
        { courseName: "Microsoft Power BI Desktop for Business Intelligence", platform: "Udemy", url: "https://www.udemy.com/course/microsoft-power-bi-up-running-with-power-bi-desktop/", duration: "14 hours", certification: true },
    ],

    // Tools & Methodology
    git: [
        { courseName: "Git & GitHub - The Practical Guide", platform: "Udemy", url: "https://www.udemy.com/course/git-github-practical-guide/", duration: "11 hours", certification: true },
    ],
    linux: [
        { courseName: "Linux Mastery: Master the Linux Command Line", platform: "Udemy", url: "https://www.udemy.com/course/linux-mastery/", duration: "11 hours", certification: true },
    ],
    agile: [
        { courseName: "Agile with Atlassian Jira", platform: "Coursera", url: "https://www.coursera.org/learn/agile-atlassian-jira", duration: "8 hours", certification: true },
    ],
    scrum: [
        { courseName: "Scrum Certification Prep + Scrum Master + Agile Scrum", platform: "Udemy", url: "https://www.udemy.com/course/scrum-certification/", duration: "8 hours", certification: true },
    ],
    jira: [
        { courseName: "Learn JIRA with real-world examples", platform: "Udemy", url: "https://www.udemy.com/course/the-complete-guide-to-jira-with-real-world-examples/", duration: "5 hours", certification: true },
    ],

    // Soft Skills
    communication: [
        { courseName: "Improving Communication Skills", platform: "Coursera", url: "https://www.coursera.org/learn/wharton-communication-skills", duration: "12 hours", certification: true },
    ],
    leadership: [
        { courseName: "Inspiring and Motivating Individuals", platform: "Coursera", url: "https://www.coursera.org/learn/motivate-people-teams", duration: "10 hours", certification: true },
    ],
    "problem solving": [
        { courseName: "Creative Thinking: Techniques and Tools for Success", platform: "Coursera", url: "https://www.coursera.org/learn/creative-thinking-techniques-and-tools-for-success", duration: "8 hours", certification: true },
    ],
    "project management": [
        { courseName: "Google Project Management Professional Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-project-management", duration: "30 hours", certification: true },
    ],
    "product management": [
        { courseName: "Digital Product Management Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/uva-darden-digital-product-management", duration: "16 hours", certification: true },
    ],

    // Design
    "ui/ux": [
        { courseName: "Google UX Design Professional Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design", duration: "35 hours", certification: true },
    ],
    figma: [
        { courseName: "Complete Web & Mobile Designer: UI/UX, Figma", platform: "Udemy", url: "https://www.udemy.com/course/complete-web-designer-mobile-designer-zero-to-mastery/", duration: "30 hours", certification: true },
    ],

    // Security
    cybersecurity: [
        { courseName: "Google Cybersecurity Professional Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-cybersecurity", duration: "30 hours", certification: true },
    ],
    "penetration testing": [
        { courseName: "Learn Ethical Hacking From Scratch", platform: "Udemy", url: "https://www.udemy.com/course/learn-ethical-hacking-from-scratch/", duration: "16 hours", certification: true },
    ],

    // Web3
    blockchain: [
        { courseName: "Blockchain Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/blockchain", duration: "20 hours", certification: true },
    ],
    solidity: [
        { courseName: "Ethereum and Solidity: The Complete Developer's Guide", platform: "Udemy", url: "https://www.udemy.com/course/ethereum-and-solidity-the-complete-developers-guide/", duration: "24 hours", certification: true },
    ],

    // Marketing
    seo: [
        { courseName: "SEO 2025: Complete SEO Training + SEO for WordPress Websites", platform: "Udemy", url: "https://www.udemy.com/course/seo-training/", duration: "13 hours", certification: true },
    ],
    "digital marketing": [
        { courseName: "Google Digital Marketing & E-commerce Professional Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce", duration: "25 hours", certification: true },
    ],

    // Testing
    jest: [
        { courseName: "Testing React with Jest and React Testing Library", platform: "Udemy", url: "https://www.udemy.com/course/react-testing-library/", duration: "8 hours", certification: true },
    ],
    cypress: [
        { courseName: "Cypress End-to-End Testing - Getting Started", platform: "Udemy", url: "https://www.udemy.com/course/cypress-end-to-end-testing-getting-started/", duration: "4 hours", certification: true },
    ],
    selenium: [
        { courseName: "Selenium WebDriver with Java - Basics to Advanced", platform: "Udemy", url: "https://www.udemy.com/course/selenium-real-time-examplesinterview-questions/", duration: "20 hours", certification: true },
    ],

    // Mobile
    "react native": [
        { courseName: "React Native - The Practical Guide [2025]", platform: "Udemy", url: "https://www.udemy.com/course/react-native-the-practical-guide/", duration: "29 hours", certification: true },
    ],
    flutter: [
        { courseName: "Flutter & Dart - The Complete Guide [2025 Edition]", platform: "Udemy", url: "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/", duration: "30 hours", certification: true },
    ],
};

// ============================================================================
// Get recommendations for missing skills
// ============================================================================
export function getRecommendations(missingSkills) {
    if (!missingSkills || missingSkills.length === 0) return [];

    const recommendations = [];

    for (const skill of missingSkills) {
        const normalizedSkill = skill.toLowerCase().trim();
        const courses = COURSE_DATABASE[normalizedSkill];

        if (courses && courses.length > 0) {
            // Pick the top course, validate it
            const topCourse = courses[0];

            // Validate platform
            if (!VALID_PLATFORMS.includes(topCourse.platform)) {
                console.warn(`[RecommendationEngine] Invalid platform for ${skill}: ${topCourse.platform}`);
                recommendations.push(createFallback(skill));
                continue;
            }

            // Validate URL
            if (!isValidUrl(topCourse.url)) {
                console.warn(`[RecommendationEngine] Invalid URL for ${skill}: ${topCourse.url}`);
                recommendations.push(createFallback(skill));
                continue;
            }

            recommendations.push({
                skill: skill,
                course_name: topCourse.courseName,
                platform: topCourse.platform,
                url: topCourse.url,
                duration: topCourse.duration || null,
                certification: topCourse.certification,
            });
        } else {
            // No course found — return clean fallback
            recommendations.push(createFallback(skill));
        }
    }

    return recommendations;
}

/**
 * Creates a fallback recommendation when no curated course is available.
 */
function createFallback(skill) {
    return {
        skill: skill,
        course_name: "No curated course available yet.",
        platform: null,
        url: null,
        duration: null,
        certification: false,
    };
}

/**
 * Gets all available courses for a specific skill.
 * @param {string} skillName - The skill to look up.
 * @returns {Array} - Array of course objects.
 */
export function getCoursesForSkill(skillName) {
    const normalizedSkill = skillName.toLowerCase().trim();
    return COURSE_DATABASE[normalizedSkill] || [];
}
