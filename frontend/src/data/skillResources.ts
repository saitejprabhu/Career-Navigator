export interface SkillResource {
  description: string;
  whyItMatters: string;
  videoTitle: string;
  videoUrl: string;
  docTitle: string;
  docUrl: string;
  certificationTitle?: string;
  certificationUrl?: string;
  estimatedTime: string; // e.g. "1-2 weeks"
}

export const SKILL_RESOURCES: Record<string, SkillResource> = {
  "python-basics": {
    description:
      "Python is a beginner-friendly, general-purpose language. You learn variables, control flow, functions, data structures and working with files.",
    whyItMatters:
      "Python is the most common first language and the standard for data analysis, automation, backend development and machine learning.",
    videoTitle: "Python Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Python+full+course+for+beginners",
    docTitle: "The Python Tutorial (Official)",
    docUrl: "https://docs.python.org/3/tutorial/",
    estimatedTime: "4-6 weeks",
  },
  "html-css": {
    description:
      "HTML structures the content of a web page and CSS controls how it looks, including layout, colors, spacing and responsiveness.",
    whyItMatters:
      "Every website is built on HTML and CSS, so they are the starting point for any frontend or full stack role.",
    videoTitle: "HTML and CSS Full Course for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=HTML+and+CSS+full+course+for+beginners",
    docTitle: "MDN Web Docs: HTML",
    docUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    estimatedTime: "3-4 weeks",
  },
  html: {
    description:
      "HTML is the markup language that defines the structure of web pages using elements like headings, links, images, forms and lists.",
    whyItMatters:
      "Semantic, accessible HTML is the foundation of every web page and affects SEO, accessibility and how easily you can style your pages.",
    videoTitle: "HTML Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=HTML+full+course+for+beginners",
    docTitle: "MDN Web Docs: HTML",
    docUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    estimatedTime: "1-2 weeks",
  },
  css: {
    description:
      "CSS styles web pages with colors, typography, spacing and layout, including Flexbox, Grid and responsive design for different screen sizes.",
    whyItMatters:
      "Good CSS skills separate a plain page from a polished, mobile-friendly interface, and frameworks like Tailwind build directly on them.",
    videoTitle: "CSS Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=CSS+full+course+for+beginners+flexbox+grid",
    docTitle: "MDN Web Docs: CSS",
    docUrl: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    estimatedTime: "2-3 weeks",
  },
  javascript: {
    description:
      "JavaScript is the programming language of the web. It adds interactivity to pages and also runs on servers through Node.js.",
    whyItMatters:
      "JavaScript is required for frontend development and is one of the most widely used languages for full stack work.",
    videoTitle: "JavaScript Full Course for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=JavaScript+full+course+for+beginners",
    docTitle: "MDN JavaScript Guide",
    docUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    estimatedTime: "6-8 weeks",
  },
  git: {
    description:
      "Git is a version control system that tracks changes to your code, lets you undo mistakes and makes it possible to collaborate through branches and pull requests.",
    whyItMatters:
      "Every software team uses Git, so knowing it is expected in practically every developer role.",
    videoTitle: "Git and GitHub Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Git+and+GitHub+tutorial+for+beginners",
    docTitle: "Pro Git Book",
    docUrl: "https://git-scm.com/book/en/v2",
    estimatedTime: "1 week",
  },
  react: {
    description:
      "React is a JavaScript library for building user interfaces out of reusable components with state and props.",
    whyItMatters:
      "React is the most widely used frontend library, and it appears in a large share of frontend and full stack job listings.",
    videoTitle: "React Course for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=React+full+course+for+beginners",
    docTitle: "React Documentation",
    docUrl: "https://react.dev/learn",
    estimatedTime: "4-6 weeks",
  },
  nodejs: {
    description:
      "Node.js lets you run JavaScript outside the browser, so you can build servers, APIs and command-line tools.",
    whyItMatters:
      "It lets you use one language across the frontend and backend, which makes it a popular choice for full stack developers.",
    videoTitle: "Node.js Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Node.js+full+course+for+beginners",
    docTitle: "Node.js Learn",
    docUrl: "https://nodejs.org/en/learn",
    estimatedTime: "3-4 weeks",
  },
  express: {
    description:
      "Express is a minimal web framework for Node.js that handles routing, middleware and requests to build REST APIs.",
    whyItMatters:
      "Express is the most common way to build Node.js backends and is often the first backend framework JavaScript developers learn.",
    videoTitle: "Express.js Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Express.js+crash+course+REST+API",
    docTitle: "Express Documentation",
    docUrl: "https://expressjs.com/",
    estimatedTime: "2 weeks",
  },
  mongodb: {
    description:
      "MongoDB is a NoSQL database that stores data as flexible JSON-like documents instead of rows and tables.",
    whyItMatters:
      "MongoDB pairs naturally with Node.js and is widely used in the MERN stack for building web applications quickly.",
    videoTitle: "MongoDB Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=MongoDB+crash+course+for+beginners",
    docTitle: "MongoDB Manual",
    docUrl: "https://www.mongodb.com/docs/manual/",
    estimatedTime: "2 weeks",
  },
  sql: {
    description:
      "SQL is the standard language for querying and managing data in relational databases using SELECT, JOIN, GROUP BY and more.",
    whyItMatters:
      "SQL is required in data, backend and analytics roles, and it stays useful across almost every database you will meet.",
    videoTitle: "SQL Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=SQL+full+course+for+beginners",
    docTitle: "SQLBolt: Interactive SQL Lessons",
    docUrl: "https://sqlbolt.com/",
    estimatedTime: "2-3 weeks",
  },
  databases: {
    description:
      "Database fundamentals: how data is modeled, stored and queried, including tables, keys, relationships, normalization and the differences between SQL and NoSQL.",
    whyItMatters:
      "Almost every application stores data, so understanding database design helps you build faster, more reliable backends.",
    videoTitle: "Database Design Course for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=database+design+course+for+beginners",
    docTitle: "GeeksforGeeks: DBMS Tutorial",
    docUrl: "https://www.geeksforgeeks.org/dbms/",
    estimatedTime: "2-3 weeks",
  },
  "ml-fundamentals": {
    description:
      "Machine learning fundamentals: how models learn from data, including regression, classification, training, evaluation and overfitting.",
    whyItMatters:
      "These concepts are the base for every AI and ML role, and they help you judge what machine learning can and cannot do.",
    videoTitle: "Machine Learning for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=machine+learning+full+course+for+beginners",
    docTitle: "Google Machine Learning Crash Course",
    docUrl: "https://developers.google.com/machine-learning/crash-course",
    estimatedTime: "6-8 weeks",
  },
  figma: {
    description:
      "Figma is a collaborative design tool for creating wireframes, interface mockups and clickable prototypes right in the browser.",
    whyItMatters:
      "Figma is the standard tool for UI/UX design and for handing designs to developers, so it appears in most design job listings.",
    videoTitle: "Figma Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Figma+tutorial+for+beginners+full+course",
    docTitle: "Figma Learn",
    docUrl: "https://help.figma.com/hc/en-us",
    estimatedTime: "2-3 weeks",
  },
  "design-systems": {
    description:
      "A design system is a shared set of components, colors, typography and rules that keeps a product's interface consistent as it grows.",
    whyItMatters:
      "Teams use design systems to design and build faster with fewer inconsistencies, so it is a valuable skill for designers and frontend developers alike.",
    videoTitle: "Design Systems Explained (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=design+systems+for+beginners+figma",
    docTitle: "Material Design 3",
    docUrl: "https://m3.material.io/",
    estimatedTime: "2-3 weeks",
  },

  typescript: {
    description:
      "TypeScript is a typed superset of JavaScript that adds static type-checking, catching errors during development rather than at runtime.",
    whyItMatters:
      "TypeScript is now standard in most professional React and Node.js codebases — it's frequently listed as a requirement, not just a nice-to-have.",
    videoTitle: "TypeScript Course for Beginners",
    videoUrl: "https://www.youtube.com/watch?v=BwuLxPH8IDs",
    docTitle: "TypeScript Official Handbook",
    docUrl: "https://www.typescriptlang.org/docs/handbook/intro.html",
    estimatedTime: "1-2 weeks",
  },
  java: {
    description:
      "Java is a general-purpose, object-oriented language that runs on the JVM and is widely used for enterprise backends and Android apps.",
    whyItMatters:
      "Java is still one of the most requested languages in enterprise hiring, and it is the foundation for learning Kotlin and Android development.",
    videoTitle: "Java Programming for Beginners – Full Course (freeCodeCamp)",
    videoUrl:
      "https://www.youtube.com/results?search_query=freeCodeCamp+Java+Programming+for+Beginners+Full+Course",
    docTitle: "Java Documentation (Oracle)",
    docUrl: "https://docs.oracle.com/en/java/",
    estimatedTime: "6-8 weeks",
  },
  kotlin: {
    description:
      "Kotlin is a concise, modern language that interoperates fully with Java and is the preferred language for building Android apps.",
    whyItMatters:
      "Most new Android apps are written in Kotlin, so it is close to a requirement for mobile developer roles.",
    videoTitle: "Kotlin Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Kotlin+full+course+for+beginners",
    docTitle: "Kotlin Documentation",
    docUrl: "https://kotlinlang.org/docs/home.html",
    estimatedTime: "3-4 weeks",
  },
  swift: {
    description:
      "Swift is Apple's modern programming language for building apps on iPhone, iPad, Mac and Apple Watch.",
    whyItMatters:
      "Swift is required for native iOS development, and Apple has made it the default language for its platforms.",
    videoTitle: "Swift Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Swift+programming+full+course+for+beginners",
    docTitle: "Swift Documentation",
    docUrl: "https://www.swift.org/documentation/",
    estimatedTime: "4-6 weeks",
  },
  cpp: {
    description:
      "C++ is a high-performance language that gives direct control over memory and hardware while supporting modern abstractions.",
    whyItMatters:
      "Game engines, browsers, operating systems and embedded software depend on C++ wherever speed and control matter.",
    videoTitle: "C++ Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=C%2B%2B+full+course+for+beginners",
    docTitle: "cppreference.com",
    docUrl: "https://en.cppreference.com/w/",
    estimatedTime: "8-10 weeks",
  },
  rust: {
    description:
      "Rust is a systems language that guarantees memory safety without a garbage collector through its ownership model.",
    whyItMatters:
      "Rust adoption is growing fast in infrastructure, security and performance-critical software, and it is consistently one of the most admired languages.",
    videoTitle: "Rust Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Rust+programming+course+for+beginners",
    docTitle: "The Rust Programming Language (Book)",
    docUrl: "https://doc.rust-lang.org/book/",
    estimatedTime: "8-10 weeks",
  },
  go: {
    description:
      "Go is a small, fast language with built-in concurrency, designed for building network services and cloud tooling.",
    whyItMatters:
      "Docker and Kubernetes are written in Go, so it is a strong choice for backend, cloud and DevOps roles.",
    videoTitle: "Go Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Golang+full+course+for+beginners",
    docTitle: "Go Documentation",
    docUrl: "https://go.dev/doc/",
    estimatedTime: "3-4 weeks",
  },
  csharp: {
    description:
      "C# is a modern, type-safe language for building web APIs, desktop apps and games on the .NET platform.",
    whyItMatters:
      "C# is the main language for .NET jobs and for Unity game development, and it is common in enterprise companies.",
    videoTitle: "C# Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=C%23+full+course+for+beginners",
    docTitle: "C# Documentation (Microsoft)",
    docUrl: "https://learn.microsoft.com/en-us/dotnet/csharp/",
    estimatedTime: "5-7 weeks",
  },
  php: {
    description:
      "PHP is a server-side scripting language used to build dynamic websites, web apps and APIs.",
    whyItMatters:
      "A large share of the web runs on PHP, including WordPress and Laravel, so there is steady demand for PHP developers.",
    videoTitle: "PHP Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=PHP+full+course+for+beginners",
    docTitle: "PHP Manual",
    docUrl: "https://www.php.net/manual/en/",
    estimatedTime: "4-5 weeks",
  },
  linux: {
    description:
      "Linux is the operating system behind most servers. You learn the command line, file system, permissions, processes and package management.",
    whyItMatters:
      "Nearly every cloud server and container runs Linux, so it underpins backend, DevOps and security work.",
    videoTitle: "Linux Command Line Full Course (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Linux+command+line+full+course+for+beginners",
    docTitle: "Linux Journey",
    docUrl: "https://linuxjourney.com/",
    estimatedTime: "2-3 weeks",
  },
  docker: {
    description:
      "Docker packages an application and its dependencies into a container so it runs the same way on every machine.",
    whyItMatters:
      "Containers are the standard way to ship software today, so Docker appears in most backend and DevOps job listings.",
    videoTitle: "Docker Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Docker+tutorial+for+beginners+full+course",
    docTitle: "Docker Documentation",
    docUrl: "https://docs.docker.com/",
    estimatedTime: "1-2 weeks",
  },
  kubernetes: {
    description:
      "Kubernetes automates deploying, scaling and recovering containerized applications across a cluster of machines.",
    whyItMatters:
      "It is the leading container orchestrator and a core skill for DevOps and cloud engineering roles.",
    videoTitle: "Kubernetes Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=Kubernetes+tutorial+for+beginners+full+course",
    docTitle: "Kubernetes Documentation",
    docUrl: "https://kubernetes.io/docs/home/",
    estimatedTime: "3-4 weeks",
  },
  aws: {
    description:
      "Amazon Web Services provides on-demand cloud computing, storage, networking and database services.",
    whyItMatters:
      "AWS is the largest cloud provider, so hands-on experience with it opens doors to cloud, DevOps and backend roles.",
    videoTitle: "AWS Cloud Practitioner Full Course (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=AWS+Certified+Cloud+Practitioner+full+course",
    docTitle: "AWS Documentation",
    docUrl: "https://docs.aws.amazon.com/",
    estimatedTime: "4-6 weeks",
  },
  postgresql: {
    description:
      "PostgreSQL is a powerful open-source relational database with strong support for complex queries, transactions and data integrity.",
    whyItMatters:
      "It is a default choice for production applications, and it builds directly on the SQL you already know.",
    videoTitle: "PostgreSQL Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=PostgreSQL+tutorial+for+beginners+full+course",
    docTitle: "PostgreSQL Documentation",
    docUrl: "https://www.postgresql.org/docs/",
    estimatedTime: "2-3 weeks",
  },
  statistics: {
    description:
      "Statistics covers describing data, probability, distributions, sampling and hypothesis testing.",
    whyItMatters:
      "It is the foundation of data analysis and machine learning, and it helps you judge whether a result is meaningful or just noise.",
    videoTitle: "Statistics for Data Science (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=statistics+for+data+science+full+course",
    docTitle: "Khan Academy: Statistics and Probability",
    docUrl: "https://www.khanacademy.org/math/statistics-probability",
    estimatedTime: "4-6 weeks",
  },
  pandas: {
    description:
      "Pandas is a Python library for loading, cleaning, transforming and analyzing tabular data using DataFrames.",
    whyItMatters:
      "Pandas is the everyday tool of data analysts and a core skill for data engineering and machine learning roles.",
    videoTitle: "Pandas Tutorial for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=pandas+python+tutorial+for+beginners",
    docTitle: "pandas: Getting Started",
    docUrl: "https://pandas.pydata.org/docs/getting_started/index.html",
    estimatedTime: "2-3 weeks",
  },
  dataviz: {
    description:
      "Data visualization turns raw numbers into charts and plots that make patterns and insights easy to see and share.",
    whyItMatters:
      "Communicating findings clearly is a major part of a data analyst's job, and good charts are often what convinces stakeholders.",
    videoTitle: "Data Visualization with Matplotlib (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=matplotlib+data+visualization+tutorial+python",
    docTitle: "Matplotlib Tutorials",
    docUrl: "https://matplotlib.org/stable/tutorials/index.html",
    estimatedTime: "2 weeks",
  },
  networking: {
    description:
      "Networking basics: IP addressing, DNS, TCP/UDP, HTTP and how data travels between machines across the internet.",
    whyItMatters:
      "Understanding networks is essential for debugging backend issues and is a prerequisite for security and DevOps work.",
    videoTitle: "Computer Networking Full Course (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=computer+networking+full+course+for+beginners",
    docTitle: "MDN: An Overview of HTTP",
    docUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
    estimatedTime: "3-4 weeks",
  },
  cybersecurity: {
    description:
      "Cybersecurity fundamentals: common attacks, secure coding, authentication and how to find and fix weaknesses in systems.",
    whyItMatters:
      "Every organization needs people who can protect its systems, and security knowledge makes any developer more valuable.",
    videoTitle: "Cybersecurity Fundamentals Course (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=cybersecurity+fundamentals+full+course+for+beginners",
    docTitle: "OWASP Top 10",
    docUrl: "https://owasp.org/www-project-top-ten/",
    estimatedTime: "6-8 weeks",
  },

  nextjs: {
    description:
      "Next.js fundamentals: building modern React applications with routing, server-side rendering, API routes, data fetching, and optimized web performance.",
    whyItMatters:
      "Next.js is widely used for building fast, scalable, and production-ready web applications, making it a valuable skill for modern frontend and full-stack development.",
    videoTitle: "Next.js Full Course for Beginners (YouTube search)",
    videoUrl:
      "https://www.youtube.com/results?search_query=nextjs+full+course+for+beginners",
    docTitle: "Next.js Documentation",
    docUrl: "https://nextjs.org/docs",
    estimatedTime: "4-6 weeks",
  },
};

export function getSkillResource(skillId: string): SkillResource | null {
  return SKILL_RESOURCES[skillId] || null;
}
