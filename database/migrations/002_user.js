/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserSchema extends Schema {
  up() {
    this.create('users', (table) => {
      table.increments();

      table.string('avatar');
      table.string('username', 40).notNullable().index('IDX_USER_NAME');
      table.string('whatsapp', 15).notNullable().unique();
      table.string('cnpj', 18);
      table.string('cpf', 14);

      table.string('title', 30);
      table.string('bio', 50);
      table.string('github', 30);
      table.string('linkedin', 30);

      table.string('email', 50).notNullable().unique();
      table.string('password', 150).notNullable();

      table.string('cadasPor', 40);
      table.string('updatedPor', 40);
      table.timestamps();
    });
  }

  down() {
    this.drop('users');
  }
}

module.exports = UserSchema;
