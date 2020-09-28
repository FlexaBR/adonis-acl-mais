const { test, trait } = use('Test/Suite')('Session');

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');

/** @type {typeof import ('@adonisjs/lucid/src/Lucid/Model')} */

trait('Test/ApiClient');
trait('DatabaseTransactions');

test('it should return JWT token when session created', async ({
  assert,
  client,
}) => {
  const sessionPayload = {
    email: 'ricardo@email.com',
    password: '1234',
  };

  await Factory.model('App/Models/User').create(sessionPayload);

  const response = await client.post('/sessions').send(sessionPayload).end();

  response.assertStatus(200);
  assert.exists(response.body.token);
});
