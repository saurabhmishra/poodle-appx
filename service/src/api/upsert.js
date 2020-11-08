const db = require('../db/db')
const cache = require('../cache/cache')
const { log_api_status, parse_for_sql, SUCCESS, FAILURE, REGEX_VAR } = require('./util')

/**
 * handle_upsert
 */
function handle_upsert(api_context, req, res) {

    let parsed = parse_for_sql(api_context, req, res)

    if (parsed.fatal) {
        return
    }

    let sql_params = []

    // select
    let sql = `INSERT INTO \`${api_context.obj_name}\``
    let first = true
    Object.keys(parsed.data_attrs).forEach((attr, i) => {
        if (first) {
            sql = sql + `(\`${attr}\``
            first = false
        } else {
            sql = sql + `, \`${attr}\``
        }
    })
    sql = sql + `, \`deleted\`) VALUES (`
    first = true
    Object.keys(parsed.data_attrs).forEach((attr_key, i) => {
        if (first) {
            first = false
        } else {
            sql = sql + `, `
        }
        let attr_value = parsed.data_attrs[attr_key]
        if (typeof attr_value != 'object') {
            sql = sql + `?`
            sql_params.push(attr_value)
        } else if (attr_value == null) {
            sql = sql + `?`
            sql_params.push(null)
        } else {
            sql = sql + `?`
            sql_params.push(`${JSON.stringify(attr_value)}`)
        }
    })
    sql = sql + `, 0)`

    Object.keys(parsed.key_attrs).forEach((key_attr, i) => {

        if (! (key_attr in parsed.data_attrs)) {
            let msg = `ERROR: key attr not found [${key_attr}] !`
            log_api_status(api_context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }
    })

    sql = sql + ` ON DUPLICATE KEY UPDATE \`deleted\`=0`
    Object.keys(parsed.data_attrs).forEach((data_attr, i) => {

        if (data_attr in parsed.non_key_attrs) {
            sql = sql + `, \`${data_attr}\`=VALUES(\`${data_attr}\`)`
        }
    });

    // log the sql and run query
    console.log(`INFO: ${sql}, [${sql_params}]`)
    let result = db.query_sync(sql, sql_params)

    // send back the result
    res.status(200).json({status: SUCCESS})
}

// export
module.exports = {
    handle_upsert: handle_upsert
}