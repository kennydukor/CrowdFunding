# Rollback old migration
db-rollback:
	npx sequelize-cli db:migrate:undo:all

# Run new migration
db-migrate:
	npx sequelize-cli db:migrate

# Run seed
db-seed:
	node seeder.js

# Run app
run:
	node server.js

# create new migration
db-migration:
	npx sequelize-cli migration:generate --name $(name)

db-seeder:
	npx sequelize-cli seed:generate --name $(name)

db-seed-all:
	npx sequelize-cli db:seed:all

help:
	@echo ""
	@echo "Available Commands:"
	@echo "-------------------------------------------"
	@echo " make db-migrate        → Run all migrations"
	@echo " make db-rollback       → Rollback all migrations"
	@echo " make db-seed           → Run all seeders (e.g. Payment Providers)"
	@echo " make db-seed-undo      → Undo all seeders"
	@echo " make db-migration name=create-table-name → Create a new migration file"
	@echo " make db-seeder name=seed-name            → Create a new seeder file"
	@echo " make run               → Start the application"
	@echo "-------------------------------------------"
	@echo " Example:"
	@echo "   make db-migration name=create-users-table"
	@echo "   make db-seeder name=seed-users"
	@echo ""
