/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Workshop = use('App/Models/Workshop');

class WorkshopController {
  async index({ request }) {
    // input - busca procura tanto no body, como nos query params
    // se não informar a seção pega a seção 1
    const section = request.input('section', 1);

    // builder: campos que retornarão
    const workshops = await Workshop.query()
      .where('section', section)
      .with('user', (builder) => {
        builder.select(['id', 'username', 'avatar']);
      })
      .fetch();

    return workshops;
  }

  async show({ params }) {
    const workshop = await Workshop.find(params.id);

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

  async store({ request, response }) {
    const data = request.only([
      'title',
      'color',
      'description',
      'user_id',
      'section',
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
