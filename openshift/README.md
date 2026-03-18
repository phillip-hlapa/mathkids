# MathKids — OpenShift Deployment Guide

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| `oc` CLI | OpenShift client | https://mirror.openshift.com/pub/openshift-v4/clients/ocp/ |
| Git repo | BuildConfigs pull source from Git | Push code to GitHub / GitLab / Bitbucket |
| OpenShift 4.x cluster | Any flavour: ROSA, ARO, OCP on-prem, CRC | — |

---

## Key OpenShift Differences vs Docker Compose

| Concern | Docker / Compose | OpenShift |
|---------|-----------------|-----------|
| Container user | root OK | **Must run as non-root** (arbitrary UID) |
| HTTP port | 80 | **8080** (non-privileged) |
| Ingress | `docker-compose` port mapping | **Route** (OpenShift-native, TLS built-in) |
| Image source | Local build | **BuildConfig** → ImageStream |
| Secrets | `.env` file | **Secret** objects (never in Git) |
| MongoDB image | `mongo:7` | `rhscl/mongodb-36-rhel7` (UBI/certified) |

All of these are already handled in the manifests.

---

## Quick Deploy (Automated)

```bash
# 1. Push your code to Git first
git remote add origin https://github.com/YOUR_ORG/mathkids.git
git push -u origin main

# 2. Login to OpenShift
oc login https://api.your-cluster.example.com

# 3. Set your repo and run
GIT_REPO=https://github.com/YOUR_ORG/mathkids.git ./deploy.sh
```

The script will prompt for your secrets interactively.

---

## Manual Step-by-Step Deploy

### 1. Create the project
```bash
oc new-project mathkids --display-name="MathKids"
```

### 2. Create secrets
```bash
oc create secret generic mathkids-secrets \
  --from-literal=MONGO_USER=mathkidsuser \
  --from-literal=MONGO_PASSWORD='YourSecurePassword!' \
  --from-literal=MONGO_ADMIN_PASSWORD='YourAdminPw!' \
  --from-literal=JWT_SECRET='a_very_long_random_secret_string' \
  --from-literal=ADMIN_PASSWORD='admin123'
```

### 3. Deploy MongoDB
```bash
oc apply -f openshift/mongodb/pvc.yaml
oc apply -f openshift/mongodb/deployment.yaml
oc rollout status deployment/mathkids-mongodb
```

### 4. Edit your Git URL in the BuildConfigs
Open `openshift/backend/deployment.yaml` and `openshift/frontend/deployment.yaml`
and replace `YOUR_ORG` with your actual GitHub org/user.

### 5. Deploy backend
```bash
oc apply -f openshift/backend/deployment.yaml
oc start-build mathkids-backend --follow
oc rollout status deployment/mathkids-backend
```

### 6. Deploy frontend
```bash
oc apply -f openshift/frontend/deployment.yaml
oc start-build mathkids-frontend --follow
oc rollout status deployment/mathkids-frontend
```

### 7. Get your URL
```bash
oc get route mathkids
# NAME       HOST/PORT                                    ...
# mathkids   mathkids.apps.your-cluster.example.com      ...
```

Open `https://mathkids.apps.your-cluster.example.com` 🎉

---

## File Map

```
openshift/
├── namespace.yaml              # Project definition
├── secrets.yaml                # Secret template (base64 placeholders)
├── mongodb/
│   ├── pvc.yaml                # 2Gi persistent volume for data
│   └── deployment.yaml         # MongoDB deployment + headless service
├── backend/
│   └── deployment.yaml         # ImageStream + BuildConfig + Deployment + Service
└── frontend/
    └── deployment.yaml         # ImageStream + BuildConfig + Deployment + Service + Route
deploy.sh                       # One-shot deploy script
```

---

## Useful Commands

```bash
# Watch all pods
oc get pods -n mathkids -w

# Stream backend logs
oc logs -l component=backend -n mathkids -f

# Stream frontend logs
oc logs -l component=frontend -n mathkids -f

# Rebuild after pushing new code
oc start-build mathkids-backend  -n mathkids --follow
oc start-build mathkids-frontend -n mathkids --follow

# Scale replicas
oc scale deployment mathkids-backend  --replicas=3 -n mathkids
oc scale deployment mathkids-frontend --replicas=3 -n mathkids

# Tear everything down
oc delete project mathkids
```

---

## Secrets Management (Production)

The `secrets.yaml` file contains **placeholder** base64 values — do not use them as-is.

For production, consider:
- **OpenShift Secrets** (already used here) — good baseline
- **Bitnami Sealed Secrets** — safe to commit encrypted secrets to Git
- **HashiCorp Vault** + OpenShift Vault Agent — enterprise grade
- **AWS Secrets Manager / Azure Key Vault** — if on ROSA / ARO

---

## Custom Domain (Optional)

To use your own domain instead of the auto-assigned `*.apps.cluster` URL:

```bash
oc patch route mathkids -n mathkids \
  -p '{"spec":{"host":"math.yourdomain.com"}}'
```

Then point a DNS CNAME record at your OpenShift router's wildcard address.
