const { test, trait } = use('Test/Suite')('Forgot Password');

const { subHours, subMinutes, format } = require('date-fns');

const Mail = use('Mail');
const Hash = use('Hash');
const Database = use('Database');

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');

trait('Test/ApiClient');
trait('DatabaseTransactions'); // limpa o db para novos testes

test('it should send an email with reset password instructions', async ({
  assert,
  client,
}) => {
  Mail.fake();

  const email = 'ricardo@email.com';

  const user = await Factory.model('App/Models/User').create({ email });

  await client.post('/forgot').send({ email }).end();

  const token = await user.tokens().first();

  const recentEmail = Mail.pullRecent();

  assert.equal(recentEmail.message.to[0].address, email);

  assert.include(token.toJSON(), {
    type: 'forgotpassword',
  });

  Mail.restore();
});

// chama uma rota /reset (token, senha nova, confirmação, senha precisa mudar)
// só reseta se o token tiver sido criado a menos de 2h

test('it should be able to reset password', async ({ assert, client }) => {
  const email = 'ricardo@email.com';

  const user = await Factory.model('App/Models/User').create({ email });
  const userToken = await Factory.model('App/Models/Token').make();

  await user.tokens().save(userToken);

  const response = await client
    .post('/reset')
    .send({
      token: userToken.token,
      password: '1234',
      password_confirmation: '1234',
    })
    .end();

  response.assertStatus(204);

  await user.reload();

  const checkPassword = await Hash.verify('1234', user.password);

  assert.isTrue(checkPassword);
});

test('it cannot reset password after 2h of forgot password request', async ({
  client,
}) => {
  const email = 'ricardo@email.com';

  const user = await Factory.model('App/Models/User').create({ email });
  const userToken = await Factory.model('App/Models/Token').make();

  await user.tokens().save(userToken);

  const dateWithSub = format(
    subMinutes(subHours(new Date(), 2), 10),
    'yyyy-MM-dd HH:ii:ss'
  );

  await Database.table('tokens')
    .where('token', userToken.token)
    .update('created_at', dateWithSub);

  await userToken.reload();

  const response = await client
    .post('/reset')
    .send({
      token: userToken.token,
      password: '1234',
      password_confirmation: '1234',
    })
    .end();

  response.assertStatus(400);
});
