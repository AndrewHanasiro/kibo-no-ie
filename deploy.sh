#!/bin/bash

# Encerra o script se houver algum erro
set -e

echo "🚀 Iniciando o processo de deploy do Kibō-no-Iê..."

# 1. Build do Backend
echo "========================================="
echo "⚙️  Preparando o Backend..."
echo "========================================="
cd backend
echo "📦 Instalando dependências do backend..."
npm ci
echo "🛠️  Compilando o TypeScript..."
npm run build
cd ..

# 2. Build do Admin
echo ""
echo "========================================="
echo "💻 Preparando o Admin Web..."
echo "========================================="
cd admin
echo "📦 Instalando dependências do admin..."
npm ci
echo "🛠️  Gerando build de produção do Next.js..."
npm run build
cd ..

# 3. Build do Mobile
echo ""
echo "========================================="
echo "📱 Gerando os artefatos do App Mobile..."
echo "========================================="
cd mobile
echo "📦 Obtendo dependências do Flutter..."
flutter pub get

echo "🤖 Gerando o Android App Bundle (.aab)..."
flutter build appbundle

echo "🤖 Gerando o Android Application Package (.apk)..."
flutter build apk

if [ "$(uname)" == "Darwin" ]; then
    echo "🍎 Gerando o iOS App Store Package (.ipa)..."
    flutter build ipa
else
    echo "⚠️  Pulando o build do iOS (.ipa) porque este sistema não é um macOS (requer Xcode)."
fi
cd ..

# 4. Deploy no Firebase
echo ""
echo "========================================="
echo "☁️  Realizando deploy no Firebase..."
echo "========================================="
firebase deploy

echo ""
echo "✅ Deploy e geração dos artefatos concluídos com sucesso!"
echo "📍 Os builds mobile foram gerados em:"
echo "   Android: mobile/build/app/outputs/bundle/release/app-release.aab"
echo "   iOS (se no macOS): mobile/build/ios/ipa/"
