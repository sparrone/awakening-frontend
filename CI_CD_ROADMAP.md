# CI/CD Implementation Roadmap

## 📋 Overview

This document outlines the complete CI/CD pipeline implementation for the Awakening Forum project, broken down into manageable phases.

**Current Setup:**
- Frontend: React + Vite (hosted on Hosting.com)
- Backend: Spring Boot (to be hosted on Google Cloud Run - cost-optimized)
- Database: SQLite with Cloud Storage backups (ultra-low cost)
- Repository: GitHub with main + dev branches

---

## 🎯 Phase 1: Essential Foundation

### **Priority: CRITICAL - Must complete before production**

#### 1.1 Environment Configuration
- [x] **Frontend Environment Setup**
  - ✅ Create `.env.development` and `.env.production`
  - ✅ Configure dynamic API base URLs  
  - ✅ Set up build-time environment variable injection
  - ✅ Create environment configuration utility with TypeScript support
  - ✅ Update all hardcoded API URLs to use environment variables
  
- [x] **Backend Environment Setup**
  - ✅ Configure `application-dev.yml` and `application-prod.yml`
  - ✅ Set up database connection profiles (PostgreSQL dev/prod)
  - ✅ Configure CORS for production domain
  - ✅ Environment-aware cookie security settings
  
- [x] **Secrets Management**
  - ✅ Set up Google Cloud project and service accounts
  - ✅ Generated service account key for GitHub Secrets
  - ✅ Configured Google Cloud Storage for SQLite backups
  - ✅ Google Cloud project ID and region configured (awakening-prod-sparr, us-central1)
  - 🔄 Next: Add service account key to GitHub Secrets

#### 1.2 Basic Testing Infrastructure
- [ ] **Backend Tests**
  - Unit tests for UserSettingsService
  - Integration tests for critical API endpoints (/auth/login, /forum/categories)
  - Repository tests for database operations
  
- [ ] **Frontend Tests**
  - Component tests for Login and Forum components
  - Utility tests for userSettings helper functions
  - Basic integration tests for authentication flow

#### 1.3 Production Database Setup
- [ ] **Database Selection & Setup**
  - Set up SQLite database for production (ultra-low cost solution)
  - Configure SQLite driver in Spring Boot application
  - Set up automated SQLite backups to Google Cloud Storage
  - Configure connection pooling for SQLite
  
- [ ] **Data Migration Plan**
  - Migrate existing PostgreSQL schema to SQLite
  - Update database migrations to use SQLite-compatible syntax
  - Set up data seeding strategy for SQLite
  - Create backup and restore procedures

#### 1.4 GitHub Actions - Basic Pipeline
- [ ] **Branch Protection**
  - Protect main branch (require PR reviews)
  - Require status checks to pass
  - Disable direct pushes to main
  
- [ ] **CI Workflow** (`.github/workflows/ci.yml`)
  - Run on push to dev and PR to main
  - Backend: Maven test + build
  - Frontend: npm test + build
  - Basic security scanning
  
- [ ] **CD Workflow** (`.github/workflows/deploy.yml`)
  - Deploy backend to Google Cloud Run on main branch merge
  - Deploy frontend to Hosting.com on main branch merge
  - Basic health checks post-deployment
  - Automated SQLite backup to Cloud Storage post-deployment

#### 1.5 Basic Monitoring
- [ ] **Health Endpoints**
  - Backend `/health` endpoint
  - Database connectivity check
  - Frontend build verification
  
- [ ] **Deployment Notifications**
  - GitHub Actions status notifications
  - Basic error alerting

**🎯 Success Criteria for Phase 1:**
- ✅ Can deploy to production without manual configuration changes
- ✅ Automated tests prevent obviously broken code from reaching production
- ✅ Basic monitoring shows if deployment succeeded/failed
- ✅ Secrets are properly managed (no hardcoded credentials)

---

## 🚀 Phase 2: Production Ready

### **Priority: HIGH - Complete within 2-4 weeks of Phase 1**

#### 2.1 Enhanced Testing
- [ ] **Backend Comprehensive Tests**
  - Service layer tests for all business logic
  - Controller tests with MockMVC
  - Database integration tests with test containers
  - Security tests for authentication/authorization
  
- [ ] **Frontend Comprehensive Tests**
  - React Testing Library for all major components
  - User interaction tests (login, posting, settings)
  - API integration tests with MSW (Mock Service Worker)
  - Accessibility tests

#### 2.2 Dev Environment (Cost-Optimized Google Cloud Strategy)
- [ ] **Dev Environment Infrastructure**
  - Set up dev backend on Google Cloud Run (separate service, free tier)
  - Set up dev frontend on Hosting.com subdomain OR Cloud Run static site
  - Configure separate SQLite database for dev environment
  
- [ ] **Dev Environment Deployment Pipeline**
  - Auto-deploy dev branch to Google Cloud Run dev environment
  - Manual promotion from dev environment to production
  - Dev-specific environment variables
  - Automated dev database seeding and reset procedures

#### 2.3 Advanced CI/CD Features
- [ ] **Build Optimizations**
  - Docker containerization for consistent builds
  - Build caching for faster pipelines
  - Parallel job execution
  
- [ ] **Quality Gates**
  - Code coverage requirements (80%+ recommended)
  - Linting and code formatting checks
  - Dependency vulnerability scanning
  - Performance regression tests

#### 2.4 Rollback Strategy
- [ ] **Backend Rollback**
  - SQLite database backup restoration procedures
  - Blue-green deployment preparation on Cloud Run
  - Health check validation before traffic switch
  
