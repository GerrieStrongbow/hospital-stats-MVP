# Hospital Stats MVP - Developer Guide

## Overview

This guide provides comprehensive information for developers working on the Hospital Stats MVP project. It covers setup, architecture, development workflow, and contribution guidelines.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Development Setup

### Prerequisites

**Required Software:**
- **Web Browser**: Modern browser with developer tools (Chrome, Firefox, Safari)
- **Text Editor**: VS Code, Sublime Text, or similar
- **Git**: For version control
- **Node.js**: Optional, for development tools (if using build processes)

**Accounts Needed:**
- **Supabase Account**: For database access
- **GitHub Account**: For version control (if applicable)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd hospital-stats-MVP
```

#### 2. Environment Configuration

**Copy Configuration Files:**
```bash
# Copy environment template
cp .env.example .env

# Copy config template  
cp config.example.js config.js
```

**Edit `.env` file:**
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Edit `config.js` file:**
```javascript
window.APP_CONFIG = {
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    APP_ENV: 'development',
    ENABLE_LOGGING: true
};
```

#### 3. Database Setup

**Run Database Setup Script:**
1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and execute the contents of `database_setup.sql`
4. Verify tables are created successfully

#### 4. Local Server Setup

**Option A: Simple HTTP Server (Python)**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option B: Node.js HTTP Server**
```bash
npx http-server -p 8000
```

**Option C: VS Code Live Server Extension**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

#### 5. Verify Setup

1. Navigate to `http://localhost:8000`
2. Verify the application loads without errors
3. Check browser console for any JavaScript errors
4. Test user registration and login functionality

---

## Project Architecture

### Directory Structure

```
hospital-stats-MVP/
├── index.html              # Main entry point
├── config.js               # Runtime configuration
├── build-config.js         # Build and logging configuration
├── database_setup.sql      # Database initialization
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
│
├── css/                   # Stylesheets
│   ├── main.css          # Main stylesheet import
│   ├── base/             # Base styles
│   │   ├── reset.css     # CSS reset
│   │   ├── global.css    # Global styles
│   │   ├── typography.css # Font and text styles
│   │   └── variables.css  # CSS custom properties
│   ├── components/       # Component-specific styles
│   │   ├── buttons.css   # Button styles
│   │   ├── forms.css     # Form styles
│   │   ├── cards.css     # Card component styles
│   │   └── lists.css     # List styles
│   ├── layout/           # Layout styles
│   │   ├── header.css    # Header layout
│   │   └── main.css      # Main content layout
│   └── pages/            # Page-specific styles
│       ├── dashboard.css # Dashboard page
│       └── form.css      # Form pages
│
├── js/                   # JavaScript modules
│   ├── core/             # Core system modules
│   │   ├── state.js      # State management
│   │   ├── config.js     # Configuration module
│   │   ├── error-handler.js # Error handling
│   │   └── form-handlers.js # Form utilities
│   ├── ui/               # User interface modules
│   │   ├── router.js     # Client-side routing
│   │   ├── views.js      # View rendering
│   │   └── components.js # UI components
│   ├── auth/             # Authentication modules
│   │   ├── auth.js       # Auth core functionality
│   │   ├── login.js      # Login handling
│   │   └── register.js   # Registration handling
│   ├── patient/          # Patient management modules
│   │   ├── patient-crud.js # CRUD operations
│   │   ├── patient-list.js # List management
│   │   └── patient-form.js # Form handling
│   ├── sync/             # Data synchronization
│   │   ├── storage.js    # Storage utilities
│   │   └── sync.js       # Sync operations
│   └── utils/            # Utility modules
│       ├── constants.js  # Application constants
│       ├── helpers.js    # Helper functions
│       ├── security.js   # Security utilities
│       └── validation.js # Validation functions
│
├── docs/                 # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── USER_GUIDE.md
│   ├── DATABASE_SCHEMA.md
│   └── DEVELOPER_GUIDE.md
│
├── tests/                # Test files
│   └── *.html           # Manual test pages
│
└── resourcess/           # Project resources
    ├── REQUIREMENTS.md   # Project requirements
    └── CWD_Therapists_2025.md # Data specifications
```

### Architecture Patterns

