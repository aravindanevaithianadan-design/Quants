// ============================================================
// QUANTS - PREMIUM ATS INTELLIGENCE
// JavaScript Functionality
// ============================================================

// Set PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ============================================================
// DOM ELEMENTS
// ============================================================

const resumeText = document.getElementById('resumeText');
const scoreValue = document.getElementById('scoreValue');
const scoreLabel = document.getElementById('scoreLabel');
const scoreTitle = document.getElementById('scoreTitle');
const ringProgress = document.querySelector('.ring-progress');
const analyzeBtn = document.getElementById('analyzeBtn');
const categorySelect = document.getElementById('categorySelect');
const dropZone = document.getElementById('dropZone');
const uploadInput = document.getElementById('uploadInput');
const fileNameDisplay = document.getElementById('fileName');
const suggestionsList = document.getElementById('suggestionsList');
const matchedKeywordsContainer = document.getElementById('matchedKeywords');
const missingKeywordsContainer = document.getElementById('missingKeywords');

// ============================================================
// ATS KEYWORDS DATABASE
// ============================================================

const atsKeywords = {
  frontend: {
    required: [
      'react', 'vue', 'angular', 'javascript', 'typescript', 'html5', 'css3',
      'responsive design', 'redux', 'sass', 'webpack', 'babel', 'es6', 'jsx'
    ],
    nice: [
      'next.js', 'gatsby', 'tailwind', 'bootstrap', 'material-ui', 'jest',
      'enzyme', 'web accessibility', 'wcag', 'progressive web app', 'pwa'
    ],
    avoid: [
      'flash', 'applet', 'outdated', 'deprecated'
    ]
  },
  backend: {
    required: [
      'nodejs', 'express', 'python', 'django', 'java', 'spring', 'api',
      'database', 'sql', 'rest', 'authentication', 'authorization'
    ],
    nice: [
      'microservices', 'graphql', 'postgresql', 'mongodb', 'redis',
      'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd'
    ],
    avoid: []
  },
  fullstack: {
    required: [
      'react', 'nodejs', 'javascript', 'database', 'api', 'html', 'css',
      'responsive', 'express', 'sql', 'rest api', 'mongodb', 'postgresql'
    ],
    nice: [
      'mern', 'mean', 'docker', 'aws', 'git', 'agile', 'scrum',
      'npm', 'webpack', 'testing', 'jest', 'ci/cd'
    ],
    avoid: []
  },
  datascience: {
    required: [
      'python', 'machine learning', 'data analysis', 'sql', 'pandas',
      'numpy', 'scikit-learn', 'statistics', 'data visualization',
      'tableau', 'power bi', 'matplotlib'
    ],
    nice: [
      'tensorflow', 'keras', 'deep learning', 'nlp', 'pytorch',
      'spark', 'hadoop', 'r programming', 'aws', 'gcp', 'azure'
    ],
    avoid: []
  },
  devops: {
    required: [
      'docker', 'kubernetes', 'jenkins', 'ci/cd', 'aws', 'git',
      'linux', 'ansible', 'terraform', 'deployment', 'monitoring',
      'infrastructure as code'
    ],
    nice: [
      'prometheus', 'grafana', 'elk stack', 'gcp', 'azure',
      'helm', 'docker compose', 'automated testing', 'scripting'
    ],
    avoid: []
  },
  pm: {
    required: [
      'product management', 'agile', 'scrum', 'roadmap', 'user research',
      'stakeholder management', 'data driven', 'analytics', 'metrics'
    ],
    nice: [
      'jira', 'confluence', 'a/b testing', 'ux research', 'prototyping',
      'user interviews', 'competitive analysis', 'business strategy'
    ],
    avoid: []
  },
  design: {
    required: [
      'figma', 'ui design', 'ux design', 'user experience', 'wireframing',
      'prototyping', 'design system', 'responsive design', 'mobile design'
    ],
    nice: [
      'adobe xd', 'sketch', 'usability testing', 'user research',
      'interaction design', 'accessibility', 'wcag', 'design thinking'
    ],
    avoid: []
  },
  qa: {
    required: [
      'testing', 'qa', 'test automation', 'selenium', 'bug tracking',
      'manual testing', 'test cases', 'jira', 'quality assurance'
    ],
    nice: [
      'cypress', 'junit', 'api testing', 'performance testing',
      'load testing', 'regression testing', 'test planning'
    ],
    avoid: []
  }
};

