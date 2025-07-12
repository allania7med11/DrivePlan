.PHONY: up-dev down-dev

up-dev: ## Start complete development environment
	cd frontend && npm run dev -- -H 0.0.0.0 &
	docker compose --profile dev up -d

down-dev: ## Stop development environment
	docker compose --profile dev down
	-pkill -f "next dev"