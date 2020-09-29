/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Workshop = use('App/Models/Workshop');

class WorkshopController {
  async index({ request, auth }) {
    const user = await auth.getUser();

    // input - busca procura tanto no body, como nos query params
    // se não informar a seção pega a seção 1
    const section = request.input('section', 1);

    if (await user.can('read_private_workshops')) {
      const workshops = await Workshop.query()
        .where('section', section)
        .with('user', (builder) => {
          builder.select(['id', 'username', 'avatar']);
        })
        .fetch();

      return workshops;
    }
    // builder: campos que retornarão
    const workshops = await Workshop.query()
      .where('section', section)
      .where({ type: 'public' })
      .with('user', (builder) => {
        builder.select(['id', 'username', 'avatar']);
      })
      .fetch();

    return workshops;
  }

  async show({ params, auth, response }) {
    const workshop = await Workshop.findOrFail(params.id);

    if (workshop.type === 'public') {
      await workshop.load('user', (builder) => {
        builder.select([
          'id',
          'username',
          'whatsapp',
          'github',
          'linkedin',
          'avatar',
        ]);
      });

      return workshop;
    }

    const user = await auth.getUser();

    if (await user.can('read_private_workshops')) {
      await workshop.load('user', (builder) => {
        builder.select([
          'id',
          'username',
          'whatsapp',
          'github',
          'linkedin',
          'avatar',
        ]);
      });

      return workshop;
    }

    return response.status(400).send({
      error: {
        message: 'Você não tem permissão de leitura.',
      },
    });
  }

  async store({ request, response }) {
    const data = request.only([
      'title',
      'color',
      'description',
      'user_id',
      'section',
      'type',
    ]);

    const workshop = await Workshop.create(data);

    return response.status(201).json(workshop);
  }

  async update({ request, params }) {
    const data = request.only([
      'title',
      'color',
      'description',
      'user_id',
      'section',
      'type',
    ]);

    const workshop = await Workshop.find(params.id);

    workshop.merge(data);

    await workshop.save();

    return workshop;
  }

  async destroy({ params }) {
    const workshop = await Workshop.find(params.id);

    await workshop.delete();
  }
}
module.exports = WorkshopController;
