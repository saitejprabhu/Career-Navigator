import { Injectable, Logger } from '@nestjs/common';
import { SkillGapSummaryDto } from './dto/skill-gap-summary.dto';
import { CareerDiscoveryDto } from './dto/career-discovery.dto';
import { ExtractSkillsDto } from './dto/extract-skills.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async generateSkillGapSummary(dto: SkillGapSummaryDto): Promise<{ summary: string; source: string }> {
    const targetRole = dto?.targetRole || 'Target Career Path';
    const currentSkills = dto?.currentSkills || [];
    const missingSkills = dto?.missingSkills || [];
    const projects = dto?.projects || [];
    const experience = dto?.experience || '';
    const customDoubt = dto?.customDoubt || '';

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const doubtSection = customDoubt?.trim()
      ? `User's Specific Question / Doubt: "${customDoubt.trim()}"`
      : 'No specific user doubt provided.';

    const promptText = `
You are an expert career counselor. Generate a concise, personalized skill gap summary (2-3 sentences max).
Target Role: ${targetRole}
Current Skills: ${currentSkills?.length ? currentSkills.join(', ') : 'None listed'}
Missing Skills: ${missingSkills?.length ? missingSkills.join(', ') : 'None missing'}
Relevant Projects: ${projects?.length ? projects.join(', ') : 'None'}
Experience: ${experience || 'Not specified'}
${doubtSection}

Instructions:
- Be encouraging, concise, and direct.
- Highlight current strengths first if available.
- Prioritize key missing skills to focus on next.
- If a user doubt/question is provided above, directly answer their doubt in your response while addressing their skill gap.
- Do NOT use bullet points or extra headers, output a plain text summary paragraph.
`;

    // 1. Try OpenAI if API key present
    if (openAiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an AI career navigation assistant.' },
              { role: 'user', content: promptText },
            ],
            max_tokens: 250,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const summary = data?.choices?.[0]?.message?.content?.trim();
          if (summary) {
            return { summary, source: 'OpenAI LLM' };
          }
        } else {
          const errorData = await response.text();
          this.logger.warn(`OpenAI API error response: ${errorData}`);
        }
      } catch (err) {
        this.logger.error('Failed to communicate with OpenAI API', err);
      }
    }

    // 2. Try Gemini if API key present
    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (summary) {
            return { summary, source: 'Gemini LLM' };
          }
        } else {
          const errorData = await response.text();
          this.logger.warn(`Gemini API error response: ${errorData}`);
        }
      } catch (err) {
        this.logger.error('Failed to communicate with Gemini API', err);
      }
    }

    // 3. Smart Fallback Summary if API key is unconfigured or failed
    const currentList = currentSkills.length > 0 ? currentSkills.slice(0, 3).join(', ') : 'foundational concepts';
    const missingList = missingSkills.length > 0 ? missingSkills.slice(0, 3).join(' and ') : 'advanced practices';

    let fallbackSummary = `You have built a solid start in ${targetRole} with skills in ${currentList}. To advance towards your goal, your next key priorities should focus on mastering ${missingList}.`;

    if (customDoubt?.trim()) {
      fallbackSummary += ` Regarding your question ("${customDoubt.trim()}"), focusing on ${missingList} first will directly help address this goal.`;
    }

    return {
      summary: fallbackSummary,
      source: 'Career Navigator Engine (Fallback)',
    };
  }

  async generateCareerDiscoveryResponse(dto: CareerDiscoveryDto): Promise<{ response: string; source: string }> {
    const query = dto?.query?.trim() || 'What career paths suit my profile?';
    const userProfile = dto?.userProfile || {};
    const availableRoles = dto?.availableRoles || [];

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const rolesContext = availableRoles?.length
      ? availableRoles.map((r: any) => `- ${r.name || r.roleId} (Required skills: ${r.requiredSkills?.join(', ') || 'N/A'})`).join('\n')
      : 'No available roles provided.';

    const profileContext = userProfile
      ? `Name: ${userProfile.name || 'Learner'}
Skills: ${userProfile.skills?.length ? userProfile.skills.join(', ') : 'None listed'}
Education: ${userProfile.education?.length ? userProfile.education.join(', ') : 'None listed'}
Experience: ${userProfile.experience?.length ? userProfile.experience.join(', ') : 'None listed'}
Interests: ${userProfile.interests?.length ? userProfile.interests.join(', ') : 'None listed'}`
      : 'User profile not available.';

    const promptText = `
You are an expert Career Discovery AI Assistant for the Career Navigator platform.
Your goal is to guide learners to explore suitable career paths, choose courses, understand why specific skills are needed, and navigate non-traditional tech careers based on their profile.

Learner Profile:
${profileContext}

Available Platform Careers:
${rolesContext}

Learner's Question:
"${query}"

Instructions:
- Provide a helpful, personalized response suggesting matching career options or explaining skill requirements.
- If the user specifies preferences (e.g. "I like coding but don't want too much coding" or "why is X skill required?"), directly address their preference.
- Reference relevant available platform careers when appropriate.
- Keep the tone encouraging, clear, and easy to read.
`;

    if (openAiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a helpful AI Career Discovery Assistant.' },
              { role: 'user', content: promptText },
            ],
            max_tokens: 400,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const answer = data?.choices?.[0]?.message?.content?.trim();
          if (answer) {
            return { response: answer, source: 'OpenAI LLM' };
          }
        }
      } catch (err) {
        this.logger.error('Failed OpenAI career discovery request', err);
      }
    }

    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (answer) {
            return { response: answer, source: 'Gemini LLM' };
          }
        }
      } catch (err) {
        this.logger.error('Failed Gemini career discovery request', err);
      }
    }

    // Advanced Smart AI Conversational Engine
    const qLower = query.toLowerCase();
    const userSkills: string[] = userProfile?.skills || [];
    const skillsStr = userSkills.length > 0 ? userSkills.slice(0, 5).join(', ') : 'your core technical concepts';
    const userName = userProfile?.name || 'Learner';

    let fallbackAnswer = '';

    if (qLower.includes('too much coding') || qLower.includes('don\'t want') || qLower.includes('less coding') || qLower.includes('no coding')) {
      fallbackAnswer = `Hello ${userName}! If you prefer tech roles with less intensive daily coding, excellent career pathways to consider include **DevOps / Cloud Engineer**, **Data Analyst**, or **Technical Product Manager**.\n\nThese roles focus on system architecture, data visualization, and infrastructure management rather than writing complex software algorithms all day. Check out the **DevOps / Cloud Engineer** or **Data Analyst** roles on our platform to get started!`;
    } else if (qLower.includes('frontend') || qLower.includes('react') || qLower.includes('ui') || qLower.includes('css') || qLower.includes('html') || qLower.includes('web development')) {
      fallbackAnswer = `Frontend development is focused on building intuitive, responsive user interfaces. To become a strong Frontend Developer, focus on mastering **HTML**, **CSS**, **JavaScript**, **React**, and **Next.js**.\n\nSince you already have skills in ${skillsStr}, practicing component architecture, state management (Zustand/Redux), and responsive design will prepare you for production roles!`;
    } else if (qLower.includes('backend') || qLower.includes('node') || qLower.includes('api') || qLower.includes('database') || qLower.includes('mongo') || qLower.includes('nest') || qLower.includes('sql')) {
      fallbackAnswer = `Backend engineering focuses on building scalable server APIs, authentication, and database architectures. Recommended skills include **Node.js**, **NestJS/Express**, **TypeScript**, **MongoDB**, and **PostgreSQL**.\n\nTo stand out, build RESTful APIs with full authentication, data validation, and database relations, then verify your backend skills using our stage-gated project submissions!`;
    } else if (qLower.includes('fullstack') || qLower.includes('full stack') || qLower.includes('full-stack')) {
      fallbackAnswer = `A Fullstack Developer connects interactive UI frontends with robust backend server APIs and databases.\n\nOn Career Navigator, we recommend starting with modern web stacks like **React/Next.js** for frontend, **Node.js/NestJS** for backend APIs, and **MongoDB/PostgreSQL** for database persistence. Complete both Frontend and Backend roadmaps to earn fullstack readiness!`;
    } else if (qLower.includes('ai') || qLower.includes('machine learning') || qLower.includes('ml') || qLower.includes('python') || qLower.includes('data science')) {
      fallbackAnswer = `AI & Machine Learning Engineering involves building predictive models, data processing pipelines, and integrating LLMs into modern software.\n\nKey skills to master include **Python**, **Data Analysis**, **TensorFlow/PyTorch**, and API integration. Explore our AI-focused pathway to see required competencies and project tasks!`;
    } else if (qLower.includes('cloud') || qLower.includes('devops') || qLower.includes('aws') || qLower.includes('docker') || qLower.includes('kubernetes')) {
      fallbackAnswer = `DevOps & Cloud Infrastructure is essential for deploying, monitoring, and scaling applications in production.\n\nCore technologies include **Docker**, **Kubernetes**, **CI/CD Pipelines**, **Linux administration**, and **AWS/GCP**. Enrolling in our Cloud & DevOps pathway will guide you step-by-step through environment configuration!`;
    } else if (qLower.includes('salary') || qLower.includes('pay') || qLower.includes('package') || qLower.includes('compensation') || qLower.includes('earning') || qLower.includes('income')) {
      fallbackAnswer = `Salary packages vary based on region, experience, and verified skill set! For instance, Software Engineers and Cloud Architects command high compensation in tech markets globally.\n\nYou can use our interactive **Salary Insights** card directly on each career card on the Careers page to check real-time estimated ranges by country (India, US, UK, Canada, Australia)!`;
    } else if (qLower.includes('best') || qLower.includes('match') || qLower.includes('suit') || qLower.includes('fit') || qLower.includes('which career') || qLower.includes('which role') || qLower.includes('recommend')) {
      if (availableRoles.length > 0) {
        let bestRole = availableRoles[0];
        let maxMatch = -1;
        availableRoles.forEach((role: any) => {
          const req: string[] = role.requiredSkills || [];
          const matchCount = req.filter((s: string) => userSkills.includes(s)).length;
          const pct = req.length > 0 ? matchCount / req.length : 0;
          if (pct > maxMatch) {
            maxMatch = pct;
            bestRole = role;
          }
        });
        const matchPct = Math.round(maxMatch * 100);
        fallbackAnswer = `Based on your profile skills (${skillsStr}), your strongest current match is **${bestRole.name || bestRole.roleId}** with a **${matchPct}% skill match**!\n\nWe recommend enrolling in the **${bestRole.name || bestRole.roleId}** pathway on the Careers page to see your interactive skill map and complete missing prerequisites.`;
      } else {
        fallbackAnswer = `Based on your profile skills in ${skillsStr}, roles in modern Web Development, Backend Engineering, or Cloud Infrastructure match your foundation well! Check out our active career paths on the Careers page.`;
      }
    } else if (qLower.includes('roadmap') || qLower.includes('path') || qLower.includes('where to start') || qLower.includes('order') || qLower.includes('how to learn')) {
      fallbackAnswer = `To follow an effective learning path on Career Navigator:\n\n1. **Enroll in a Pathway:** Pick a role on the Careers page.\n2. **Follow the Career Map:** Open your interactive visual roadmap where prerequisites are mapped in logical order.\n3. **Build & Verify:** For each skill, complete practical projects, submit your GitHub link, and pass the verification quiz to move your status from claimed → practiced → mastered!`;
    } else if (qLower.includes('project') || qLower.includes('portfolio') || qLower.includes('github')) {
      fallbackAnswer = `Projects prove what you can build beyond theoretical knowledge! On Career Navigator, each skill features stage-gated projects.\n\nWhen you submit your GitHub repository URL on the skill page (\`/skill/[skillId]\`) and pass the verification assessment, your skill status is officially upgraded on your career map and readiness score!`;
    } else if (qLower.includes('resume') || qLower.includes('upload') || qLower.includes('cv')) {
      fallbackAnswer = `You can upload your PDF or DOCX resume directly on your **Profile page**! Our AI parser extracts your technical skills, education, and experience, mapping them into your profile tags automatically.`;
    } else if (qLower.includes('why') && (qLower.includes('skill') || qLower.includes('required') || qLower.includes('need'))) {
      fallbackAnswer = `Skills are required to ensure you can build production-ready applications independently. For instance, foundational programming languages structure logic, frameworks simplify complex UI/server patterns, and databases handle data persistence safely.`;
    } else {
      fallbackAnswer = `Great question! As a learner with skills in **${skillsStr}**, navigating your career path involves selecting a target role and systematically building verified competencies.\n\nFeel free to ask me about specific tech roles (Frontend, Backend, DevOps, AI, Data), salary insights, project verification, or which career path best matches your goals!`;
    }

    return {
      response: fallbackAnswer,
      source: 'Career Navigator Discovery Engine',
    };
  }

  async extractSkillsFromResumeText(dto: ExtractSkillsDto): Promise<{ extractedSkills: string[]; source: string }> {
    const resumeText = dto?.resumeText?.trim() || '';
    const availableSkills = dto?.availableSkills || [];

    if (!resumeText) {
      return {
        extractedSkills: [],
        source: 'No resume text detected',
      };
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const promptText = `
You are an expert AI resume parsing engine.
Extract all technical skills, programming languages, software tools, frameworks, databases, and technical competencies mentioned in the following resume.

Resume Text:
"""
${resumeText}
"""

Instructions:
1. Return ONLY a valid JSON array of strings containing the extracted skill names (e.g. ["React", "TypeScript", "Node.js", "MongoDB", "Python"]).
2. Do NOT add markdown codeblocks, explanation text, or extra characters outside the JSON array.
`;

    // 1. Try Gemini API
    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (rawText) {
            rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return { extractedSkills: parsed, source: 'Gemini AI Resume Extractor' };
            }
          }
        }
      } catch (err) {
        this.logger.error('Gemini resume skill extraction failed', err);
      }
    }

    // 2. Try OpenAI API
    if (openAiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: promptText }],
            max_tokens: 300,
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let rawText = data?.choices?.[0]?.message?.content?.trim();
          if (rawText) {
            rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return { extractedSkills: parsed, source: 'OpenAI AI Resume Extractor' };
            }
          }
        }
      } catch (err) {
        this.logger.error('OpenAI resume skill extraction failed', err);
      }
    }

    // 3. Fallback Smart Keyword Extraction
    const lowerText = resumeText.toLowerCase();
    const defaultSkillCatalog = [
      'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
      'Express', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
      'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'GraphQL', 'REST API',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'CI/CD',
      'Tailwind', 'Bootstrap', 'Redux', 'Zustand', 'Jest', 'Cypress'
    ];

    const extracted: string[] = [];
    for (const skill of defaultSkillCatalog) {
      const sLower = skill.toLowerCase();
      if (lowerText.includes(sLower) || lowerText.includes(sLower.replace('.', ''))) {
        extracted.push(skill);
      }
    }

    return {
      extractedSkills: extracted.length > 0 ? extracted : ['JavaScript', 'HTML', 'React'],
      source: 'Career Navigator Smart Resume Parser (Fallback)',
    };
  }
}
