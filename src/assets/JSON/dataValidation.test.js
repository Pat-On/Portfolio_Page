import workExperience from './workExperience.json';
import { projectsData } from './projectsDescription';
import { certificationData } from './certificationsData';

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
});
