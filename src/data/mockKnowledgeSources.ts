
export const mockKnowledgeSources = [
  {
    id: 1,
    name: 'Product Documentation',
    type: 'document',
    hasError: false,
    content: `# Product Documentation

## Overview
Our product is a cloud-based solution that helps businesses automate their customer support workflows.

## Features
- AI-powered chatbots
- Knowledge base integration
- Analytics dashboard
- Team collaboration tools

## Technical Specifications
The system is built using React for the frontend and Node.js for the backend with a PostgreSQL database.`
  },
  {
    id: 2,
    name: 'FAQ Database',
    type: 'database',
    hasError: false,
    content: `# Frequently Asked Questions

## General Questions
**Q: How do I reset my password?**
A: You can reset your password by clicking on the "Forgot Password" link on the login page.

**Q: What browsers are supported?**
A: We support the latest versions of Chrome, Firefox, Safari, and Edge.

## Billing Questions
**Q: How do I upgrade my plan?**
A: You can upgrade your plan from the "Billing" section in your account settings.

**Q: Do you offer a free trial?**
A: Yes, we offer a 14-day free trial with no credit card required.`
  },
  {
    id: 3,
    name: 'Company Website',
    type: 'webpage',
    hasError: true,
    content: `# About Our Company

## Our Mission
We strive to make customer support more efficient and personal through AI technology.

## Our Team
Founded in 2020, our team consists of experts in AI, customer support, and software development.

## Contact Information
Email: support@example.com
Phone: (555) 123-4567
Address: 123 AI Street, Tech City, TC 12345`
  }
];
