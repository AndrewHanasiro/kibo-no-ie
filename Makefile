.PHONY: dev backend admin mobile deploy

# Inicia o backend, admin e visitante simultaneamente
dev:
	@echo "🚀 Iniciando o ambiente de desenvolvimento (Backend, Admin e Visitante)..."
	@make -j3 backend admin visitante

# Inicia apenas o backend (Emuladores do Firebase)
backend:
	@echo "⚙️ Iniciando o Backend..."
	cd backend && npm run serve

# Inicia apenas o admin (Next.js)
admin:
	@echo "💻 Iniciando o Admin..."
	cd admin && npm run dev

# Inicia o mobile (Flutter)
# É recomendável rodar este comando em um terminal separado,
# pois o Flutter precisa de interação (como 'r' para hot reload)
mobile:
	@echo "📱 Iniciando o App Mobile..."
	cd mobile && flutter emulators --launch android_12 && flutter run

# Inicia a SPA do Visitante (React + Vite)
visitante:
	@echo "🌐 Iniciando o App Web Visitante..."
	cd visitante && npm run dev

# Atalho para executar o script de deploy completo
deploy:
	@echo "🚀 Iniciando deploy..."
	./deploy.sh
