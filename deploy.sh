#!/usr/bin/env bash
# =============================================================
# MathKids — OpenShift Deployment Script
# Run this from the root of the mathkids project.
# Prerequisites: oc CLI installed and logged in to your cluster.
# =============================================================
set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Check prerequisites ───────────────────────────────────────
command -v oc &>/dev/null || error "oc CLI not found. Install from https://mirror.openshift.com/pub/openshift-v4/clients/ocp/"
oc whoami &>/dev/null    || error "Not logged in to OpenShift. Run: oc login https://api.your-cluster.example.com"

# ── Configuration — edit these ────────────────────────────────
GIT_REPO="${GIT_REPO:-https://github.com/YOUR_ORG/mathkids.git}"
#NAMESPACE="${NAMESPACE:-mathkids}"
NAMESPACE=philliphlapa-dev

# ── Prompt for secrets if not set in environment ─────────────
if [[ -z "${JWT_SECRET:-}" ]]; then
  read -rsp "Enter JWT_SECRET (long random string): " JWT_SECRET; echo
fi
if [[ -z "${ADMIN_PASSWORD:-}" ]]; then
  read -rsp "Enter ADMIN_PASSWORD: " ADMIN_PASSWORD; echo
fi
if [[ -z "${MONGO_PASSWORD:-}" ]]; then
  read -rsp "Enter MONGO_PASSWORD: " MONGO_PASSWORD; echo
fi
MONGO_ADMIN_PASSWORD="${MONGO_ADMIN_PASSWORD:-$(openssl rand -base64 16)}"

info "Deploying MathKids to namespace: $NAMESPACE"

# ── 1. Create project ─────────────────────────────────────────
info "Creating OpenShift project..."
#oc new-project "$NAMESPACE" --display-name="MathKids" --description="Fun math app for kids" 2>/dev/null || \
#  oc project "$NAMESPACE"

# ── 2. Create secrets ─────────────────────────────────────────
info "Creating secrets..."
oc create secret generic mathkids-secrets \
  --from-literal=MONGO_USER=mathkidsuser \
  --from-literal=MONGO_PASSWORD="$MONGO_PASSWORD" \
  --from-literal=MONGO_ADMIN_PASSWORD="$MONGO_ADMIN_PASSWORD" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | oc apply -f -

# ── 3. MongoDB ────────────────────────────────────────────────
info "Deploying MongoDB..."
oc apply -f openshift/mongodb/pvc.yaml -n "$NAMESPACE"
oc apply -f openshift/mongodb/deployment.yaml -n "$NAMESPACE"

info "Waiting for MongoDB to be ready..."
oc rollout status deployment/mathkids-mongodb -n "$NAMESPACE" --timeout=120s || \
  warn "MongoDB rollout timed out — check: oc logs -l component=mongodb -n $NAMESPACE"

# ── 4. Patch Git repo into BuildConfigs ───────────────────────
info "Patching Git repo URL ($GIT_REPO) into BuildConfigs..."
sed "s|https://github.com/YOUR_ORG/mathkids.git|$GIT_REPO|g" \
  openshift/backend/deployment.yaml | oc apply -f - -n "$NAMESPACE"

sed "s|https://github.com/YOUR_ORG/mathkids.git|$GIT_REPO|g" \
  openshift/frontend/deployment.yaml | oc apply -f - -n "$NAMESPACE"

# ── 5. Trigger builds ─────────────────────────────────────────
info "Starting image builds (this takes a few minutes)..."
oc start-build mathkids-backend  -n "$NAMESPACE" --follow
oc start-build mathkids-frontend -n "$NAMESPACE" --follow

# ── 6. Wait for rollouts ──────────────────────────────────────
info "Waiting for backend rollout..."
oc rollout status deployment/mathkids-backend -n "$NAMESPACE" --timeout=180s

info "Waiting for frontend rollout..."
oc rollout status deployment/mathkids-frontend -n "$NAMESPACE" --timeout=180s

# ── 7. Print route URL ────────────────────────────────────────
ROUTE_URL=$(oc get route mathkids -n "$NAMESPACE" -o jsonpath='{.spec.host}' 2>/dev/null || echo "")
echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN} ✅ MathKids deployed successfully!${NC}"
if [[ -n "$ROUTE_URL" ]]; then
  echo -e "${GREEN} 🌐 URL: https://$ROUTE_URL${NC}"
fi
echo -e "${GREEN} 📛 Namespace: $NAMESPACE${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
info "Useful commands:"
echo "  oc get pods -n $NAMESPACE"
echo "  oc logs -l component=backend -n $NAMESPACE"
echo "  oc logs -l component=frontend -n $NAMESPACE"
echo "  oc logs -l component=mongodb -n $NAMESPACE"
echo "  oc get route -n $NAMESPACE"
