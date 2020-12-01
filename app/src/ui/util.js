//const babel = require('@babel/standalone')
//const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const { parse, parseExpression } = require('@babel/parser')
const t = require("@babel/types")
const db = require('../db/db')

const PATH_SEPARATOR = '/'
const VARIABLE_SEPARATOR = '.'

const SPECIAL_CHARACTER = /[^_a-zA-Z0-9]/g

const REQUIRE_FUNCTION = '$r'


////////////////////////////////////////////////////////////////////////////////
// primitive test
function isPrimitive(test) {
    return (test !== Object(test))
}

// capitalize string
function capitalize(s) {
    if (typeof s !== 'string') {
        throw new Error(`ERROR: capitalize input is not string [${typeof s}]`)
    }
    return s.charAt(0).toUpperCase() + s.slice(1)
}

// reserved test
function isReserved(test) {
    try {
        eval('var ' + test + ' = 1')
        return false
    } catch {
        return true
    }
}

// create primitive js ast
function js_primitive(js_context, input) {

  switch (typeof input) {
    case 'string':
      return t.stringLiteral(input)
    case 'number':
      return t.numericLiteral(input)
    case 'boolean':
      return t.booleanLiteral(input)
    case 'object':
      if (input === null) {
        return t.nullLiteral()
      } else {
        throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
      }
    default:
      throw new Error(`ERROR: input is not primitive [${typeof input}] [${JSON.stringify(input)}]`)
  }
}

