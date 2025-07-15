.PHONY: up-dev down-dev build-images push-images up-prod down-prod

up-dev: ## Start complete development environment
	cd frontend && npm run dev -- -H 0.0.0.0 &
	docker compose --profile dev up -d

down-dev: ## Stop development environment
	docker compose --profile dev down
	-pkill -f "next dev"

build-images: ## Build production images
	docker compose --profile prod build

push-images: build-images ## Build and push images to registry
	docker compose --profile prod push

up-prod: ## Start production environment
	docker compose --profile prod up -d

down-prod: ## Stop production environment
	docker compose --profile prod down

logs-prod: ## Show production logs
	docker compose --profile prod logs -f

help: ## Show available commands
	@echo "DrivePlan Commands:"
	@echo "=================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'