DO $$ 
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ecommerce_dev_db') THEN
      CREATE DATABASE ecommerce_dev_db;
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ecommerce_qa_db') THEN
      CREATE DATABASE ecommerce_qa_db;
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ecommerce_prod_db') THEN
      CREATE DATABASE ecommerce_prod_db;
   END IF;

END
$$;