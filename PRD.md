# Product Requirements Document (PRD)
## Norm Fazlası Öğretmen Atama Sistemi

### 1. Project Overview

#### 1.1 Problem Statement
- Manual surplus teacher assignment process is time-consuming and error-prone
- Lack of transparency in assignment procedures
- Difficulty tracking service points and fair ranking criteria
- Physical paperwork and manual application processes

#### 1.2 Solution & Objectives
- Digitize surplus teacher placement process
- Web-based "Surplus Teacher Assignment System"
- Enable online teacher preferences and administrative management
- Provide fair, transparent, and fast assignment process based on merit points

### 2. Target Users & Personas

#### 2.1 Administrator (Admin)
**Persona:** HR Specialist Ayşe Hanım
- **Role:** Data entry for surplus teachers and open positions
- **Responsibilities:** Start/end preference periods, monitor process
- **Needs:** Simple interface for error-free data entry, process monitoring dashboard

#### 2.2 Teacher (End User)
**Persona:** Surplus Math Teacher Mehmet Bey
- **Role:** Make school preferences within designated timeframe
- **Needs:** Easy login system, view personal info/points, list available schools, rank 25 preferences

### 3. Functional Requirements

#### 3.1 Admin Module

**3.1.1 Admin Authentication**
- [ ] Admin login with username/password
- [ ] Secure session management
- [ ] Role-based access control

**3.1.2 Teacher Management**
- [ ] Add new teachers to system
  - Required fields: TC ID, Name, Birth Date, Placement Points, Branch, Current Assignment
- [ ] Edit existing teacher information
- [ ] Delete teacher records
- [ ] List all teachers with search/filter functionality
- [ ] Bulk import teachers (Excel/CSV)

**3.1.3 Open Position Management**
- [ ] Add open positions (School Name, District, Branch Quota)
- [ ] Edit existing positions
- [ ] Delete positions
- [ ] List all open positions
- [ ] Position availability tracking

**3.1.4 Preference Period Management**
- [ ] Set preference start/end dates and times
- [ ] Automatic system lockdown at end time
- [ ] Preference period status dashboard
- [ ] Extension capabilities for admin

**3.1.5 Reporting (Optional for V1)**
- [ ] Export all teacher preferences (Excel/PDF)
- [ ] Generate preference summary reports
- [ ] Track completion rates

#### 3.2 Teacher Module

**3.2.1 User Authentication**
- [ ] Login using TC ID as username
- [ ] Birth date as password (DD.MM.YYYY format)
- [ ] Error messages for invalid login attempts
- [ ] Session timeout management

**3.2.2 "My Information" Page**
- [ ] Display personal information (Name, TC, Points, Branch)
- [ ] Read-only information display
- [ ] Current assignment status
- [ ] Point calculation breakdown

**3.2.3 "My Preferences" Page**
- [ ] List available positions matching teacher's branch
- [ ] Select up to 25 preferences
- [ ] Drag-and-drop preference ranking
- [ ] Up/down arrows for ranking adjustment
- [ ] "Save Preferences" functionality
- [ ] Update preferences until deadline
- [ ] Preference deadline countdown timer
- [ ] Preference validation and error handling

### 4. Technical Requirements

#### 4.1 Technology Stack
**Frontend:**
- [ ] HTML5, CSS3, JavaScript
- [ ] React or Vue.js framework
- [ ] Responsive design for mobile compatibility
- [ ] Modern UI/UX principles

**Backend:**
- [ ] C#/.NET, Python (Django/Flask), PHP (Laravel), or Node.js
- [ ] RESTful API architecture
- [ ] Authentication middleware
- [ ] Data validation layer

**Database:**
- [ ] MySQL, PostgreSQL, or MS SQL Server
- [ ] Proper indexing for performance
- [ ] Data backup and recovery procedures

#### 4.2 Security Requirements
- [ ] HTTPS/SSL encryption for all traffic
- [ ] Password hashing (bcrypt recommended)
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF token implementation
- [ ] Input validation and sanitization
- [ ] Secure session management

