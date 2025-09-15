#!/bin/bash

# Umili MVP Deployment Script
# This script helps prepare and deploy the Umili MVP to Vercel

set -e

echo "🚀 Starting Umili MVP Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Run linting
run_linting() {
    print_status "Running linting..."
    npm run lint
    print_success "Linting passed"
}

# Build the application
build_application() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ -f ".env.local" ]; then
        print_success "Environment file found"
    else
        print_warning "No .env.local file found. Make sure to set environment variables in Vercel dashboard."
    fi
}

# Check if git is clean
check_git_status() {
    print_status "Checking git status..."
    
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes. Consider committing them before deployment."
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled"
            exit 1
        fi
    else
        print_success "Git repository is clean"
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod
        print_success "Deployment to Vercel completed"
    else
        print_warning "Vercel CLI not found. Please deploy manually through Vercel dashboard or install Vercel CLI:"
        echo "npm i -g vercel"
        echo "Then run: vercel --prod"
    fi
}

# Main deployment process
main() {
    echo "🎯 Umili MVP Deployment Script"
    echo "================================"
    
    check_dependencies
    install_dependencies
    run_linting
    build_application
    check_env_vars
    check_git_status
    
    echo ""
    print_status "Pre-deployment checks completed successfully!"
    echo ""
    
    read -p "Do you want to deploy to Vercel now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_to_vercel
    else
        print_status "Deployment skipped. You can deploy manually later."
    fi
    
    echo ""
    print_success "Deployment process completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up environment variables in Vercel dashboard"
    echo "2. Run database migrations in Supabase"
    echo "3. Test all functionality"
    echo "4. Update Supabase authentication URLs"
    echo ""
    echo "📚 Documentation:"
    echo "- Deployment Guide: DEPLOYMENT_GUIDE.md"
    echo "- Testing Checklist: TESTING_CHECKLIST.md"
    echo "- Database Schema: supabase-schema.sql"
    echo ""
}

# Run main function
main "$@"
