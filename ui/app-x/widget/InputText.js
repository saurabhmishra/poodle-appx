import React, { useState, useContext, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  TextField,
  IconButton,
  makeStyles,
  useTheme,
} from '@material-ui/core'
import {
  AddCircleOutline,
  RemoveCircleOutline,
} from '@material-ui/icons'
import {
  Controller,
  useFormContext,
  useFieldArray,
} from 'react-hook-form'
import {
  AutoComplete,
} from 'antd'
import _ from 'lodash'

const InputText = (props) => {
  // theme
  const theme = useTheme()
  // useFormContext
  const {
    register,
    unregister,
    errors,
    watch,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    getValues,
    trigger,
    control,
    formState,
  } = useFormContext()

  const rules = props.rules || {}
  if (!!props.required) {
    rules.required = `${props.label || props.name} is required`
  }

  console.log(`rules`, rules)

  const [ _searchOptions, _setSearchOptions ] = useState([])

  useEffect(() => {
    if (!!props.options) {
      _setSearchOptions(props.options.map(n => ({value: n})))
      // console.log(`props.options`, props.options)
    } else {
      _setSearchOptions([])
    }
  }, [props.options])

  if (!!props.array) {
    // useFieldArray
    const {
      fields,
      append,
      prepend,
      insert,
      swap,
      move,
      remove,
    } = useFieldArray({
      control,
      name: props.id,
    })

    return (
      <Box
        {...(props.BoxProps || {})}
        style={props.style}
        >
        {
          !!props.label
          &&
          (
            <InputLabel
              key="label"
              shrink={true}
              required={!!props.required}
            >
              { props.label }
            </InputLabel>
          )
        }
        {
          fields
            .map((item, index) => {
              return (
                <Box
                  key={item.id}
                  display="flex"
                  style={{width:'100%'}}
                  >
                  <Controller
                    key={item.id}
                    name={`${props.id}[${index}].value`}
                    control={control}
                    required={!!props.required}
                    defaultValue={item.value || ''}
                    rules={rules}
                    render={innerProps => (
                      <FormControl
                        name={`${name}[${index}].value`}
                        style={{width:'100%'}}
                        error={!!_.get(errors, name)}
                        >
                        <AutoComplete
                          options={_searchOptions}
                          name={`${name}[${index}].value`}
                          value={innerProps.value}
                          onChange={data => {
                            innerProps.onChange(data)
                            if (!!props.callback) {
                              props.callback(data)
                            }
                          }}
                          onSearch={s => {
                            const s_list = s.toUpperCase().split(' ').filter(s => !!s)
                            const matches = (props.options || [])
                              .filter(option => {
                                const upper = option.toUpperCase()
                                return s_list.reduce((accumulator, item) => {
                                  return !!accumulator && upper.includes(item)
                                }, true)
                              })
                              .map(n => ({value: n}))
                            _setSearchOptions(matches)
                          }}
                          >
                          <TextField
                            {...(props.TextProps || {})}
                            name={`${name}[${index}].value`}
                            required={!!props.required}
                            style={{width:'100%'}}
                            value={innerProps.value}
                            onChange={e => {
                              innerProps.onChange(e.target.value)
                              if (!!props.callback) {
                                props.callback(e.target.value)
                              }
                            }}
                            error={!!_.get(errors, `${name}[${index}].value`)}
                            helperText={_.get(errors, `${name}[${index}].value`)?.message || ''}
                            >
                          </TextField>
                        </AutoComplete>
                      </FormControl>
                    )}
                    >
                  </Controller>
                  {
                    !props.readOnly
                    &&
                    (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        >
                        <IconButton
                          key="remove"
                          aria-label="Remove"
                          size="small"
                          onClick={e => {
                            remove(index)
                            if (!!props.callback) {
                              props.callback(index, `${name}[${index}]`)
                            }
                          }}
                          >
                          <RemoveCircleOutline />
                        </IconButton>
                      </Box>
                    )
                  }
                </Box>
              )
            })
        }
        {
          !props.readOnly
          &&
          (
            <IconButton
              key="add"
              aria-label="Add"
              size="small"
              onClick={e => {
                append({
                  value: '',
                })
                // if (!!props.callback) {
                //   props.callback('', name, 'add')
                // }
              }}
              >
              <AddCircleOutline />
            </IconButton>
          )
        }
      </Box>
    )

  } else {
    // not array
    return (
      <Box
        {...(props.BoxProps || {})}
        style={props.style}
        >
        <Controller
          key={props.id}
          name={props.id}
          required={props.required}
          constrol={control}
          defaultValue={props.defaultValue || ''}
          rules={rules}
          render={innerProps => (
            <FormControl
              name={props.id}
              style={{width:'100%'}}
              error={!!_.get(errors, props.id)}
              >
              {
                !!props.label
                &&
                (
                  <Box
                    style={{width: '100%', paddingBottom: theme.spacing(2)}}
                    >
                    <InputLabel
                      key="label"
                      shrink={true}
                      required={props.required}
                    >
                      { props.label }
                    </InputLabel>
                  </Box>
                )
              }
              <AutoComplete
                name={props.id}
                style={{width:'100%'}}
                options={_searchOptions}
                value={innerProps.value}
                onChange={data => {
                  innerProps.onChange(data)
                  if (!!props.callback) {
                    props.callback(data)
                  }
                }}
                onSearch={s => {
                  const s_list = s.toUpperCase().split(' ').filter(s => !!s)
                  const matches = (props.options || [])
                    .filter(option => {
                      const upper = option.toUpperCase()
                      return s_list.reduce((accumulator, item) => {
                        return !!accumulator && upper.includes(item)
                      }, true)
                    })
                    .map(n => ({value: n}))
                  _setSearchOptions(matches)
                }}
                >
                <TextField
                  {...(props.TextProps || {})}
                  name={props.id}
                  required={props.required}
                  style={{width:'100%'}}
                  value={innerProps.value}
                  onChange={e => {
                    innerProps.onChange(e.target.value)
                    if (!!props.callback) {
                      props.callback(e.target.value)
                    }
                  }}
                  error={!!_.get(errors, props.id)}
                  helperText={_.get(errors, props.id)?.message || ''}
                  >
                </TextField>
              </AutoComplete>
            </FormControl>
          )}
          >
        </Controller>
      </Box>
    )
  }
}

InputText.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
  array: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ),
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  callback: PropTypes.func,
  BoxProps: PropTypes.object,
  TextProps: PropTypes.object,
  style: PropTypes.object,
  rules: PropTypes.object,
}

InputText.appxType = 'appx/input/text'

export default InputText