// ============================================================
// SCORING METRICS
// ============================================================

const scoringMetrics = {
  keywords: {
    required: 5,
    nice: 2,
    avoid: -10
  },
  format: {
    hasMetrics: 5,
    hasActionVerbs: 5,
    properStructure: 5,
    goodLength: 5
  },
  ats: {
    noSpecialChars: 5,
    properSections: 5,
    bulletPoints: 5
  }
};

// ============================================================
// ACTION VERBS DATABASE
// ============================================================

const actionVerbs = [
  'developed', 'designed', 'implemented', 'managed', 'led', 'created',
  'built', 'achieved', 'improved', 'optimized', 'engineered', 'architected',
  'collaborated', 'coordinated', 'directed', 'executed', 'facilitated',
  'spearheaded', 'accelerated', 'boosted', 'enhanced', 'streamlined',
  'automated', 'established', 'expanded', 'launched', 'pioneered',
  'revamped', 'transformed', 'mentored', 'trained', 'deployed'
];

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  setupScrollAnimations();
});

function initializeEventListeners() {
  analyzeBtn.addEventListener('click', analyzeResume);
  
  dropZone.addEventListener('click', () => uploadInput.click());
  
  ['dragover', 'dragleave', 'drop'].forEach(evt => {
    dropZone.addEventListener(evt, handleDragDropEvents);
  });
  
  dropZone.addEventListener('drop', handleFileDrop);
  
  uploadInput.addEventListener('change', handleFileInput);
  
  resumeText.addEventListener('keyup', handleTextInput);
  
  categorySelect.addEventListener('change', () => {
    if (resumeText.value.trim().length > 50) {
      analyzeResume();
    }
  });

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ============================================================
// DRAG & DROP HANDLING
// ============================================================

function handleDragDropEvents(e) {
  e.preventDefault();
  
  if (e.type === 'dragover') {
    dropZone.classList.add('drag-over');
  } else {
    dropZone.classList.remove('drag-over');
  }
}

function handleFileDrop(e) {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
}

function handleFileInput(e) {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
}

function handleTextInput(e) {
  const value = e.target.value.trim();
  if (value.length > 50) {
    analyzeBtn.style.opacity = '1';
    analyzeBtn.style.pointerEvents = 'auto';
  } else {
    analyzeBtn.style.opacity = '0.5';
    analyzeBtn.style.pointerEvents = 'none';
  }
}

// ============================================================
// FILE HANDLING
// ============================================================

async function handleFile(file) {
  // Validate file
  if (!file) return;
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    showToast('File size exceeds 5MB limit', 'error');
    return;
  }

  fileNameDisplay.textContent = `📄 ${file.name}`;
  
  try {
    if (file.type === 'application/pdf') {
      await extractPDFText(file);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      extractTextFile(file);
    } else {
      showToast('Please upload a PDF or TXT file', 'error');
    }
  } catch (error) {
    showToast('Error processing file. Please try again.', 'error');
    console.error('File handling error:', error);
  }
}

function extractTextFile(file) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    resumeText.value = e.target.result;
    analyzeResume();
  };
  
  reader.onerror = () => {
    showToast('Error reading file', 'error');
  };
  
  reader.readAsText(file);
}

async function extractPDFText(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }

    resumeText.value = fullText.trim();
    analyzeResume();
  } catch (error) {
    showToast('Error reading PDF. Please check the file format.', 'error');
    console.error('PDF extraction error:', error);
  }
}

// ============================================================
// ANALYSIS ENGINE
// ============================================================

function analyzeResume() {
  const text = resumeText.value.trim();
  
  if (!text || text.length < 50) {
    showToast('Please enter or upload resume content (minimum 50 characters)', 'warning');
    return;
  }

  const category = categorySelect.value;
  const keywords = atsKeywords[category];
  
  // Start scoring
  let score = 25; // Base score
  let results = {
    foundKeywords: [],
    missingKeywords: [],
    keywordScore: 0,
    formatScore: 0,
    atsScore: 0,
    totalScore: 0
  };

  // Analyze keywords
  results = analyzeKeywords(text, keywords, results);
  
  // Analyze format
  results = analyzeFormat(text, results);
  
  // Analyze ATS compliance
  results = analyzeATSCompliance(text, results);
  
  // Calculate final score
  score += results.keywordScore + results.formatScore + results.atsScore;
  score = Math.min(Math.max(score, 0), 100);
  
  // Update UI
  updateScoreDisplay(score, category, results);
  updateSuggestions(score, results);
  updateKeywordDisplay(results);
  
  showToast(`Analysis complete! Score: ${score}/100`);
}

