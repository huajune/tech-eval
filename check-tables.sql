-- 查看数据库中所有表及其所属 schema
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- 查看 posts 和 auto_embedding_task 的详细信息
SELECT
    table_schema,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('posts', 'rds_datasets', 'auto_embedding_task')
ORDER BY table_name, ordinal_position;
