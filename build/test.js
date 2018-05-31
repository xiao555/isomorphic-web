import run, { format } from './run'
import start from './start'
import supertest from 'supertest'

let server

afterAll(() => {
  server.close()
})

describe('Test Development', () => {
  test('start dev server', async () => {
    jest.setTimeout(30000)
    server = await run(start, { silent: true, showStats: false, autoOpenBrowser: false })
    expect(server).not.toBeUndefined()
  })
})

describe('Test SSR', () => {
  test('render home page', async () => {
    const response = await supertest(server).get('/')
    expect(response.status).toBe(200)
  })
})

describe('Test API', () => {
  test('GraphQL articles', async () => {
    const response = await supertest(server).post('/graphql')
      .send('query={\narticles\n{\nauthor\ncontent\n}\n}')
    const articles = response.body.data.articles

    expect(response.status).toBe(200)
    expect(articles.length).toBe(2)
  })

  test('GraphQL article', async () => {
    const response = await supertest(server).post('/graphql')
      .send('query={\narticle(id: "article1")\n{\nauthor\ncontent\n}\n}')
    const article = response.body.data

    expect(response.status).toBe(200)
    expect(article).toBeDefined()
  })
})




