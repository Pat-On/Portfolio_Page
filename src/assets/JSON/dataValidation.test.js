import workExperience from './workExperience.json';
import { projectsData } from './projectsDescription';
import { certificationData, certificationGroups } from './certificationsData';

describe('workExperience.json', () => {
  test('has at least one entry', () => {
    expect(Object.keys(workExperience).length).toBeGreaterThan(0);
  });

  test('every entry has required fields with correct types', () => {
    Object.values(workExperience).forEach((job) => {
      expect(typeof job.title).toBe('string');
      expect(typeof job.company).toBe('string');
      expect(typeof job.time).toBe('string');
      expect(typeof job.link).toBe('string');
      expect(Array.isArray(job.description)).toBe(true);
      expect(job.description.length).toBeGreaterThan(0);
      job.description.forEach((line) => expect(typeof line).toBe('string'));
    });
  });
});

describe('workExperience.json agrees with the CV', () => {
  const byTitle = (title) => Object.values(workExperience).find((j) => j.title === title);

  test('ended volunteer roles are not shown as current', () => {
    expect(byTitle('Volunteer Software Engineering Instructor').time).toMatch(/July 2022 - July 2026/);
    expect(byTitle('Volunteer Student Mentor').time).not.toMatch(/Present/);
  });

  test('the Elastic work is described as a led production migration', () => {
    const se = byTitle('Software Engineer');
    expect(se.description.some((l) => /Led .*production logging/.test(l))).toBe(true);
  });

  test('the Software Engineer entry stays to five bullets plus the Skills line', () => {
    const se = byTitle('Software Engineer');
    const bullets = se.description.filter((l) => !l.startsWith('Skills:'));
    expect(bullets.length).toBeLessThanOrEqual(5);
    expect(se.description[se.description.length - 1]).toMatch(/^Skills:/);
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

  test('every group has at least one entry', () => {
    certificationGroups.forEach((group) => {
      expect(certificationData.some((c) => c.group === group)).toBe(true);
    });
  });
});
