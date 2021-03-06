const deepEqual = require('deep-equal')
const stringify = require('fast-json-stable-stringify')
const db = require('../db/db')
const cache = require('../cache/cache')
const { json_transform, json_trigger } = require('../transform/json_transform')
const { log_api_status, parse_for_sql, load_object, record_spec_audit, SUCCESS, FAILURE, REGEX_VAR } = require('./util')

/**
 * handle_delete
 */
async function handle_delete(context, req, res) {

    let parsed = await parse_for_sql(context, req, res)

    if (parsed.fatal) {
        return
    }

    let sql_params = []

    // delete (logical)
    let sql = `UPDATE \`${context.obj_name}\` SET \`deleted\`=1`

    // set clause
    Object.keys(parsed.data_attrs).forEach((attr_key, i) => {

        // skip key columns
        if (attr_key in parsed.key_attrs) {
            return
        }

        // set attr
        sql = sql + `, \`${attr_key}\`=?`

        // add attr_value
        let attr_value = parsed.data_attrs[attr_key]
        if (typeof attr_value != 'object') {
            sql_params.push(attr_value)
        } else if (attr_value == null) {
            sql_params.push(null)
        } else {
            sql_params.push(`${JSON.stringify(attr_value)}`)
        }
    })

    // where clause
    first = true
    Object.keys(parsed.key_attrs).forEach((attr_key, i) => {

        if (! (attr_key in parsed.data_attrs)) {
            let msg = `ERROR: key attr not found [${attr_key}] !`
            log_api_status(context, FAILURE, msg)
            res.status(422).send(JSON.stringify({status: FAILURE, error: msg}))
            fatal = true
            return
        }

        // where clause
        if (first) {
            sql = sql + ` WHERE \`${attr_key}\`=?`
            first = false
        } else {
            sql = sql + ` AND \`${attr_key}\`=?`
        }

        // add attr_value
        let attr_value = parsed.data_attrs[attr_key]
        if (typeof attr_value != 'object') {
            sql_params.push(attr_value)
        } else if (attr_value == null) {
            sql_params.push(null)
        } else {
            sql_params.push(`${JSON.stringify(attr_value)}`)
        }
    })

    // query prev
    let prev = await load_object(parsed)

    // log the sql and run query
    console.log(`INFO: ${sql}, [${sql_params}]`)
    let result = await db.query_async(sql, sql_params)

    // query curr
    let curr = await load_object(parsed)
    let obj_changed = !deepEqual(curr, prev)

    // record audit
    if (prev != null && obj_changed) {
        await record_spec_audit(prev.id, prev, curr, req)
    }

    // invoke trigger if configured
    if (!!context.trigger) {
      // console.log(`INFO: context.trigger`, context.trigger, JSON.stringify(cache.get_cache_for('ui_deployment'), null, 2))
      const vars = {
        context: req.context,
        params: req.params,
        body: req.body,
        result: result,
        cache: cache.get_all_cache(),
      }
      await json_trigger(vars, context.trigger, {})
    }

    // send back the result
    res.status(200).json({status: SUCCESS, result: result})
}

// export
module.exports = {
    handle_delete: handle_delete
}