#### 4.3 Performance Requirements
- [ ] Page load times under 3 seconds
- [ ] Support for concurrent users (minimum 100)
- [ ] Database query optimization
- [ ] Caching mechanisms
- [ ] Error handling and logging

#### 4.4 Usability Requirements
- [ ] Intuitive user interface
- [ ] Mobile-responsive design
- [ ] Accessibility compliance (WCAG guidelines)
- [ ] Multi-browser compatibility
- [ ] User help documentation

### 5. Data Models

#### 5.1 Core Entities
**Teachers:**
- [ ] TC ID (Primary Key)
- [ ] Name
- [ ] Birth Date
- [ ] Placement Points
- [ ] Branch
- [ ] Current Assignment
- [ ] Created/Updated timestamps

**Positions:**
- [ ] Position ID (Primary Key)
- [ ] School Name
- [ ] District
- [ ] Branch
- [ ] Quota
- [ ] Status (Active/Inactive)

**Preferences:**
- [ ] Preference ID (Primary Key)
- [ ] Teacher TC ID (Foreign Key)
- [ ] Position ID (Foreign Key)
- [ ] Rank (1-25)
- [ ] Created/Updated timestamps

**Admin Users:**
- [ ] Admin ID (Primary Key)
- [ ] Username
- [ ] Password Hash
- [ ] Role
- [ ] Last Login

### 6. User Stories

#### 6.1 Admin Stories
- [ ] As an admin, I want to add teacher data so that they can participate in the assignment process
- [ ] As an admin, I want to manage open positions so that teachers have accurate options
- [ ] As an admin, I want to set preference periods so that the process is controlled and fair
- [ ] As an admin, I want to monitor progress so that I can ensure all teachers participate

#### 6.2 Teacher Stories
- [ ] As a teacher, I want to login easily so that I can access the system quickly
- [ ] As a teacher, I want to view my information so that I can verify my data is correct
- [ ] As a teacher, I want to see available positions so that I can make informed choices
- [ ] As a teacher, I want to rank my preferences so that I can express my priorities
- [ ] As a teacher, I want to update my preferences so that I can change my mind before the deadline

### 7. Out of Scope (V1.0)

#### 7.1 Excluded Features
- [ ] ~~Automatic assignment algorithm~~
- [ ] ~~Email/SMS notifications~~
- [ ] ~~Password reset functionality~~
- [ ] ~~Advanced reporting and statistics~~
- [ ] ~~Multi-language support~~
- [ ] ~~Integration with external HR systems~~

### 8. Success Metrics

#### 8.1 Measurable Goals
- [ ] Reduce manual processing time by 80%
- [ ] Achieve 100% teacher participation rate
- [ ] Minimize support requests during preference period
- [ ] Zero data loss or corruption incidents
- [ ] System uptime of 99.5% during active periods

### 9. Implementation Phases

#### 9.1 Phase 1: Core Development
- [ ] Database design and setup
- [ ] Basic authentication system
- [ ] Admin teacher management
- [ ] Admin position management

#### 9.2 Phase 2: Teacher Interface
- [ ] Teacher login system
- [ ] My Information page
- [ ] My Preferences page
- [ ] Preference ranking functionality

#### 9.3 Phase 3: System Integration
- [ ] Preference period management
- [ ] Data validation and error handling
- [ ] Security implementation
- [ ] Performance optimization

#### 9.4 Phase 4: Testing & Deployment
- [ ] Unit testing
- [ ] Integration testing
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Documentation and training

### 10. Risk Assessment

#### 10.1 Technical Risks
- [ ] Security vulnerabilities due to weak authentication
- [ ] Performance issues with large user loads
- [ ] Data integrity problems
- [ ] Browser compatibility issues

#### 10.2 Mitigation Strategies
- [ ] Implement robust security measures
- [ ] Conduct performance testing
- [ ] Regular data backups
- [ ] Cross-browser testing

### 11. Dependencies

#### 11.1 External Dependencies
- [ ] Hosting infrastructure
- [ ] SSL certificate
- [ ] Database server
- [ ] Development team availability

#### 11.2 Internal Dependencies
- [ ] Teacher data accuracy
- [ ] Position data completeness
- [ ] Admin user training
- [ ] System administrator support