function analyzeKeywords(text, keywords, results) {
  const lowerText = text.toLowerCase();
  
  // Check required keywords
  keywords.required.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      results.foundKeywords.push(keyword);
      results.keywordScore += scoringMetrics.keywords.required;
    } else {
      results.missingKeywords.push(keyword);
    }
  });

  // Check nice-to-have keywords
  keywords.nice.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      results.foundKeywords.push(keyword);
      results.keywordScore += scoringMetrics.keywords.nice;
    }
  });

  // Check avoid keywords
  keywords.avoid.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      results.keywordScore += scoringMetrics.keywords.avoid;
    }
  });

  return results;
}

function analyzeFormat(text, results) {
  // Check for action verbs
  const actionVerbCount = actionVerbs.filter(verb => 
    text.toLowerCase().includes(verb)
  ).length;
  
  if (actionVerbCount >= 5) {
    results.formatScore += scoringMetrics.format.hasActionVerbs;
  }

  // Check for metrics (percentages, currency, numbers)
  const metricsRegex = /\d{1,3}%|\$\d+[kmb]?|increased|improved|reduced|saved|achieved/gi;
  const metrics = text.match(metricsRegex);
  
  if (metrics && metrics.length >= 3) {
    results.formatScore += scoringMetrics.format.hasMetrics;
  }

  // Check for proper length (300-1200 words)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 1200) {
    results.formatScore += scoringMetrics.format.goodLength;
  }

  // Check for proper structure
  const hasExperience = text.toLowerCase().includes('experience');
  const hasEducation = text.toLowerCase().includes('education');
  const hasSkills = text.toLowerCase().includes('skill');
  
  if (hasExperience && hasEducation && hasSkills) {
    results.formatScore += scoringMetrics.format.properStructure;
  }

  return results;
}

function analyzeATSCompliance(text, results) {
  // Check for special characters (ATS hostile)
  const specialChars = /[©®™℠]/g;
  if (!specialChars.test(text)) {
    results.atsScore += scoringMetrics.ats.noSpecialChars;
  }

  // Check for bullet points
  const bulletPoints = /^[\s]*[-•*]/m;
  if (bulletPoints.test(text)) {
    results.atsScore += scoringMetrics.ats.bulletPoints;
  }

  // Check for clear sections
  const sectionHeaders = ['summary', 'objective', 'skills', 'experience', 'education', 'certification'];
  const foundSections = sectionHeaders.filter(header => 
    text.toLowerCase().includes(header)
  ).length;
  
  if (foundSections >= 3) {
    results.atsScore += scoringMetrics.ats.properSections;
  }

  return results;
}

// ============================================================
// UI UPDATE FUNCTIONS
// ============================================================

function updateScoreDisplay(score, category, results) {
  // Animate ring
  scoreValue.textContent = score;
  setRingProgress(score);

  // Update title and label
  const statusInfo = getScoreStatus(score, category);
  scoreTitle.textContent = statusInfo.title;
  scoreLabel.textContent = statusInfo.label;
}

function setRingProgress(score) {
  const circumference = 326.725;
  const offset = circumference - (score / 100) * circumference;
  ringProgress.style.strokeDashoffset = offset;
}

function getScoreStatus(score, category) {
  let title = '';
  let label = '';

  if (score < 30) {
    title = '⚠️ Needs Significant Improvement';
    label = `Your resume may have ATS compatibility issues. Focus on keyword optimization. Score: ${score}/100`;
  } else if (score < 50) {
    title = '📈 Below Average';
    label = `Good foundation, but significant improvements needed. Score: ${score}/100`;
  } else if (score < 70) {
    title = '✅ Good Match';
    label = `Your resume aligns well with ${category} requirements. Score: ${score}/100`;
  } else if (score < 85) {
    title = '🎯 Excellent Match';
    label = `Strong alignment with ${category} position requirements! Score: ${score}/100`;
  } else {
    title = '⭐ Outstanding';
    label = `Exceptional resume optimization for ${category} roles! Score: ${score}/100`;
  }

  return { title, label };
}