#### 1. Module Pattern (IIFE)

All JavaScript modules use the Immediately Invoked Function Expression pattern:

```javascript
// Module template
(function(window) {
    'use strict';
    
    const ModuleName = {
        // Module implementation
        init() {
            console.log('Module initialized');
        }
    };
    
    // Export to global scope
    window.ModuleName = ModuleName;
    
    // Auto-initialize if needed
    ModuleName.init();
    
})(window);
```

#### 2. State Management

Centralized state management using the State module:

```javascript
// Set state
State.set('user', userObject);
State.set('currentView', 'dashboard');

// Get state  
const user = State.get('user');
const view = State.get('currentView');

// Remove state
State.remove('tempData');
```

#### 3. Event-Driven Architecture

Custom events for module communication:

```javascript
// Dispatch event
document.dispatchEvent(new CustomEvent('patientSaved', {
    detail: { patientId: 'ABC123' }
}));

// Listen for event
document.addEventListener('patientSaved', (e) => {
    console.log('Patient saved:', e.detail.patientId);
});
```

#### 4. Router Pattern

Client-side routing for Single Page Application behavior:

```javascript
// Navigate programmatically
Router.navigate('patients');
Router.navigate('patient', { id: 'ABC123', source: 'supabase' });

// Listen for route changes
document.addEventListener('routeChange', (e) => {
    console.log('New view:', e.detail.view);
});
```

---

## Development Workflow

### Development Process

#### 1. Feature Development

**Start New Feature:**
```bash
# Create feature branch (if using Git)
git checkout -b feature/patient-search-improvements

# Make changes
# Test changes
# Commit changes

git add .
git commit -m "Add patient search improvements

- Added real-time search filtering
- Improved search performance
- Added search result highlighting"
```

**Development Checklist:**
- [ ] Code follows project conventions
- [ ] Functions are properly documented
- [ ] Error handling is implemented
- [ ] Browser console shows no errors
- [ ] Manual testing completed
- [ ] Code is responsive on mobile devices

#### 2. Testing Process

**Manual Testing Steps:**
1. **Functionality Testing**
   - Test all new features
   - Verify existing features still work
   - Test error conditions

2. **Cross-Browser Testing**
   - Test in Chrome, Firefox, Safari
   - Verify mobile responsiveness
   - Check for console errors

3. **Offline Testing**
   - Disconnect internet
   - Test offline functionality
   - Verify data persistence
   - Test sync when reconnected

#### 3. Code Review Process

**Self-Review Checklist:**
- [ ] Code is clean and readable
- [ ] No hardcoded values (use constants)
- [ ] Error handling is comprehensive  
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Documentation is updated

### Git Workflow

#### Branch Strategy

**Main Branches:**
- `main`: Production-ready code
- `develop`: Integration branch for features

**Feature Branches:**
- `feature/feature-name`: New features
- `bugfix/bug-description`: Bug fixes
- `hotfix/critical-fix`: Critical production fixes

#### Commit Message Format

```
Type: Brief description (50 chars max)

Detailed explanation of what was changed and why.
- Use bullet points for multiple changes
- Reference issue numbers if applicable
- Explain any breaking changes

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

---

## Code Standards

### JavaScript Standards

#### 1. Code Style

**Variable Declaration:**
```javascript
// Use const for values that don't change
const API_URL = 'https://api.example.com';
const userPreferences = { theme: 'light' };

// Use let for values that change
let currentUser = null;
let isLoading = false;

// Avoid var
// var isOldStyle = true; // ❌ Don't use
```

**Function Definitions:**
```javascript
// Use descriptive function names
function validatePatientData(patientRecord) {
    // Implementation
}

// Use arrow functions for short utilities
const formatDate = (date) => date.toISOString().split('T')[0];