// create array js ast
// js_array is true - will return result as an array of data
// js_array is false - will return arrayExpression
function js_array(js_context, input) {

  if (isPrimitive(input)) {
    throw new Error(`ERROR: input is primitive [${JSON.stringify(input)}]`)
  }

  if (typeof input !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (!Array.isArray(input)) {
    throw new Error(`ERROR: input is not array [${typeof input}] [${JSON.stringify(input)}]`)
  }

  return t.arrayExpression(
    input.map(row => {
      return js_process(js_context, row)
    })
  )
}

function js_object(js_context, input) {

  if (isPrimitive(input)) {
    throw new Error(`ERROR: input is primitive [${JSON.stringify(input)}]`)
  }

  if (typeof input !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof input}] [${JSON.stringify(input)}]`)
  }

  if (Array.isArray(input)) {
    throw new Error(`ERROR: input is array [${typeof input}] [${JSON.stringify(input)}]`)
  }

  return t.objectExpression(
    Object.keys(input).map(key => {
      const value = input[key]
      return t.objectProperty(
        t.stringLiteral(key),
        js_process(js_context, value)
      )
    })
  )
}

// create import ast
function js_import(js_context, input) {

  if (!('type' in input) || input.type !== 'js/import') {
    throw new Error(`ERROR: input.type is not [js/import] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/import] [${JSON.stringify(input)}]`)
  }

  reg_js_import(js_context, input.name, use_default=false)

  // do we need to return anything?
  return t.identifier(input.name)
}

// create export ast
function js_export(js_context, input) {

  if (!('type' in input) || input.type !== 'js/export') {
    throw new Error(`ERROR: input.type is not [js/export] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/export] [${JSON.stringify(input)}]`)
  }

  if (input.default) {

    return t.exportDefaultSpecifier(
      t.identifier(input.name)
    )
  } else {

    return t.exportSpecifier(
      t.identifier(input.name),
      t.identifier(input.name)
    )
  }
}

// create variable declaration ast
function js_variable(js_context, input) {

  if (!('type' in input) || input.type !== 'js/variable') {
    throw new Error(`ERROR: input.type is not [js/variable] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/variable] [${JSON.stringify(input)}]`)
  }

  if (! ('expression' in input)) {
    throw new Error(`ERROR: input.expression missing in [js/variable] [${JSON.stringify(input)}]`)
  }

  return t.variableDeclaration(
    input.kind ? input.kind : 'const',
    [
      t.variableDeclarator(
        t.identifier(input.name),
        isPrimitive(input.expression)
          ? js_expression(js_context, input.expression)
          : js_process(js_context, input.expression)
      )
    ]
  )
}

function _js_parse_snippet(js_context, parsed) {

  // console.log(parsed)

  traverse(parsed, {
    // resolve call expressins with REQUIRE_FUNCTION require syntax
    //   $r('app-x/router|navigate')
    CallExpression(path) {
      // log callee
      //console.log(path.node.callee)
      //console.log(path.node.arguments)
      // check if matches REQUIRE_FUNCTION require syntax
      if (t.isIdentifier(path.node.callee)
          && path.node.callee.name === REQUIRE_FUNCTION
          && path.node.arguments.length > 0
          && t.isStringLiteral(path.node.arguments[0])) {
        // register and import REQUIRE_FUNCTION require syntax
        const name = path.node.arguments[0].value
        reg_js_import(js_context, name)
        path.replaceWith(t.identifier(name))
      }
    },
    // register all variable declarators with 'snippet' prefix
    VariableDeclarator(path) {
      if (t.isIdentifier(path.node.id)) {
        // register variable defined by local snippet
        const nodeName = path.node.id.name
        reg_js_import(js_context, nodeName)
        path.node.id.name = nodeName
      }
    }
  })

  // parsed object is already modified, return same object for convinience
  return parsed
}

// create expression ast
function js_expression(js_context, input) {

  let data = ''
  if (typeof input === 'string' && input.trim().startsWith('`') && input.trim().endsWith('`')) {

    data = input

  } else if (isPrimitive(input)) {

    return js_primitive(js_context, input)

  } else {

    if (!('type' in input) || input.type !== 'js/expression') {
      throw new Error(`ERROR: input.type is not [js/expression] [${input.type}] [${JSON.stringify(input)}]`)
    }

    if (! ('data' in input)) {
      throw new Error(`ERROR: input.data missing in [js/expression] [${JSON.stringify(input)}]`)
    }

    data = input.data
  }

  const parsed = parseExpression(data)

  // parse user code snippet
  _js_parse_snippet(
    js_context,
    t.file(
      t.program(
        [
          t.returnStatement(
            parsed
          )
        ]
      )
    )
  )

  return parsed
}

// create block ast (allow return outside of function)
function js_block(js_context, input) {

  let data = ''
  if (typeof input === 'string') {

    data = input

  } else {
    if (!('type' in input) || input.type !== 'js/block') {
      throw new Error(`ERROR: input.type is not [js/block] [${input.type}] [${JSON.stringify(input)}]`)
    }

    if (! ('data' in input)) {
      throw new Error(`ERROR: input.data missing in [js/block] [${JSON.stringify(input)}]`)
    }

    data = input.data
  }

  const program = parse(data, {
    // sourceType: 'module', // do not support module here
    allowReturnOutsideFunction: true, // allow return in the block statement
    plugins: [
      // 'jsx', // do not support jsx here
    ]
  })

  // parse user code snippet
  _js_parse_snippet(js_context, program)

  return t.blockStatement(
    program.program.body
  )
}

// create array function ast
function js_function(js_context, input) {

  if (!('type' in input) || input.type !== 'js/function') {
    throw new Error(`ERROR: input.type is not [js/function] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('body' in input)) {
    throw new Error(`ERROR: input.body missing in [js/function] [${JSON.stringify(input)}]`)
  }

  return t.arrowFunctionExpression(
    input.params ? input.params.map(param => js_process(js_context, param)) : [],
    js_block(js_context, input.body),
    input.async ? true : false
  )
}

// create call ast
function js_call(js_context, input) {

  if (!('type' in input) || input.type !== 'js/function') {
    throw new Error(`ERROR: input.type is not [js/call] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [js/call] [${JSON.stringify(input)}]`)
  }

  return t.callExpression(
    t.identifier(input.name),
    input.params ? input.params.map(param => js_process(js_context, param)) : []
  )
}