function updateSuggestions(score, results) {
  suggestionsList.innerHTML = '';

  const suggestions = [];

  // Generate suggestions based on score
  if (score < 50) {
    suggestions.push({
      icon: '⚡',
      text: `Add more industry-specific keywords related to ${categorySelect.options[categorySelect.selectedIndex].text}`
    });
  }

  if (results.missingKeywords.length > 0) {
    const topMissing = results.missingKeywords.slice(0, 3).join(', ');
    suggestions.push({
      icon: '🔍',
      text: `Consider adding these keywords: ${topMissing}`
    });
  }

  // Check for action verbs
  const actionVerbCount = actionVerbs.filter(verb => 
    resumeText.value.toLowerCase().includes(verb)
  ).length;

  if (actionVerbCount < 5) {
    suggestions.push({
      icon: '💪',
      text: 'Use more action verbs to start bullet points (Developed, Implemented, Led, etc.)'
    });
  }

  // Check for metrics
  const metricsRegex = /\d{1,3}%|\$\d+[kmb]?/g;
  const metrics = resumeText.value.match(metricsRegex) || [];

  if (metrics.length < 3) {
    suggestions.push({
      icon: '📊',
      text: 'Add quantifiable metrics and achievements (percentages, revenue impact, etc.)'
    });
  }

  // Additional tips
  if (score >= 50) {
    suggestions.push({
      icon: '✨',
      text: 'Keep your formatting clean and simple - avoid graphics and special characters'
    });
  }

  suggestions.push({
    icon: '📋',
    text: 'Ensure clear section headers: Summary, Skills, Experience, Education'
  });

  // Render suggestions
  suggestions.forEach(suggestion => {
    const li = document.createElement('li');
    li.className = 'suggestion-item';
    li.innerHTML = `
      <span class="suggestion-icon">${suggestion.icon}</span>
      <span>${suggestion.text}</span>
    `;
    suggestionsList.appendChild(li);
  });
}

function updateKeywordDisplay(results) {
  // Update matched keywords
  matchedKeywordsContainer.innerHTML = '';
  if (results.foundKeywords.length > 0) {
    results.foundKeywords.slice(0, 8).forEach(keyword => {
      const badge = document.createElement('span');
      badge.className = 'keyword-badge';
      badge.textContent = keyword;
      matchedKeywordsContainer.appendChild(badge);
    });
    
    if (results.foundKeywords.length > 8) {
      const more = document.createElement('span');
      more.className = 'keyword-badge';
      more.textContent = `+${results.foundKeywords.length - 8} more`;
      matchedKeywordsContainer.appendChild(more);
    }
  } else {
    matchedKeywordsContainer.innerHTML = '<span class="keyword-badge">None found</span>';
  }

  // Update missing keywords
  missingKeywordsContainer.innerHTML = '';
  if (results.missingKeywords.length > 0) {
    results.missingKeywords.slice(0, 8).forEach(keyword => {
      const badge = document.createElement('span');
      badge.className = 'keyword-badge warning';
      badge.textContent = keyword;
      missingKeywordsContainer.appendChild(badge);
    });
    
    if (results.missingKeywords.length > 8) {
      const more = document.createElement('span');
      more.className = 'keyword-badge warning';
      more.textContent = `+${results.missingKeywords.length - 8} more`;
      missingKeywordsContainer.appendChild(more);
    }
  } else {
    missingKeywordsContainer.innerHTML = '<span class="keyword-badge">All keywords found!</span>';
  }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  } else if (type === 'warning') {
    toast.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
  }
  
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    toast.style.transition = 'all 0.3s ease-out';
    
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================

function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe feature cards, step cards, etc
  document.querySelectorAll('.feature-card, .step-card, .card').forEach(el => {
    observer.observe(el);
  });
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function smoothScroll(target) {
  const element = document.querySelector(target);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// ============================================================
// PERFORMANCE OPTIMIZATION
// ============================================================

// Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Log app initialization
console.log('%cQuants - Premium ATS Intelligence', 'font-size: 18px; font-weight: bold; color: #6366f1;');
console.log('%cAI-powered resume optimization tool', 'font-size: 12px; color: #64748b;');
