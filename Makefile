#!make
include .env

# DBのコンテナ名
CONTAINER_NAME = ${SITE_NAME}-mysql


# データベースをダンプ
dump:
	docker exec $(CONTAINER_NAME) mysqldump --no-tablespaces -u ${WORDPRESS_DB_USER} -p$(WORDPRESS_DB_PASSWORD) $(WORDPRESS_DB_NAME) | gzip > ./docker/mysql/db_dump/backup.sql.gz

# データベースをリストア
restore:
	@$(MAKE) confirmation
	gunzip < ./docker/mysql/db_dump/backup.sql.gz | docker exec -i $(CONTAINER_NAME) mysql -u ${WORDPRESS_DB_USER} -p$(WORDPRESS_DB_PASSWORD) $(WORDPRESS_DB_NAME)

# リストア実行確認
confirmation:
	@read -p "Are you sure you want to restore? [y/N]: " ans && [ $${ans:-N} = y ] || (echo "restore not executed."; exit 1)