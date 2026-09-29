#!/usr/bin/env bash
# Bootstrap VM Scaleway pour Kolos (à exécuter UNE fois en SSH root/ubuntu)
# Usage :
#   curl -sL ... | bash   OU   bash bootstrap-vm.sh
set -euo pipefail

KOLOS_DIR="${KOLOS_DIR:-/opt/kolos}"
REPO_URL="${REPO_URL:-https://github.com/CavSibli/Kolos-App.git}"
BRANCH="${BRANCH:-main}"

echo "==> Install Docker + Compose plugin"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
sudo usermod -aG docker "${USER}" || true

echo "==> Clone / update repo in ${KOLOS_DIR}"
sudo mkdir -p "${KOLOS_DIR}"
if [ ! -d "${KOLOS_DIR}/.git" ]; then
  sudo git clone --branch "${BRANCH}" "${REPO_URL}" "${KOLOS_DIR}"
else
  sudo git -C "${KOLOS_DIR}" fetch origin
  sudo git -C "${KOLOS_DIR}" checkout "${BRANCH}"
  sudo git -C "${KOLOS_DIR}" pull --ff-only origin "${BRANCH}"
fi
sudo chown -R "${USER}:${USER}" "${KOLOS_DIR}"

if [ ! -f "${KOLOS_DIR}/.env" ]; then
  cp "${KOLOS_DIR}/.env.production.example" "${KOLOS_DIR}/.env"
  echo "==> Fichier .env créé depuis .env.production.example"
  echo "    ÉDITE-LE avant le premier up (mots de passe, domaine, images)."
else
  echo "==> .env déjà présent — non écrasé"
fi

echo "==> Bootstrap terminé."
echo "Suite : éditer ${KOLOS_DIR}/.env puis docker compose -f docker-compose.prod.yml up -d"