// create jsx element ast
function react_element(js_context, input) {

  if (!('type' in input) || input.type !== 'react/element') {
    throw new Error(`ERROR: input.type is not [react/element] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/element] [${JSON.stringify(input)}]`)
  }

  // capitalize element name and register
  const parsed_var = _parse_var_full_path(input.name)
  const capitalized_name = capitalize(parsed_var.full_paths.pop())

  reg_js_import(js_context, input.name, use_default=true, suggested_name=capitalized_name)

  // create react element with props and children
  const react_element = t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(input.name),
      'props' in input ? react_element_props(js_context, input.props) : []
    ),
    t.jSXClosingElement(
      t.jSXIdentifier(input.name),
    ),
    react_element_children(js_context, input.children)
  )

  // check if there are any block statements
  const block_statements = []
  Object.keys(input).map(key => {
    // ignore type / name / props / children
    if (key === 'type' || key === 'name' || key === 'props' || key === 'children') {
      return
    }
    // check if input[key] is 'js/block'
    if (!isPrimitive(input[key]) && input[key].type === 'js/block') {
      // adds each of the block statement
      block_statements.push(...(js_process(js_context, input[key]).body))

    } else {
      // process input[key] and assign to declared variable
      block_statements.push(
        t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.identifier(key),
              js_process(js_context, input[key])
            )
          ]
        )
      )
    }
  })

  // if we have block_statements
  if (block_statements.length > 0) {
    return t.arrowFunctionExpression(
      [
        t.identifier('props')
      ],
      t.blockStatement(
        [
          ...block_statements,
          t.returnStatement(
            react_element
          )
        ]
      )
    )
  } else {
    // return react element
    return react_element
  }
}

// create jsx element props ast
function react_element_props(js_context, props) {

  if (! props) {
    return []
  }

  if (typeof props !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof props}] [${JSON.stringify(props)}]`)
  }

  if (Array.isArray(props)) {
    throw new Error(`ERROR: input is array [${typeof props}] [${JSON.stringify(props)}]`)
  }

  const results = Object.keys(props).map(prop_key => {
    const prop = props[prop_key]
    return t.jSXAttribute(
      t.jSXIdentifier(prop_key),
      typeof prop === 'string'
        ? t.stringLiteral(prop) // TODO
        : t.jSXExpressionContainer(
            js_process(js_context, prop)
          )
    )
  })

  return results
}

// create jsx element children ast
function react_element_children(js_context, children) {

  // console.log(children)
  if (! children) {
    return []
  }

  if (typeof children !== 'object') {
    throw new Error(`ERROR: input is not object [${typeof children}] [${JSON.stringify(children)}]`)
  }

  if (!Array.isArray(children)) {
    throw new Error(`ERROR: input is not array [${typeof children}] [${JSON.stringify(children)}]`)
  }

  return children.map(row => {
    if (typeof row === 'string') {
      return t.jSXText(row)
    } else {
      return js_process(js_context, row)
    }
  })
}

// create react state ast
function react_state(js_context, input) {

  if (!('type' in input) || input.type !== 'react/state') {
    throw new Error(`ERROR: input.type is not [react/state] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (! ('name' in input)) {
    throw new Error(`ERROR: input.name missing in [react/state] [${JSON.stringify(input)}]`)
  }

  if (! ('setter' in input)) {
    throw new Error(`ERROR: input.setter missing in [react/state] [${JSON.stringify(input)}]`)
  }

  if (! ('init' in input)) {
    throw new Error(`ERROR: input.init missing in [react/state] [${JSON.stringify(input)}]`)
  }

  // register react.useState
  reg_js_import(js_context, 'react.useState')

  return t.callExpression(
    t.arrowFunctionExpression(
      [],
      t.blockStatement(
        [
          t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.arrayPattern(
                  [
                    t.identifier(input.name),
                    t.identifier(input.setter)
                  ]
                ),
                t.callExpression(
                  t.identifier('react.useState'),
                  [
                    js_process(js_context, input.init)
                  ]
                )
              )
            ]
          ),
          t.returnStatement(
            t.objectExpression(
              [
                t.objectProperty(
                  t.stringLiteral(input.name),
                  t.identifier(input.name)
                ),
                t.objectProperty(
                  t.stringLiteral(input.setter),
                  t.identifier(input.setter)
                )
              ]
            )
          )
        ]
      )
    ),
    []
  )
}

