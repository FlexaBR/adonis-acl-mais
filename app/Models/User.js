/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash');

const Env = use('Env');

class User extends Model {
  // Campo virtual que não existe no db
  static get computed() {
    return ['avatar_url'];
  }

  static boot() {
    super.boot();

    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password);
      }
    });
  }

  tokens() {
    return this.hasMany('App/Models/Token');
  }

  workshops() {
    return this.hasMany('App/Models/Workshop');
  }

  // muitos para muitos ==> n:n
  subscriptions() {
    return this.belongsToMany('App/Models/Workshop')
      .pivotTable('subscriptions')
      .withTimestamps();
  }

  getAvatarUrl({ avatar }) {
    return `${Env.get('APP_URL')}/files/${avatar || 'placeholder.png'}`;
  }

  static get traits() {
    return [
      '@provider:Adonis/Acl/HasRole',
      '@provider:Adonis/Acl/HasPermission',
    ];
  }
}

module.exports = User;
