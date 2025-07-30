#!/bin/bash

# Railway Deployment Script for Product Inventory API
# This script automates the deployment process to Railway
#
# Usage: ./scripts/deploy.sh
# Prerequisites: Railway CLI installed and authenticated
#
# @author Product Inventory API Team
# @created 2024-01-XX

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Railway CLI is installed
    if ! command_exists railway; then
        print_error "Railway CLI is not installed. Please install it first:"
        echo "npm install -g @railway/cli"
        exit 1
    fi
    
    # Check if user is logged in to Railway
    if ! railway whoami >/dev/null 2>&1; then
        print_error "Not logged in to Railway. Please run: railway login"
        exit 1
    fi
    
    # Check if Git is available
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    # Check if Node.js is available
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Function to check if all required files exist
check_required_files() {
    print_status "Checking required files..."
    
    local required_files=(
        "package.json"
        "server.js"
        "railway.json"
        "Procfile"
        ".nixpacks"
        ".gitignore"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    print_success "All required files are present!"
}

# Function to run tests locally
run_local_tests() {
    print_status "Running local tests..."
    
    if command_exists npm; then
        if npm test; then
            print_success "Local tests passed!"
        else
            print_warning "Local tests failed, but continuing with deployment..."
        fi
    else
        print_warning "npm not found, skipping local tests..."
    fi
}

# Function to check Git status
check_git_status() {
    print_status "Checking Git status..."
    
    # Check if we're in a Git repository
    if [ ! -d ".git" ]; then
        print_error "Not in a Git repository. Please initialize Git first."
        exit 1
    fi
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "There are uncommitted changes in your repository."
        echo "Current changes:"
        git status --short
        
        read -p "Do you want to commit these changes before deploying? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Auto-commit before Railway deployment"
            print_success "Changes committed!"
        else
            print_warning "Deploying with uncommitted changes..."
        fi
    else
        print_success "No uncommitted changes found!"
    fi
}

# Function to deploy to Railway
deploy_to_railway() {
    print_status "Deploying to Railway..."
    
    # Check if project is already linked
    if railway status >/dev/null 2>&1; then
        print_status "Project is already linked to Railway. Deploying..."
        if railway up; then
            print_success "Deployment successful!"
        else
            print_error "Deployment failed!"
            exit 1
        fi
    else
        print_status "Linking project to Railway..."
        if railway link; then
            print_status "Deploying to Railway..."
            if railway up; then
                print_success "Deployment successful!"
            else
                print_error "Deployment failed!"
                exit 1
            fi
        else
            print_error "Failed to link project to Railway!"
            exit 1
        fi
    fi
}

# Function to get deployment URL
get_deployment_url() {
    print_status "Getting deployment URL..."
    
    local url=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$url" ]; then
        print_success "Deployment URL: $url"
        echo "$url" > .railway-url
        print_status "URL saved to .railway-url"
    else
        print_warning "Could not retrieve deployment URL automatically."
        print_status "Please check your Railway dashboard for the URL."
    fi
}

# Function to run post-deployment tests
run_post_deployment_tests() {
    local url=$(cat .railway-url 2>/dev/null || echo "")
    
    if [ -n "$url" ]; then
        print_status "Running post-deployment tests..."
        
        if command_exists node; then
            if [ -f "scripts/test-deployment.js" ]; then
                if node scripts/test-deployment.js "$url"; then
                    print_success "Post-deployment tests passed!"
                else
                    print_warning "Post-deployment tests failed. Please check manually."
                fi
            else
                print_warning "Deployment test script not found. Skipping tests."
            fi
        else
            print_warning "Node.js not found. Skipping post-deployment tests."
        fi
    else
        print_warning "No deployment URL found. Skipping post-deployment tests."
    fi
}

# Function to show deployment summary
show_deployment_summary() {
    print_success "Deployment completed!"
    echo
    echo "Next steps:"
    echo "1. Check your Railway dashboard for the deployment URL"
    echo "2. Configure environment variables in Railway dashboard"
    echo "3. Set up MongoDB Atlas database"
    echo "4. Test your API endpoints"
    echo
    echo "For detailed instructions, see: RAILWAY_DEPLOYMENT.md"
    echo
    print_status "Happy coding! 🚀"
}

# Main deployment function
main() {
    echo "🚀 Railway Deployment Script for Product Inventory API"
    echo "=================================================="
    echo
    
    # Run all deployment steps
    check_prerequisites
    check_required_files
    run_local_tests
    check_git_status
    deploy_to_railway
    get_deployment_url
    run_post_deployment_tests
    show_deployment_summary
}

# Run main function
main "$@" 