- [ ] **Frontend Rollback**
  - Previous build artifact storage
  - Quick rollback via hosting platform
  - CDN cache invalidation strategy

#### 2.5 Enhanced Monitoring
- [ ] **Application Monitoring**
  - Error tracking (Sentry or similar)
  - Performance monitoring (response times, DB queries)
  - User behavior analytics (optional)
  
- [ ] **Infrastructure Monitoring**
  - Uptime monitoring (UptimeRobot or similar)
  - Resource usage tracking
  - Database performance monitoring

**🎯 Success Criteria for Phase 2:**
- ✅ Comprehensive test coverage prevents regressions
- ✅ Staging environment catches issues before production
- ✅ Can quickly rollback problematic deployments
- ✅ Proactive monitoring catches issues before users

---

## 🔬 Phase 3: Advanced & Scale

### **Priority: MEDIUM - Future enhancement when needed**

#### 3.1 Advanced Deployment Strategies
- [ ] **Blue-Green Deployments**
  - Zero-downtime deployments
  - Automated traffic switching
  - Database migration coordination
  
- [ ] **Feature Flags**
  - Gradual feature rollouts
  - A/B testing infrastructure
  - Emergency feature disabling

#### 3.2 Performance & Scale
- [ ] **Performance Testing**
  - Load testing in CI/CD pipeline
  - Performance budgets and regression detection
  - Database performance profiling
  
- [ ] **CDN & Caching**
  - Static asset optimization
  - API response caching strategy
  - Database query optimization

#### 3.3 Security Hardening
- [ ] **Advanced Security**
  - SAST/DAST security scanning
  - Dependency security monitoring
  - Penetration testing integration
  
- [ ] **Compliance & Auditing**
  - Deployment audit logs
  - Change management documentation
  - Compliance reporting (if needed)

#### 3.4 Observability
- [ ] **Advanced Monitoring**
  - Distributed tracing
  - Custom business metrics
  - Predictive alerting
  
- [ ] **Analytics & Insights**
  - Deployment frequency metrics
  - Lead time for changes
  - Mean time to recovery (MTTR)

**🎯 Success Criteria for Phase 3:**
- ✅ Zero-downtime deployments with instant rollback
- ✅ Feature flags enable safe experimentation
- ✅ Performance monitoring prevents user experience degradation
- ✅ Security-first approach with automated vulnerability management

---

## 📊 Implementation Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 | 1-2 weeks | None - start immediately |
| Phase 2 | 2-4 weeks | Complete Phase 1 |
| Phase 3 | 4-8 weeks | Complete Phase 2, evaluate need |

---

## 🚨 Critical Questions to Address

### **Before Starting Phase 1:**
1. **Testing Status**: Do you have any existing tests? If not, this is the highest priority.
2. **Production Database**: What's your plan for the production database? (PostgreSQL on Render recommended)
3. **Domain Strategy**: Will frontend and backend share a domain or be separate?
4. **Email Service**: What email service are you using for user verification/notifications?

### **Before Starting Phase 2:**
1. **Staging Budget**: Are you willing to pay for staging environments?
2. **Monitoring Budget**: Free tier monitoring vs paid solutions?
3. **Team Size**: Will you have others contributing who need access to the pipeline?

### **Before Starting Phase 3:**
1. **Scale Requirements**: What's your expected user growth?
2. **Compliance Needs**: Any regulatory or business compliance requirements?
3. **Performance SLAs**: What are your performance requirements?

---

## 📝 Notes & Decisions Log

**Date: [Current Date]**
- Initial roadmap created
- Decided on main + dev branch strategy
- Chosen Google Cloud Run for backend hosting (cost-optimized)
- Chosen Hosting.com for frontend hosting
- Selected SQLite + Cloud Storage for database (ultra-low cost)

**Date: 2025-08-18**
- ✅ **Decision**: Migrated hosting strategy from Render to Google Cloud for cost optimization
- ✅ **Decision**: Selected SQLite + Cloud Storage for database (keeps existing JPA code, ultra-low cost)
- Estimated monthly costs: $2-8 for low traffic (vs $15+ for managed database)
- Updated deployment targets to Google Cloud Run with cost-conscious configuration

**Date: 2025-08-19**
- ✅ **Completed Google Cloud Infrastructure Setup (Phase 1.1 Secrets Management)**
- Created Google Cloud project: `awakening-prod-sparr`
- Enabled all required APIs (Cloud Run, Build, Storage, Artifact Registry, etc.)
- Created Cloud Storage buckets for SQLite backups and static assets
- Set up Artifact Registry repository for Docker images
- Created CI/CD service account with proper IAM roles
- Generated service account key for GitHub Actions integration
- 🔄 **Next Priority**: Backend containerization and Cloud Run deployment

**Date: 2025-08-11**
- ✅ Completed Frontend Environment Setup (Phase 1.1)
- Created environment configuration utility with TypeScript support
- Updated all hardcoded localhost URLs to use dynamic environment variables
- Configured Vite for environment-specific builds
- Added proper gitignore entries for environment files
- Production API URL set to: `https://awakening-backend-[hash].a.run.app/api` (to be updated when backend is deployed)
- 🆕 **Updated Roadmap**: Migrated from Render to Google Cloud Run for cost optimization
- ✅ **Decision**: Use SQLite + Cloud Storage instead of managed database for ultra-low costs
- ✅ **Decision**: Use Google Cloud Run for both dev and production (consistent platform)
- Updated environment URLs to use proper Cloud Run format (.a.run.app)

---

*This document should be updated as decisions are made and phases are completed. Keep it as the single source of truth for the CI/CD implementation.*