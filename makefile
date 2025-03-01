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
