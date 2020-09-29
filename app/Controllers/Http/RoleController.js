const Role = use('Role');

class RoleController {
  async index() {
    const roles = await Role.query().with('permissions').fetch();

    return roles;
  }

  async show({ params }) {
    const role = await Role.findOrFail(params.id);

    await role.load('permissions');

    return role;
  }

  async store({ request }) {
    const { permissions, ...data } = request.only([
      'name',
      'slug',
      'description',
      'permissions',
    ]);

    const role = await Role.create(data);
    if (permissions) {
      // relacionamento com permissions => 1_role:n_permissions
      await role.permissions().attach(permissions);
    }
    // a role carrega as permissions
    await role.load('permissions');

    return role;
  }

  async update({ request, params }) {
    const { permissions, ...data } = request.only([
      'name',
      'slug',
      'description',
      'permissions',
    ]);

    const role = await Role.findOrFail(params.id);

    role.merge(data);

    await role.save();

    if (permissions) {
      // relacionamento com permissions => 1_role:n_permissions
      // sync - deleta roles antigas e salva as novas
      await role.permissions().sync(permissions);
    }

    await role.load('permissions');

    return role;
  }

  async destroy({ params }) {
    const role = await Role.findOrFail(params.id);

    await role.delete();
  }
}

module.exports = RoleController;
