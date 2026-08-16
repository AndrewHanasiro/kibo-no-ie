.PHONY: dev backend frontend mobile deploy

# Inicia o backend e frontend simultaneamente
dev:
	@echo "🚀 Iniciando o ambiente de desenvolvimento (Backend e Frontend)..."
	@make -j2 backend frontend

# Inicia apenas o backend (Emuladores do Firebase)
backend:
	@echo "⚙️ Iniciando o Backend..."
	cd backend && npm run serve

# Inicia apenas o frontend (Next.js)
frontend:
	@echo "💻 Iniciando o Frontend..."
	cd frontend && npm run dev

# Inicia o mobile (Flutter)
# É recomendável rodar este comando em um terminal separado,
# pois o Flutter precisa de interação (como 'r' para hot reload)
mobile:
	@echo "📱 Iniciando o App Mobile..."
	cd mobile && flutter emulators --launch android_12 && flutter run

# Atalho para executar o script de deploy completo
deploy:
	@echo "🚀 Iniciando deploy..."
	./deploy.sh
