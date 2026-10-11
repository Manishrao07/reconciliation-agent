.PHONY: setup db-up db-down migrate seed run test

setup:
	python3 -m venv venv
	./venv/bin/pip install -r requirements.txt

db-up:
	docker-compose up -d db

db-down:
	docker-compose down

migrate:
	./venv/bin/alembic upgrade head

seed:
	PYTHONPATH=. ./venv/bin/python db/seed.py

run:
	./venv/bin/uvicorn api.main:app --reload --port 8000

test:
	./venv/bin/pytest --cov=. tests/

test-docker:
	docker compose exec -T -e PYTHONPATH=/app api pytest tests/ -v --cov --cov-config=.coveragerc

reset-demo:
	docker compose down -v
	docker compose up -d db api
	echo "Waiting for db to be ready..."
	sleep 5
	docker compose exec api alembic upgrade head
	docker compose exec api python -m db.seed
	docker compose up -d ui
