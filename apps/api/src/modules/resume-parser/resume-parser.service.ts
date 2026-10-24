import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const SKILL_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin',
  'react', 'angular', 'vue', 'svelte', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring',
  'html', 'css', 'scss', 'tailwind', 'bootstrap', 'material ui',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'prisma', 'graphql', 'firebase', 'aws', 'docker',
  'kubernetes', 'ci/cd', 'git', 'linux', 'rest api', 'microservices',
  'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'data science',
  'agile', 'scrum', 'jira', 'figma', 'photoshop',
];

@Injectable()
export class ResumeParserService {
  constructor(private prisma: PrismaService) {}

  async parse(resumeId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: { user: { include: { profile: true } } },
    });
    if (!resume) throw new Error('Resume not found');
    if (!resume.fileUrl) throw new Error('Resume file not found');

    const fs = require('fs');
    const path = require('path');
    const { PDFParse } = require('pdf-parse');

    // resolve relative to this file in dev (dist/src/modules/...) and ts-node runs alike
    const filePath = path.join(__dirname, '..', '..', '..', 'uploads', resume.fileUrl.replace(/^\/?uploads\//, ''));
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    await parser.destroy().catch(() => {});

    const text = data.text;
    const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);

    const foundSkills = SKILL_KEYWORDS.filter((s) => text.toLowerCase().includes(s.toLowerCase()));
    const uniqueSkills = [...new Set(foundSkills)];

    const email = text.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
    const phone = text.match(/[\+]?[\d\s-]{10,15}/)?.[0]?.trim() || '';

    const education: any[] = [];
    const experience: any[] = [];
    let currentSection = '';

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (/education|academic|qualification/i.test(lower)) { currentSection = 'education'; continue; }
      if (/experience|work|employment|professional/i.test(lower)) { currentSection = 'experience'; continue; }
      if (/skills|technologies|technical/i.test(lower)) { currentSection = 'skills'; continue; }
      if (/projects|achievements|certifications/i.test(lower)) { currentSection = ''; continue; }

      if (currentSection === 'education' && line.length > 5) education.push(line);
      if (currentSection === 'experience' && line.length > 5) experience.push(line);
    }

    const parsedData = {
      skills: uniqueSkills,
      education,
      experience,
      email,
      phone,
      rawLength: text.length,
    };

    // deterministic ATS score based on what recruiters/parsers actually look for
    const scoreSkills = Math.min(40, uniqueSkills.length * 5);
    const scoreEmail = email ? 15 : 0;
    const scorePhone = phone ? 15 : 0;
    const scoreEducation = education.length ? 10 : 0;
    const scoreExperience = experience.length ? 15 : 0;
    const scoreLength = text.length >= 200 && text.length <= 4000 ? 5 : 0;
    const atsScore = Math.min(100, scoreSkills + scoreEmail + scorePhone + scoreEducation + scoreExperience + scoreLength);

    const suggestions: string[] = [];
    if (!email) suggestions.push('Add a professional email address');
    if (!phone) suggestions.push('Add a contact phone number');
    if (uniqueSkills.length < 5) suggestions.push('List at least 5 relevant skills');
    if (!education.length) suggestions.push('Add an Education section');
    if (!experience.length) suggestions.push('Add an Experience section with measurable achievements');

    const missingKeywords = SKILL_KEYWORDS.slice(0, 12).filter((k) => !uniqueSkills.includes(k)).slice(0, 5);

    const doc = await this.prisma.resume.update({
      where: { id: resumeId },
      data: {
        parsedData,
        atsScore,
        atsFeedback: { suggestions, missingKeywords },
      },
    });

    const profileUpdates: any = {};
    if (phone && !resume.user.profile?.phone) {
      profileUpdates.phone = phone.replace(/[^\d]/g, '').slice(0, 15);
    }
    if (Object.keys(profileUpdates).length) {
      await this.prisma.profile.update({
        where: { userId: resume.userId },
        data: profileUpdates,
      });
    }

    return doc;
  }
}
