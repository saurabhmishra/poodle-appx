import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/context                               (~expression|~statement)
// name:                     # context name          (:string) - autosuggest import
export const react_context = {

  type: 'react/context',
  desc: 'React Context',
  classes: [
    'expression',
    'statement',
  ],
  children: [
    {
      name: 'name',
      desc: 'Context Name',
      required: true,
      classes: [
        {
          class: 'expression'
        },
      ],
      _thisNode: {
        class: 'string',
        input: 'input/text',
        suggestions: 'auto_suggestions.valid_import_names()',
        suggestionsOnly: true,
        examples: [
          'app-x/builder/ui/NavProvider.Context',
        ],
      },
    },
  ]
}

export default react_context
