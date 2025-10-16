#!/bin/bash

# Script pour nettoyer les dépendances et résoudre les conflits
echo "🧹 Nettoyage des dépendances et résolution des conflits..."

# Supprimer les fichiers de lock et node_modules
echo "📁 Suppression des fichiers de cache..."
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml
rm -rf .next

# Nettoyer le cache pnpm
echo "🗑️ Nettoyage du cache pnpm..."
pnpm store prune

# Réinstaller les dépendances
echo "📦 Réinstallation des dépendances..."
pnpm install --no-frozen-lockfile

# Vérifier les conflits
echo "🔍 Vérification des conflits..."
pnpm list --depth=0

echo "✅ Nettoyage terminé !"
echo "🚀 Vous pouvez maintenant tester le build avec: pnpm build"
