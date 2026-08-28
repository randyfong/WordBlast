import { Pool } from 'pg';

export const pool = new Pool({
  host: 'test-db-4e3b019c.pggxhcbj0ff21qv6grcvh9m01y.c0.us-west-2.aws.pg.clickhouse.cloud',
  port: 5432,
  user: 'postgres',
  password: 'D3nuOe2WamBNNFFhM4ni',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});
