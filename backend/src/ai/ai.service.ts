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

    // Smart Fallback if LLM API key not present
    const qLower = query.toLowerCase();
    let fallbackAnswer = '';

    if (qLower.includes('too much coding') || qLower.includes('don\'t want') || qLower.includes('less coding')) {
      fallbackAnswer = `Based on your profile, if you enjoy technology but prefer less intensive daily coding, excellent career paths to explore include **DevOps / Cloud Engineer**, **Data Analyst**, or **Technical Product / Solutions Specialist**. These roles emphasize architecture, data insights, and system design over heavy pure software development.`;
    } else if (qLower.includes('why') && (qLower.includes('skill') || qLower.includes('required'))) {
      fallbackAnswer = `Skills are required to ensure you can build production-ready applications independently. For instance, foundational languages provide logic, frameworks like React or Next.js structure the UI, and tools like TypeScript ensure code quality and prevent runtime errors.`;
    } else {
      const skillsStr = userProfile?.skills?.length ? userProfile.skills.slice(0, 4).join(', ') : 'your current skills';
      fallbackAnswer = `Looking at your profile with skills in ${skillsStr}, you are well-positioned for career paths in software engineering and cloud infrastructure. Check out our enrolled pathways on the careers page to get started!`;
    }

    return {
      response: fallbackAnswer,
      source: 'Career Navigator Assistant (Fallback)',
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