// create mui style expression
function mui_style(js_context, input) {

  if (!('type' in input) || input.type !== 'mui/style') {
    throw new Error(`ERROR: input.type is not [mui/style] [${input.type}] [${JSON.stringify(input)}]`)
  }

  // register material ui makeStyles
  reg_js_import(js_context, '@material-ui/core.makeStyles')

  // prepare styles object
  const styles = { ...input }
  delete styles.type

  // return function call
  return t.callExpression(
    t.callExpression(
      t.identifier('@material-ui/core.makeStyles'),
      [
        t.arrowFunctionExpression(
          [
            t.identifier('theme')
          ],
          js_process(js_context, styles)
        )
      ]
    ),
    []
  )
}

// create jsx route ast
function appx_route(js_context, input) {

  if (!('type' in input) || input.type !== 'appx/route') {
    throw new Error(`ERROR: input.type is not [appx/route] [${input.type}] [${JSON.stringify(input)}]`)
  }

  if (!('appx' in js_context) || !('ui_deployment' in js_context.appx)) {
    throw new Error(`ERROR: context missing appx.ui_deployment [${JSON.stringify(js_context)}]`)
  }

  const { ui_deployment } = js_context.appx

  let route_results = db.query_sync(`SELECT
                  ui_route.namespace,
                  ui_route.ui_name,
                  ui_route.ui_ver,
                  ui_deployment.ui_deployment,
                  ui_deployment.ui_deployment_spec,
                  ui_route.ui_route_name,
                  ui_route.ui_route_spec,
                  ui_route.create_time,
                  ui_route.update_time
              FROM ui_route
              JOIN ui_deployment
                  ON ui_route.namespace = ui_deployment.namespace
                  AND ui_route.ui_name = ui_deployment.ui_name
                  AND ui_route.ui_ver = ui_deployment.ui_ver
              WHERE
                  ui_route.namespace = ?
                  AND ui_route.ui_name = ?
                  AND ui_deployment.ui_deployment = ?
                  AND ui_route.deleted=0
                  AND ui_deployment.deleted=0`,
              [
                  ui_deployment.namespace,
                  ui_deployment.ui_name,
                  ui_deployment.ui_deployment,
              ]
  )

  // console.log(route_results)
  return t.objectExpression(
    route_results.map(route => {
      return t.objectProperty(
        t.stringLiteral(route.ui_route_name),
        t.arrowFunctionExpression(
          [],
          t.blockStatement(
            [
              t.returnStatement(
                js_process(js_context, route.ui_route_spec)
              )
            ]
          )
        )
      )
    })
  )
}

// process input
function js_process(js_context, input) {

  if (isPrimitive(input)) {
    return js_primitive(js_context, input)
  }

  if (Array.isArray(input)) {
    return js_array(js_context, input)
  }

  if (! ('type' in input)) {
    // no 'type' is treated as json object
    return js_object(js_context, input)
  }

  // 'type' is presented in the json object
  if (input.type === 'js/import') {

    return js_import(js_context, input)

  } else if (input.type === 'js/export') {

    return js_export(js_context, input)

  } else if (input.type === 'js/variable') {

    return js_variable(js_context, input)

  } else if (input.type === 'js/expression') {

    return js_expression(js_context, input)

  } else if (input.type === 'js/block') {

    return js_block(js_context, input)

  } else if (input.type === 'js/function') {

    return js_function(js_context, input)

  } else if (input.type === 'js/call') {

    return js_call(js_context, input)

  } else if (input.type === 'js/transform') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'js/trigger') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'react/element') {

    return react_element(js_context, input)

  } else if (input.type === 'react/state') {

    return react_state(js_context, input)

  } else if (input.type === 'mui/style') {

    return mui_style(js_context, input)

  } else if (input.type === 'mui/control') {

    // TODO
    throw new Error(`ERROR: unsupported input.type [${input.type}]`)

  } else if (input.type === 'appx/route') {

    return appx_route(js_context, input)

  } else {

    throw new Error(`ERROR: unrecognized input.type [${input.type}] [${JSON.stringify(input)}]`)
  }
}

