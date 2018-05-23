import compose from 'koa-compose'
import convert from 'koa-convert'
import helmet from 'koa-helmet'
import cors from 'koa-cors'
import bodyParser from 'koa-bodyparser'
import cookie from 'koa-cookie'

export default () => {
  return compose([
    helmet(), // reset HTTP headers (e.g. remove x-powered-by)
    convert(cors()),
    convert(cookie()),
    convert(bodyParser())
  ])
}