// Use function expressions for module methods
const PatientModule = {
    savePatient() {
        // Implementation
    }
};
```

**Error Handling:**
```javascript
// Always use try-catch for async operations
async function savePatientRecord(record) {
    try {
        const result = await PatientAPI.save(record);
        return { success: true, data: result };
    } catch (error) {
        console.error('Save failed:', error);
        ErrorHandler.handleError({
            type: 'DATABASE_ERROR',
            message: error.message,
            context: { operation: 'save_patient' }
        });
        return { success: false, error: error.message };
    }
}
```

#### 2. Documentation Standards

**Function Documentation (JSDoc):**
```javascript
/**
 * Validates patient record data
 * @param {Object} record - Patient record object
 * @param {string} record.patient_identifier - Unique patient ID
 * @param {string} record.age_group - Age group ('<18' or '>18')
 * @returns {Object} Validation result with isValid boolean and errors array
 * @example
 * const result = validatePatientRecord({
 *     patient_identifier: 'ABC123',
 *     age_group: '<18'
 * });
 */
function validatePatientRecord(record) {
    const errors = [];
    
    if (!record.patient_identifier) {
        errors.push('Patient ID is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}
```

**Module Documentation:**
```javascript
/**
 * Patient CRUD Module
 * Handles Create, Read, Update, Delete operations for patient records
 * Supports both online (Supabase) and offline (localStorage) storage
 */
(function(window) {
    'use strict';
    
    const PatientCRUD = {
        // Module implementation
    };
    
    window.PatientCRUD = PatientCRUD;
})(window);
```

### CSS Standards

#### 1. CSS Organization

**Use BEM Methodology:**
```css
/* Block */
.patient-card {
    padding: 1rem;
    border: 1px solid var(--border-color);
}

/* Element */
.patient-card__header {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

/* Modifier */
.patient-card--highlighted {
    border-color: var(--primary-color);
    background-color: var(--primary-light);
}
```

**Use CSS Custom Properties:**
```css
:root {
    /* Colors */
    --primary-color: #1976d2;
    --secondary-color: #424242;
    --success-color: #4caf50;
    --error-color: #f44336;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 2rem;
    
    /* Typography */
    --font-family-primary: 'Roboto', sans-serif;
    --font-size-base: 1rem;
    --line-height-base: 1.5;
}
```

#### 2. Responsive Design

**Mobile-First Approach:**
```css
/* Base styles (mobile) */
.container {
    padding: var(--spacing-sm);
}

/* Tablet and up */
@media (min-width: 768px) {
    .container {
        padding: var(--spacing-md);
        max-width: 768px;
        margin: 0 auto;
    }
}

/* Desktop and up */
@media (min-width: 1024px) {
    .container {
        max-width: 1024px;
        padding: var(--spacing-lg);
    }
}
```

### HTML Standards

#### 1. Semantic HTML

```html
<!-- Use semantic elements -->
<main id="app" role="main">
    <header class="app-header">
        <h1>Hospital Stats MVP</h1>
        <nav class="main-nav" role="navigation">
            <!-- Navigation items -->
        </nav>
    </header>
    
    <section class="content" role="main">
        <!-- Main content -->
    </section>
    
    <footer class="app-footer">
        <!-- Footer content -->
    </footer>
</main>
```

#### 2. Accessibility

```html
<!-- Use proper labels and ARIA attributes -->
<form id="patient-form" role="form">
    <div class="form-group">
        <label for="patient-id" class="form-label">
            Patient ID <span class="required" aria-label="Required">*</span>
        </label>
        <input 
            type="text" 
            id="patient-id" 
            name="patient_identifier"
            class="form-input"
            required
            aria-describedby="patient-id-help"
            autocomplete="off"
        >
        <small id="patient-id-help" class="form-help">
            Use letters, numbers, hyphens, and underscores only
        </small>
    </div>
</form>
```

---

## Testing Guidelines

### Manual Testing

#### 1. Functional Testing

**Core Features Test Checklist:**

**Authentication:**
- [ ] User can register with valid @westerncape.gov.za email
- [ ] Registration validates all required fields
- [ ] User can login with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] User can logout successfully

**Patient Records:**
- [ ] User can create new patient records
- [ ] All form validations work correctly
- [ ] User can view list of patient records
- [ ] User can search/filter patient records
- [ ] User can edit existing patient records
- [ ] User can delete patient records (with confirmation)

**Offline Functionality:**
- [ ] App works when offline
- [ ] Data persists when offline
- [ ] Records sync when back online
- [ ] No data loss during sync

#### 2. Browser Testing

**Test Matrix:**

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Login/Registration | ✅ | ✅ | ✅ | ✅ |
| Patient CRUD | ✅ | ✅ | ✅ | ✅ |
| Offline Mode | ✅ | ✅ | ✅ | ✅ |
| Mobile Responsive | ✅ | ✅ | ✅ | ✅ |

#### 3. Mobile Testing

**Device Testing:**
- **iPhone**: Safari, Chrome
- **Android**: Chrome, Samsung Internet
- **Tablet**: iPad Safari, Android Chrome

**Mobile-Specific Tests:**
- [ ] Touch interactions work properly
- [ ] Form inputs are accessible
- [ ] Keyboard navigation works
- [ ] Zoom functionality works
- [ ] Orientation changes handled correctly

### Automated Testing

#### 1. Test File Structure

```javascript
// test_patient_crud.html example
<!DOCTYPE html>
<html>
<head>
    <title>Patient CRUD Tests</title>
</head>
<body>
    <!-- Test UI -->
    <div id="test-results"></div>
    
    <!-- Load dependencies -->
    <script src="../js/core/state.js"></script>
    <script src="../js/patient/patient-crud.js"></script>
    
    <script>
    // Test functions
    async function testPatientValidation() {
        console.log('Testing patient validation...');
        
        const testData = {
            patient_identifier: '', // Invalid: empty
            age_group: '<18'
        };
        
        const result = PatientCRUD.validateFormData(testData);
        
        if (!result.isValid && result.errors.includes('Patient ID is required')) {
            console.log('✅ Validation test passed');
            return true;
        } else {
            console.log('❌ Validation test failed');
            return false;
        }
    }
    
    // Run tests
    async function runTests() {
        const tests = [
            testPatientValidation,
            // Add more tests
        ];
        
        for (const test of tests) {
            await test();
        }
    }
    
    // Auto-run tests
    runTests();
    </script>
</body>
</html>
```

#### 2. Testing Best Practices

**Test Organization:**
- One test file per module
- Clear test function names
- Comprehensive test coverage
- Automatic pass/fail reporting

**Test Data:**
- Use realistic test data
- Test edge cases and error conditions
- Clean up test data after tests

---

## Deployment Process

### Production Deployment

#### 1. Pre-Deployment Checklist

**Code Quality:**
- [ ] All tests pass
- [ ] No console errors in production mode
- [ ] Code is minified/optimized (if applicable)
- [ ] Environment variables are set correctly
- [ ] Database migrations are ready

**Security:**
- [ ] No hardcoded API keys in source
- [ ] HTTPS is configured
- [ ] CSP headers are set (if applicable)
- [ ] RLS policies are active

**Performance:**
- [ ] Images are optimized
- [ ] CSS/JS is minified
- [ ] Caching headers are set
- [ ] Performance tested on slow connections

#### 2. Deployment Steps

**Environment Setup:**
1. Set production environment variables
2. Configure production database
3. Set up SSL certificates
4. Configure web server

**Code Deployment:**
1. Build production assets (if applicable)
2. Upload files to server
3. Update configuration files
4. Run database migrations
5. Test deployment

**Post-Deployment:**
1. Verify all functionality works
2. Check error logs
3. Monitor performance
4. Test from different devices/networks

### Hosting Options

#### 1. Static Site Hosting

**Recommended Platforms:**
- **Netlify**: Easy deployment, automatic HTTPS
- **Vercel**: Good performance, Git integration
- **GitHub Pages**: Free for public repositories
- **Cloudflare Pages**: Fast global CDN

**Deployment Process:**
```bash
# Build assets (if needed)
npm run build

# Deploy to hosting platform
# (Usually automatic via Git integration)
```

#### 2. Traditional Web Hosting

**Setup Requirements:**
- Web server (Apache, Nginx)
- HTTPS certificate
- Domain name
- File upload access

**Configuration:**
```nginx
# Nginx configuration example
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/hospital-stats-mvp;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

---

## Troubleshooting

### Common Development Issues

#### 1. Module Loading Issues

**Problem**: "Module not found" or "undefined" errors

**Solutions:**
- Check script loading order in `index.html`
- Verify module names and exports
- Check for circular dependencies
- Ensure all dependencies are loaded

#### 2. Database Connection Issues

**Problem**: Cannot connect to Supabase

**Solutions:**
- Verify Supabase URL and API key
- Check network connectivity
- Verify RLS policies are correct
- Check browser console for detailed errors

#### 3. Offline Functionality Issues

**Problem**: Data not persisting offline

**Solutions:**
- Check localStorage availability
- Verify storage key consistency
- Check for quota exceeded errors
- Test in private/incognito mode

#### 4. Mobile Responsiveness Issues

**Problem**: App doesn't work well on mobile

**Solutions:**
- Check viewport meta tag
- Test CSS media queries
- Verify touch event handling
- Test on actual devices

### Debug Tools and Techniques

#### 1. Browser Developer Tools

**Console Debugging:**
```javascript
// Use structured logging
console.group('Patient Save Operation');
console.log('Patient data:', patientData);
console.log('Validation result:', validationResult);
console.groupEnd();

// Use console.table for objects
console.table(patientRecords);

// Use debugger statements
function savePatient(data) {
    debugger; // Execution will pause here
    // Rest of function
}
```

**Network Debugging:**
- Check Network tab for failed requests
- Verify request/response data
- Check for CORS errors
- Monitor WebSocket connections (if applicable)

#### 2. Application Debugging

**State Inspection:**
```javascript
// Add to browser console
console.log('Current state:', window.State.getAll());
console.log('Current user:', window.State.get('user'));
console.log('Patient records:', window.State.get('patientRecords'));
```

**Module Testing:**
```javascript
// Test module functions directly
const testData = { patient_identifier: 'TEST123' };
const result = window.PatientCRUD.validateFormData(testData);
console.log('Validation result:', result);
```

---

## Contributing

### Contribution Process

#### 1. Getting Started

**First-Time Contributors:**
1. Read this developer guide thoroughly
2. Set up development environment
3. Run existing tests to ensure setup works
4. Look for "good first issue" labels (if using GitHub)

#### 2. Making Contributions

**Before Starting:**
- Discuss major changes in issues/discussions
- Check if someone else is working on the same feature
- Understand the existing code architecture

**Development Process:**
1. Create feature branch
2. Write code following project standards
3. Test changes thoroughly
4. Update documentation as needed
5. Submit pull request

#### 3. Pull Request Guidelines

**PR Title Format:**
```
Type(scope): Brief description

feat(patient): Add patient search filtering
fix(auth): Resolve login session timeout
docs(api): Update authentication documentation
```

**PR Description Template:**
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Cross-browser testing completed
- [ ] Mobile testing completed
- [ ] All existing functionality verified

## Screenshots (if applicable)
Add screenshots to show visual changes.

## Additional Notes
Any additional context or notes for reviewers.
```

### Code Review Process

#### 1. Review Checklist

**Functionality:**
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is comprehensive
- [ ] No performance regressions

**Code Quality:**
- [ ] Code follows project standards
- [ ] Functions are well-documented
- [ ] No code duplication
- [ ] Security best practices followed

**Testing:**
- [ ] Changes are adequately tested
- [ ] Existing tests still pass
- [ ] New tests added for new functionality

#### 2. Review Guidelines

**For Authors:**
- Keep PRs focused and small
- Provide clear descriptions
- Respond to feedback promptly
- Test changes thoroughly before submission

**For Reviewers:**
- Be constructive and specific
- Suggest improvements, don't just point out problems
- Test the changes locally when possible
- Focus on correctness, maintainability, and performance

### Community Guidelines

#### 1. Communication

**Be Respectful:**
- Use inclusive language
- Be patient with new contributors
- Focus on the code, not the person
- Assume good intentions

**Be Helpful:**
- Provide clear, actionable feedback
- Share knowledge and resources
- Help troubleshoot issues
- Welcome questions from newcomers

#### 2. Issue Reporting

**Bug Reports Should Include:**
- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Browser and device information
- Screenshots or videos (if applicable)

**Feature Requests Should Include:**
- Clear use case description
- Proposed solution or behavior
- Consider impact on existing users
- Wireframes or mockups (if applicable)

---

This developer guide provides comprehensive information for contributing to the Hospital Stats MVP project. For additional questions or clarifications, please refer to the project documentation or reach out to the development team.