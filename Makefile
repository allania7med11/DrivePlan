.PHONY: backend frontend both

backend:
	cd backend && . ../venv/bin/activate && python manage.py runserver

frontend:
	cd frontend && npm run dev

both:
	make -j2 frontend backend
