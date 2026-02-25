#!/bin/bash
# ===========================================
# Deploy Script: Build local → Upload to Plesk Server
# ===========================================
# วิธีใช้:
#   1. แก้ค่า SERVER_USER, SERVER_HOST, SERVER_PATH ด้านล่าง
#   2. chmod +x deploy.sh
#   3. ./deploy.sh
# ===========================================

# ===== ตั้งค่า Server =====
SERVER_USER="root"                          # SSH user (เช่น root, admin, etc.)
SERVER_HOST="147.50.254.113"                # IP หรือ domain ของ server
SERVER_PATH="/var/www/vhosts/nexttrip.asia/httpdocs"  # path ของ tour-web บน server (Plesk)
SSH_PORT="22"                               # SSH port (ปกติ 22)

# ===== สี =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Starting deployment...${NC}"

# ===== Step 1: Build locally =====
echo -e "${YELLOW}📦 Step 1: Building locally...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Aborting deployment.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful!${NC}"

# ===== Step 2: Upload to server =====
echo -e "${YELLOW}📤 Step 2: Uploading to server...${NC}"

# Upload .next/ folder (build output)
rsync -avz --delete \
    -e "ssh -p ${SSH_PORT}" \
    .next/ \
    ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/.next/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to upload .next/ folder${NC}"
    exit 1
fi

# Upload public/ folder (static assets)
rsync -avz --delete \
    -e "ssh -p ${SSH_PORT}" \
    public/ \
    ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/public/

# Upload essential files
rsync -avz \
    -e "ssh -p ${SSH_PORT}" \
    package.json package-lock.json server.js ecosystem.config.js next.config.ts \
    ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

echo -e "${GREEN}✅ Upload complete!${NC}"

# ===== Step 3: Install production deps & restart Passenger on server =====
echo -e "${YELLOW}🔄 Step 3: Restarting server...${NC}"

ssh -p ${SSH_PORT} ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    cd /var/www/vhosts/nexttrip.asia/httpdocs
    
    # Install only production dependencies
    npm install --production --ignore-scripts
    
    # Restart Passenger (Plesk uses Passenger for Node.js)
    mkdir -p tmp
    touch tmp/restart.txt
    
    echo "✅ Server restarted! (Passenger will pick up changes)"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to restart server${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment complete!${NC}"
