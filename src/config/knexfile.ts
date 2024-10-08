import dotenv from 'dotenv';
import { knex, Knex } from 'knex';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;
const ADJUTOR_API_URL = process.env.ADJUTOR_API_URL
const ADJUTOR_API_TOKEN = process.env.ADJUTOR_API_TOKEN

const connect =  async() => {

  const data: Knex.Config = {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT)
    },

  };
  const k = knex(data)

  const hasUsersTable = await k.schema.withSchema('democreditapp').hasTable('users');
  if (!hasUsersTable) {
   await k.schema.withSchema('democreditapp').createTable('users', function (table) {
     table.increments("Id").primary();
     table.string("Firstname");
     table.string("Lastname");
     table.string("Username");
     table.string("Password");
     table.string("AccountNo").checkRegex('[0-9]{10}');
     table.string('PhoneNumber').checkRegex('\\+[0-9]{13}').notNullable();
     table.integer("Balance");
    });
  }

  return k;

}
const Schema = connect ();

export { Schema, SECRET_KEY, ADJUTOR_API_TOKEN, ADJUTOR_API_URL };

