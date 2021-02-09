const fs = require('fs')
const path = require('path')
const process = require('process')
// require('console-stamp')(console, { pattern: 'yyyy-mm-dd HH:MM:ss', label: false})
require('console-stamp')(console, {
    format: ':date(yyyy-mm-dd HH:MM:ss)'
} );

//////////////////////////////////////////////////
// load spec
let appx_spec = null
async function load_spec() {
  appx_spec = (await import('./appx_spec.mjs')).default
  console.log(`INFO: appx_spec [classes]`, Object.keys(appx_spec.classes))
  console.log(`INFO: appx_spec [types]`, Object.keys(appx_spec.types))
}
load_spec()

//////////////////////////////////////////////////
// process cli arguments
const { ArgumentParser } = require('argparse')
const parser = new ArgumentParser({
    description: 'launch appx server'
})

parser.add_argument('-c', '--conf', { help: 'mysql config file', required: true })
parser.add_argument('-m', '--mount', { help: 'mount config file', required: true })
args = parser.parse_args()

let db_conf_options = JSON.parse(fs.readFileSync(args.conf))
let mount_options = JSON.parse(fs.readFileSync(args.mount))

async function start() {
  //////////////////////////////////////////////////
  // check database connectivity
  const db = require('./src/db/db')
  let db_pool = db.getPool(args.conf)

  //////////////////////////////////////////////////
  // load cache to memory
  const { init_cache} = require('./src/cache/cache')
  await init_cache()

  //////////////////////////////////////////////////
  // initialize express
  const express = require('express')
  // const cookieParser = require('cookie-parser')
  const bodyParser = require('body-parser')

  // express app
  const app = express()
  //app.use(cookieParser)
  //app.configure(function() {
  //    app.use(express.cookieParser())
  //})

  //////////////////////////////////////////////////
  // recursively walk app-x path
  var appx_paths = []
  const staticRootDir = path.join(__dirname, '../ui/')
  const { walk_recursive } = require('./src/ui/util_lookup')
  walk_recursive(path.join(staticRootDir, 'app-x'), (err, results) => {
    if (err) {
      console.log(err)
      return
    }

    const result = []
    results.map(r => {
      // console.log(r)
      if (r.startsWith(staticRootDir) && r.endsWith('.js')) {
        if (r.endsWith('/index.js')) {
          const relPath = r.substring(staticRootDir.length)
          const importPath = relPath.substring(0, relPath.length - 9)
          console.log(`INFO: found app-x path [${importPath}]`)
          result.push(importPath)
        } else {
          const relPath = r.substring(staticRootDir.length)
          const importPath = relPath.substring(0, relPath.length - 3)
          console.log(`INFO: found app-x path [${importPath}]`)
          result.push(importPath)
        }
      }
    })

    if (result.length) {
      appx_paths = result
    }
  })

  //////////////////////////////////////////////////
  // initialize auth_dispatcher and authenticator --- Note: perform this step only after db_pool is initialized
  const { auth_dispatcher, authenticator } = require("./src/auth")
  ////app.use(passport.initialize())
  ////app.use(passport.session())
  // auth endpoints
  app.use(mount_options.auth_root, bodyParser.json())
  app.use(mount_options.auth_root,
    (req, res, next) => {
      req.mount_options = mount_options
      next()
    },
    auth_dispatcher)

  //////////////////////////////////////////////////
  // initialize router --- Note: perform this step only after db_pool is initialized
  const { api_dispatcher, refresh_api_routers } = require('./src/api/api_dispatcher')
  // api endpoints
  app.use(mount_options.api_root, bodyParser.json({type: '*/*', limit: 5 * 1024 * 1024}))
  app.use(mount_options.api_root,
    (req, res, next) => {
      req.mount_options = mount_options
      req.appx_spec = appx_spec
      next()
    },
    authenticator,
    api_dispatcher)

  //////////////////////////////////////////////////
  // initialize ui router --- Note: perform this step only after db_pool is initialized
  const { ui_dispatcher, refresh_ui_routers } = require('./src/ui/ui_dispatcher')
  // ui endpoints
  // app.use(mount_options.ui_root, bodyParser.urlencoded({extended: false}))
  app.use(mount_options.ui_root, bodyParser.json({type: '*/*', limit: 5 * 1024 * 1024}))
  // app.use(mount_options.ui_root, bodyParser.urlencoded({extended: true}))
  app.use(mount_options.ui_root,
    (req, res, next) => {
      req.mount_options = mount_options
      req.appx_paths = appx_paths
      req.appx_spec = appx_spec
      next()
    },
    ui_dispatcher)

  //////////////////////////////////////////////////
  // initialize static files and launch page
  // static files and launch page
  app.use('/',
      (req, res, next) => {
          if (req.url.startsWith('/app-x/')
              || req.url.startsWith('/dist/')
              || req.url.startsWith('/static/')
              || req.url == '/sw.js') {
              // handle static files
              next()
          } else {
            // redirect everything else to landing page
            res.status(302).redirect(mount_options.ui_root + '/sys/console/base/')
          }
      },
      // service worker needs to be at the root
      express.static(staticRootDir)
  )

  // load all async functions
  await Promise.all([
    await refresh_api_routers(),
    await refresh_ui_routers(),
  ])

  //////////////////////////////////////////////////
  // start listening
    // start listening
  var server = app.listen(3000, () => {
      console.log(`INFO: appx rest api server listening at http://${server.address().address}:${server.address().port}`)
  })
}

start()
