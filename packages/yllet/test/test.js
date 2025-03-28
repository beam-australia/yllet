import test from 'ava';
import moxios from 'moxios';
import Client from '../src/index.js';
import post from './fixtures/post.js';

test.beforeEach(t => {
  moxios.install()
});

test.afterEach(t => {
  moxios.uninstall();
});

test('get post', async t => {
  const client = new Client({
    endpoint: 'http://wordpress.test/wp-json/'
  });

  moxios.stubRequest('http://wordpress.test/wp-json/wp/v2/posts/1', {
    status: 200,
    response: post
  });

  const res = await client.get('posts/1');

  t.is('Hello, world', res.data.title.rendered);
});

test('update post with params', async t => {
  const client = new Client({
    endpoint: 'http://wordpress.test/wp-json/'
  });

  moxios.stubRequest('http://wordpress.test/wp-json/wp/v2/posts/2?slug=hello-world-2', {
    status: 200,
    response: Object.assign({}, post, {
      slug: 'hello-world-2',
      title: {
        rendered: 'Hello, world 2'
      }
    })
  });

  const res = await client.update('posts/2', {
    title: 'Hello, world 2'
  }, {
    slug: 'hello-world-2'
  });

  t.is('Hello, world 2', res.data.title.rendered);
});

test('get post with params', async t => {
  const client = new Client({
    endpoint: 'http://wordpress.test/wp-json/'
  });

  moxios.stubRequest('http://wordpress.test/wp-json/wp/v2/posts/3?slug=hello-world-3', {
    status: 200,
    response: Object.assign({}, post, {
      slug: 'hello-world-3',
      title: {
        rendered: 'Hello, world 3'
      }
    })
  });

  const res = await client.get('posts/3', {
    slug: 'hello-world-3'
  });

  t.is('Hello, world 3', res.data.title.rendered);
});

test('custom resource', async t => {
  const client = new Client({
    endpoint: 'http://wordpress.test/wp-json/'
  });

  moxios.stubRequest('http://wordpress.test/wp-json/app/v1/posts/1', {
    status: 200,
    response: {
      title: {
        rendered: 'Ava'
      }
    }
  });

  client.app = () => client.namespace('app/v1').resource('posts');

  const res = await client.app().get(1);

  t.is('Ava', res.data.title.rendered);
});

test('embed param', async t => {
  const client = new Client({
    endpoint: 'http://wordpress.test/wp-json/'
  });

  t.is(undefined, client.param('_embed'));

  client.embed();

  t.is(true, client.param('_embed'));
});

test('client params', async t => {
  const client = new Client({
    endpoint: 'http://wordpress.test/wp-json/'
  });

  t.is(undefined, client.param('source'));

  client.param('source', 'yllet');

  t.is('yllet', client.param('source'));

  client.param({
    test: 'true'
  });

  t.is('true', client.param('test'));
});

test('client headers', async t => {
  const client = new Client({
    endpoint: 'http://wordpress.test/wp-json/'
  });

  t.is(undefined, client.header('Content-Type'));

  client.header('Content-Type', 'text/plain');

  t.is('text/plain', client.header('Content-Type'));

  client.header({
    test: 'true'
  });

  t.is('true', client.header('test'));
});

test('axios config', async t => {
  const client = new Client({
    endpoint: 'http://wordpress.test/wp-json/'
  });

  t.is(undefined, client.header('Content-Type'));

  client.config({
    headers: {
      'Content-Type': 'text/plain'
    }
  });

  t.is('text/plain', client.header('Content-Type'));
});

test('discover rest api', async t => {
  moxios.stubRequest('http://wordpress.test?rest_route=/', {
    status: 200,
    response: {
      routes: {
        '/': {
          _links: {
            self: 'http://wordpress.test/wp-json/'
          }
        }
      }
    }
  });

  const url = await Client.discover('http://wordpress.test/');

  t.is('http://wordpress.test/wp-json/', url);
});
