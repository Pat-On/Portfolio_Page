import AZ400 from "../images/certifications/AZ400.png";
import AZ305 from "../images/certifications/AZ305.png";
import AZ204 from "../images/certifications/AZ204.png";
import AZ104 from "../images/certifications/AZ104.png";

import AI900 from "../images/certifications/AI900.png";
import AZ900 from "../images/certifications/AZ900.png";
import SC900 from "../images/certifications/SC900.png";
import DP900 from "../images/certifications/DP900.png";

import AWSPractitioner from "../images/certifications/AWSPractitioner.png";
import Terraform from "../images/certifications/terraform.png";

const ARCH = "Architecture & DevOps";
const CLOUD = "Cloud";
const IAC = "Infrastructure as Code";

// Display order of the groups in the Certifications section
const certificationGroups = [ARCH, CLOUD, IAC];

const certificationData = [
  {
    title: "AZ-400",
    name: "Microsoft Certified: DevOps Engineer Expert",
    group: ARCH,
    img: AZ400,
  },
  {
    title: "AZ-305",
    name: "Microsoft Certified: Azure Solutions Architect Expert",
    group: ARCH,
    img: AZ305,
  },
  {
    title: "AZ-204",
    name: "Microsoft Certified: Azure Developer Associate",
    group: CLOUD,
    img: AZ204,
  },
  {
    title: "AZ-104",
    name: "Microsoft Certified: Azure Administrator Associate",
    group: CLOUD,
    img: AZ104,
  },
  {
    title: "AI-900",
    name: "Microsoft Certified: Azure AI Fundamentals",
    group: CLOUD,
    img: AI900,
  },
  {
    title: "AZ-900",
    name: "Microsoft Certified: Azure Fundamentals",
    group: CLOUD,
    img: AZ900,
  },
  {
    title: "SC-900",
    name: "Microsoft Certified: Security, Compliance, and Identity Fundamentals",
    group: CLOUD,
    img: SC900,
  },
  {
    title: "DP-900",
    name: "Microsoft Certified: Azure Data Fundamentals",
    group: CLOUD,
    img: DP900,
  },
  {
    title: "AWS Practitioner",
    name: "AWS Certified Cloud Practitioner",
    group: CLOUD,
    img: AWSPractitioner,
  },
  {
    title: "Terraform Associate (003)",
    name: "HashiCorp Certified: Terraform Associate",
    group: IAC,
    img: Terraform,
  },
];

export { certificationData, certificationGroups };
