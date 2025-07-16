# DrivePlan 🚛
**Full-Stack Truck Driver Trip Planning & Compliance Application**

---

**🔗 Live Demo:** [driveplan.effectivewebapp.com](https://driveplan.effectivewebapp.com/) | **💻 GitHub:** [github.com/allania7med11/DrivePlan](https://github.com/allania7med11/DrivePlan)

---

## Overview

Web application that automates truck driver trip planning and generates FMCSA-compliant daily log sheets. Takes trip inputs (current location, pickup, dropoff, cycle hours) and produces interactive route visualization with automated compliance documentation.

## Key Features

### 🗺️ **Smart Route Planning**
- Interactive map with real-time route visualization
- Multi-point routing with OpenRouteService API integration
- Automatic fuel stops every 1,000 miles

### 📋 **FMCSA Compliance Engine**
- Automated daily log sheet generation with canvas rendering
- Hours of Service enforcement (11-hour driving, 14-hour duty, 70-hour/8-day cycle)
- Four duty status tracking with 15-minute precision
- Multiple log sheets for longer trips

### ⚖️ **Regulatory Intelligence**
- Real-time duty limit monitoring and violation prevention
- Mandatory 10-hour rest period calculations
- Property-carrying driver regulations (70hrs/8days)

## Technical Stack

### Backend - Django REST API
- Trip calculation engine with regulatory compliance
- OpenRouteService mapping integration
- Address geocoding and route optimization
- Business logic for Hours of Service rules

### Frontend - Next.js 15.3.1
- React 19.0.0 with TypeScript
- Leaflet mapping with interactive visualization
- Konva canvas for precise log sheet rendering
- Tailwind CSS responsive design

### DevOps & Deployment
- **Docker Containerization**: Backend + Nginx reverse proxy
- **Automated Deployment**: Ansible orchestration
- **CI/CD Pipeline**: Vagrant staging → Digital Ocean production
- **Management Commands**: 
  ```bash
  make build-images    # Build & push Docker images
  make up-prod         # Deploy to production
  make up-dev          # Local development environment
  ```

*Check [Automated Deployment with Ansible](https://github.com/allania7med11/deploy) for infrastructure details*

## Domain Expertise

- **Transportation Regulations**: Deep understanding of FMCSA Hours of Service rules
- **Logistics Optimization**: Multi-constraint trip planning algorithms
- **Compliance Automation**: Real-time regulatory enforcement
- **Industry Standards**: ELD-compatible log sheet formatting

## Technical Highlights

- **Complex Business Logic**: Multi-day trip planning with duty limit enforcement
- **Geospatial Processing**: Route calculation, geocoding, distance optimization
- **Canvas Programming**: Dynamic log sheet generation with Konva
- **Enterprise DevOps**: Docker, Ansible, staged deployment pipeline
- **Type Safety**: Full TypeScript implementation with Python type hints

---

**Demonstrates:** Full-stack development, transportation domain expertise, regulatory compliance implementation, and enterprise-grade deployment automation.