function js_resolve_ids(js_context, ast_tree) {
  // add imports and other context to the code
  traverse(ast_tree, {
    Program: {
      exit(path) {
        const import_statements = []
        ////////////////////////////////////////////////////////////
        // process import statement first, prior to process sub_vars
        Object.keys(js_context.imports).map(importKey => {
          // get basic information of import registration
          // console.log(js_context.imports[importKey])
          let import_name = js_context.variables[importKey].name
          let import_path = js_context.imports[importKey].path
          let sub_vars = js_context.imports[importKey].sub_vars
          // process import statement, then process sub_vars
          if (js_context.imports[importKey].use_default) {
            import_statements.unshift(
              t.importDeclaration(
                [
                  t.ImportDefaultSpecifier(
                    t.identifier(import_name)
                  )
                ],
                t.stringLiteral(import_path)
              )
            )
          } else {
            import_statements.unshift(
              t.importDeclaration(
                [
                  t.importNamespaceSpecifier(
                    t.identifier(import_name)
                  )
                ],
                t.stringLiteral(import_path)
              )
            )
          }
          ////////////////////////////////////////////////////////////
          // we have processed import statement, now process sub_vars
          Object.keys(sub_vars).forEach((sub_var_key, i) => {
            // compute sub_var_name and sub_var_value
            let sub_var_value = sub_vars[sub_var_key]
            if (! sub_var_value.length) {
              return
            }
            //console.log(sub_var_value)
            // get sub_var variable registration
            let sub_var_name = js_context.variables[importKey + VARIABLE_SEPARATOR + sub_var_key].name
            // compose sub_var_expression
            let sub_var_expression = t.memberExpression(
              t.identifier(import_name),
              t.stringLiteral(sub_var_value.shift()),
              true
            )
            while (sub_var_value.length) {
              sub_var_expression = t.memberExpression(
                sub_var_expression,
                t.stringLiteral(sub_var_value.shift()),
                true
              )
            }
            // add sub_var declarations to the body
            import_statements.unshift(
              t.variableDeclaration(
                'const',
                [
                  t.variableDeclarator(
                    t.identifier(sub_var_name),
                    sub_var_expression
                  )
                ]
              )
            )
          })
        })
        ////////////////////////////////////////////////////////////
        // add import statements to program body
        import_statements.forEach((import_statement, i) => {
          path.unshiftContainer(
            'body',
            import_statement
          )
        })
      }
    },
    Identifier(path) {
      if (path.node.name in js_context.variables) {
        path.node.name = js_context.variables[path.node.name].name
      } else {
        // TODO - do we want to resolve all the identifier here
        // console.error(`ERROR: unable to resolve [${path.node.name}]`)
      }
    },
    JSXIdentifier(path) {
      if (path.node.name in js_context.variables) {
        path.node.name = js_context.variables[path.node.name].name
      } else {
        // TODO - do we want to resolve all the identifier here
        // console.error(`ERROR: unable to resolve [${path.node.name}]`)
      }
    }
  })
}

// parse variable full path
function _parse_var_full_path(var_full_path) {

  let import_paths = var_full_path.split(PATH_SEPARATOR)
  let sub_vars = import_paths[import_paths.length - 1].split(VARIABLE_SEPARATOR)

  // add first sub_var to import_path
  import_paths[import_paths.length - 1] = sub_vars.shift()

  return {
    full_paths: [].concat(import_paths, sub_vars),
    import_paths: import_paths,
    sub_vars: sub_vars
  }
}

