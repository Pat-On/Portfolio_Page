import workExperience from './workExperience.json';
import { projectsData } from './projectsDescription';
import { certificationData, certificationGroups } from './certificationsData';

describe('workExperience.json', () => {
  const { current, earlier } = workExperience;
  const all = [...current.roles, ...earlier];

  test('has a current company with roles and skills', () => {
    expect(typeof current.company).toBe('string');
    expect(typeof current.link).toBe('string');
    expect(current.roles.length).toBeGreaterThan(0);
    current.roles.forEach((role) => {
      expect(typeof role.title).toBe('string');
      expect(typeof role.time).toBe('string');
      expect(role.description.length).toBeGreaterThan(0);
    });
    expect(current.skills.length).toBeGreaterThan(0);
  });

  test('every earlier role has a one-line summary', () => {
    expect(earlier.length).toBeGreaterThan(0);
    earlier.forEach((role) => {
      ['title', 'company', 'link', 'time', 'summary'].forEach((key) =>
        expect(typeof role[key]).toBe('string')
      );
    });
  });

  test('only the current role is shown as current', () => {
    const present = all.filter((role) => /Present/.test(role.time));
    expect(present.map((role) => role.title)).toEqual(['Software Engineer']);
  });
});

describe('workExperience.json agrees with the CV', () => {
  const se = workExperience.current.roles.find((r) => r.title === 'Software Engineer');

  test('CodeYourFuture volunteering ended in July 2026', () => {
    const cyf = workExperience.earlier.find((r) => r.company === 'CodeYourFuture');
    expect(cyf.time).toMatch(/July 2022 - July 2026/);
  });

  test('the Elastic work is described as a led production migration', () => {
    expect(se.description.some((l) => /Led .*production logging/.test(l))).toBe(true);
  });

  test('the Software Engineer role stays to five bullets', () => {
    expect(se.description.length).toBeLessThanOrEqual(5);
  });

  test('the Friend MTS skills name the AI agent tools', () => {
    expect(workExperience.current.skills).toEqual(
      expect.arrayContaining(['AWS Bedrock AgentCore', 'Strands Agents'])
    );
  });
});

describe('projectsData', () => {
  test('has at least one entry', () => {
    expect(projectsData.length).toBeGreaterThan(0);
  });

  test('every entry has required fields', () => {
    projectsData.forEach((proj) => {
      expect(typeof proj.title).toBe('string');
      expect(typeof proj.description).toBe('string');
      expect(typeof proj.linkGithub).toBe('string');
      expect(Array.isArray(proj.technologies)).toBe(true);
      expect(proj.technologies.length).toBeGreaterThan(0);
    });
  });
});

describe('certificationData', () => {
  test('has at least one entry', () => {
    expect(certificationData.length).toBeGreaterThan(0);
  });

  test('every entry has a title and img', () => {
    certificationData.forEach((cert) => {
      expect(typeof cert.title).toBe('string');
      expect(cert.title.length).toBeGreaterThan(0);
      expect(cert.img).toBeTruthy();
    });
  });

  test('every entry has a full name and belongs to a known group', () => {
    certificationData.forEach((cert) => {
      expect(typeof cert.name).toBe('string');
      expect(cert.name.length).toBeGreaterThan(0);
      expect(certificationGroups).toContain(cert.group);
    });
  });

  test('holds all eleven certifications, AWS AI Practitioner included', () => {
    expect(certificationData).toHaveLength(11);
    expect(certificationData.map((c) => c.name)).toContain('AWS Certified AI Practitioner');
  });

  test('every group has at least one entry', () => {
    certificationGroups.forEach((group) => {
      expect(certificationData.some((c) => c.group === group)).toBe(true);
    });
  });
});
