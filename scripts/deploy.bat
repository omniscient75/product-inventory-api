@echo off
REM Railway Deployment Script for Product Inventory API (Windows)
REM This script automates the deployment process to Railway
REM
REM Usage: scripts\deploy.bat
REM Prerequisites: Railway CLI installed and authenticated
REM
REM @author Product Inventory API Team
REM @created 2024-01-XX

echo 🚀 Railway Deployment Script for Product Inventory API
echo ==================================================
echo.

REM Check if Railway CLI is installed
where railway >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ [ERROR] Railway CLI is not installed. Please install it first:
    echo npm install -g @railway/cli
    pause
    exit /b 1
)

REM Check if user is logged in to Railway
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ [ERROR] Not logged in to Railway. Please run: railway login
    pause
    exit /b 1
)

echo ✅ [SUCCESS] All prerequisites are met!

REM Check required files
echo [INFO] Checking required files...
if not exist "package.json" (
    echo ❌ [ERROR] Required file missing: package.json
    pause
    exit /b 1
)
if not exist "server.js" (
    echo ❌ [ERROR] Required file missing: server.js
    pause
    exit /b 1
)
if not exist "railway.json" (
    echo ❌ [ERROR] Required file missing: railway.json
    pause
    exit /b 1
)
if not exist "Procfile" (
    echo ❌ [ERROR] Required file missing: Procfile
    pause
    exit /b 1
)
if not exist ".nixpacks" (
    echo ❌ [ERROR] Required file missing: .nixpacks
    pause
    exit /b 1
)

echo ✅ [SUCCESS] All required files are present!

REM Run local tests if npm is available
echo [INFO] Running local tests...
where npm >nul 2>&1
if %errorlevel% equ 0 (
    npm test
    if %errorlevel% equ 0 (
        echo ✅ [SUCCESS] Local tests passed!
    ) else (
        echo ⚠️ [WARNING] Local tests failed, but continuing with deployment...
    )
) else (
    echo ⚠️ [WARNING] npm not found, skipping local tests...
)

REM Check Git status
echo [INFO] Checking Git status...
if not exist ".git" (
    echo ❌ [ERROR] Not in a Git repository. Please initialize Git first.
    pause
    exit /b 1
)

REM Check for uncommitted changes
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ [WARNING] There are uncommitted changes in your repository.
    echo Current changes:
    git status --short
    
    set /p commit_changes="Do you want to commit these changes before deploying? (y/N): "
    if /i "%commit_changes%"=="y" (
        git add .
        git commit -m "Auto-commit before Railway deployment"
        echo ✅ [SUCCESS] Changes committed!
    ) else (
        echo ⚠️ [WARNING] Deploying with uncommitted changes...
    )
) else (
    echo ✅ [SUCCESS] No uncommitted changes found!
)

REM Deploy to Railway
echo [INFO] Deploying to Railway...

REM Check if project is already linked
railway status >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Project is already linked to Railway. Deploying...
    railway up
    if %errorlevel% equ 0 (
        echo ✅ [SUCCESS] Deployment successful!
    ) else (
        echo ❌ [ERROR] Deployment failed!
        pause
        exit /b 1
    )
) else (
    echo [INFO] Linking project to Railway...
    railway link
    if %errorlevel% equ 0 (
        echo [INFO] Deploying to Railway...
        railway up
        if %errorlevel% equ 0 (
            echo ✅ [SUCCESS] Deployment successful!
        ) else (
            echo ❌ [ERROR] Deployment failed!
            pause
            exit /b 1
        )
    ) else (
        echo ❌ [ERROR] Failed to link project to Railway!
        pause
        exit /b 1
    )
)

REM Get deployment URL
echo [INFO] Getting deployment URL...
railway status --json > railway-status.json 2>nul
if exist "railway-status.json" (
    for /f "tokens=*" %%i in ('findstr /C:"url" railway-status.json') do (
        set url_line=%%i
        set url_line=!url_line:"=!
        set url_line=!url_line:url:=!
        set url_line=!url_line:,=!
        echo !url_line! > .railway-url
        echo ✅ [SUCCESS] Deployment URL: !url_line!
        echo [INFO] URL saved to .railway-url
    )
    del railway-status.json
) else (
    echo ⚠️ [WARNING] Could not retrieve deployment URL automatically.
    echo [INFO] Please check your Railway dashboard for the URL.
)

REM Run post-deployment tests
if exist ".railway-url" (
    echo [INFO] Running post-deployment tests...
    set /p url=<.railway-url
    
    where node >nul 2>&1
    if %errorlevel% equ 0 (
        if exist "scripts\test-deployment.js" (
            node scripts\test-deployment.js "%url%"
            if %errorlevel% equ 0 (
                echo ✅ [SUCCESS] Post-deployment tests passed!
            ) else (
                echo ⚠️ [WARNING] Post-deployment tests failed. Please check manually.
            )
        ) else (
            echo ⚠️ [WARNING] Deployment test script not found. Skipping tests.
        )
    ) else (
        echo ⚠️ [WARNING] Node.js not found. Skipping post-deployment tests.
    )
) else (
    echo ⚠️ [WARNING] No deployment URL found. Skipping post-deployment tests.
)

REM Show deployment summary
echo.
echo ✅ [SUCCESS] Deployment completed!
echo.
echo Next steps:
echo 1. Check your Railway dashboard for the deployment URL
echo 2. Configure environment variables in Railway dashboard
echo 3. Set up MongoDB Atlas database
echo 4. Test your API endpoints
echo.
echo For detailed instructions, see: RAILWAY_DEPLOYMENT.md
echo.
echo [INFO] Happy coding! 🚀
echo.
pause 