// register variables
function reg_js_variable(js_context, var_full_path, kind='const', suggested_name=null) {

    // if variable is already registered, just return
    if (var_full_path in js_context.variables) {
      return
    }

    // parse variable
    const parsed_var = _parse_var_full_path(var_full_path)

    let var_prefix = [].concat(parsed_var.full_paths)
    if (suggested_name) {
      var_prefix.pop() // remove most qualified name
      var_prefix.push(suggested_name) // add suggested_name
    }

    // get starting var_name
    let var_name = var_prefix.pop().replace(SPECIAL_CHARACTER, '_')
    if (isReserved(var_name)) {
      var_name = var_name + '$' + var_prefix.pop().replace(SPECIAL_CHARACTER, '_')
    }

    while (true) {

        // check for name conflict
        const found = Object.keys(js_context.variables).find(key => {
            let spec = js_context.variables[key]
            return spec.name === var_name
        })

        // name conflict found
        if (found) {
            // update conflicting variable names
            Object.keys(js_context.variables).map(key => {
                let var_spec = js_context.variables[key]
                if (var_spec.name === var_name) {
                    if (var_spec.var_prefix.length) {
                        var_spec.name = var_spec.name + '$' + var_spec.var_prefix.pop().replace(SPECIAL_CHARACTER, '_')
                    } else {
                        // we have exhausted the full path, throw exception
                        throw new Error(`ERROR: name resolution conflict [${var_full_path}]`)
                    }
                }
            })
            // update our own variable name
            if (var_prefix) {
                var_name = var_name + '$' + var_prefix.pop().replace(SPECIAL_CHARACTER, '_')
            } else {
                // we have exhausted the full path, throw exception
                throw new Error(`ERROR: name resolution conflict [${var_full_path}]`)
            }
        } else {
            js_context.variables[var_full_path] = {
                kind: kind,
                name: var_name,
                var_full_path: var_full_path,
                var_prefix: var_prefix
            }
            return js_context
        }
    }
}

function reg_js_import(js_context, var_full_path, use_default=false, suggested_name=null) {

    // if variable is already registered, just return
    if (var_full_path in js_context.imports) {
      return
    }

    // parse variable
    const parsed_var = _parse_var_full_path(var_full_path)

    // import_path
    const import_path = parsed_var.import_paths.join(PATH_SEPARATOR)

    if (import_path !== var_full_path) {
        // if import_path is different from variable_full_path, suggested_name applies only to the variable
        reg_js_variable(js_context, import_path, 'const', null)
        reg_js_variable(js_context, var_full_path, 'const', suggested_name)
    } else {
        // if import path is same as variable_full_path, suggested_name applies to both
        // reg_js_variable(js_context, import_path, 'const', suggested_name)
        reg_js_variable(js_context, var_full_path, 'const', suggested_name)
    }

    // update import data
    if (!(import_path in js_context.imports)) {
        js_context.imports[import_path] = {
            use_default: use_default,
            suggested_name: suggested_name,
            path: import_path,
            sub_vars: {}
        }
    }

    // update sub_vars for import
    let sub_vars = [].concat(parsed_var.sub_vars)
    if (sub_vars.length !== 0) {
        // compute sub_var_name and sub_var_full_path
        const sub_var_name = sub_vars.join(VARIABLE_SEPARATOR)
        // register as import sub_var and as variable
        js_context.imports[import_path].sub_vars[sub_var_name] = parsed_var.sub_vars
    }
}

// get variable definition
function get_js_variable(js_context, variable_full_path) {

    if (variable_full_path in js_context.variables) {
        return js_context.variables[variable_full_path]
    } else {
        throw new Error(`ERROR: unable to find variable [${variable_full_path}]`)
    }
}

// export
module.exports = {
  js_process: js_process,
  js_resolve_ids: js_resolve_ids,
  js_array: js_array,
  js_object: js_object,
  js_primitive: js_primitive,
  js_import: js_import,
  js_export: js_export,
  js_variable: js_variable,
  js_expression: js_expression,
  js_block: js_block,
  js_function: js_function,
  js_call: js_call,
  react_element: react_element,
  reg_js_variable: reg_js_variable,
  reg_js_import: reg_js_import,
}