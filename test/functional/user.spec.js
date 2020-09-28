const { test, trait } = use('Test/Suite')('User');

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');

const Helpers = use('Helpers');
const Hash = use('Hash');

trait('Test/ApiClient');
trait('DatabaseTransactions');
trait('Auth/Client');

test('it should be able to update profile', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create({
    username: 'Ricardo',
    password: '123123',
  });

  const response = await client
    .put('/profile')
    .loginVia(user, 'jwt')
    .field('username', 'Joca')
    .field('password', '123456')
    .field('password_confirmation', '123456')
    .attach('avatar', Helpers.tmpPath('test/fox.jpg'))
    .end();

  response.assertStatus(200);

  assert.equal(response.body.username, 'Joca');
  assert.exists(response.body.avatar);

  await user.reload();

  assert.isTrue(await Hash.verify('123456', user.password));
});
