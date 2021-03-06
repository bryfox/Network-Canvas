/* eslint-env node */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { pull, without } = require('lodash');
const {
  main: quicktypeCli,
} = require('quicktype');

const enums = require('../../src/protocol-consts');

const projectDir = path.join(__dirname, '..', '..');
const outputDir = path.join(projectDir, 'src', 'schemas');

const input = path.join(projectDir, 'public', 'protocols', 'development.netcanvas', 'protocol.json');
const devProtocol = JSON.parse(fs.readFileSync(input));
const protocol = { ...devProtocol };

const schemaVersion = 1;

const protocolFile = path.join(outputDir, 'abstract-protocol.json');
const schemaFile = path.join(outputDir, `protocol.schema.v${schemaVersion}.json`);

const ensureOutputDir = () => {
  try {
    fs.mkdirSync(outputDir);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
};

/**
 * Build a generic/abstract protocol based on one of the factory protocols.
 * Schema keys are derived from prop names in this example protocol, so they're kept descriptive.
 *
 * Notes:
 * - 'required' is derived from example data; if only some of multiple examples contain value,
 *   then the key is considered optional.
 */
const generateAbstractProtocol = () => {
  // See https://github.com/codaco/Network-Canvas/wiki/protocol.json#variable-registry
  const variable = {
    name: '', // A field name that will be used (for example) when exporting data from the app
    label: '', // A human readable short label for this variable.
    description: '', // A human readable description for this variable
    type: '', // A valid variable type. For types, see below.
    validation: {
      // See src/utils/Validations.js
      required: true,
      requiredAcceptsNull: true,
      minLength: 1,
      maxLength: 24,
      minValue: 0,
      maxValue: 10,
      minSelected: 1,
      maxSelected: 10,
    }, // Validation rules, using redux-form compatible syntax.
    options: [{ label: 'foo', value: 'bar' }, { label: 'baz', value: 1 }, 2, 'aString'],
  };

  // From the VR, keep only the one definition for node & edge
  // Referenced dynamically to support Network-Canvas#648
  const vr = protocol.variableRegistry;
  vr.node = { nodeTypeDef: { ...Object.values(vr.node)[0] } };
  vr.node.nodeTypeDef.variables = { variable };
  vr.edge = { edgeTypeDef: { ...Object.values(vr.edge)[0] } };
  vr.edge.edgeTypeDef.variables = { variable };

  protocol.forms = { form: { ...Object.values(protocol.forms)[0] } };

  // external data has no specified stucture
  protocol.externalData = {};

  fs.writeFileSync(protocolFile, JSON.stringify(protocol, null, 2));

  console.log('Created protocol', protocolFile);
};

/**
 * Create a JSON schema based on the abstract protocol.
 * Begin with auto-generation, and modify resulting JSON as needed
 * rather than depending on quicktype internals or IR.
 */
const generateSchema = async () => {
  // Write default based on abstract example protocol
  await quicktypeCli(['--telemetry=disable', '--lang', 'schema', '--top-level', 'Protocol', '-o', schemaFile, protocolFile]);

  const schema = JSON.parse(fs.readFileSync(schemaFile));
  const defs = schema.definitions;

  schema.$schema = 'http://json-schema.org/draft-07/schema#';

  defs.Protocol.required = ['name', 'stages', 'variableRegistry'];
  defs.Protocol.properties.stages.minItems = 1;
  defs.Protocol.properties.lastModified.format = 'date-time';

  defs.Stage.title = 'Interface';
  defs.Stage.properties.type.enum = enums.StageTypeValues;
  defs.Stage.properties.prompts.minItems = 1;
  defs.Stage.anyOf = [
    {
      properties: { type: { const: 'Information' } },
      required: ['items'],
    },
    {
      properties: { type: { enum: without(enums.StageTypeValues, 'Information') } },
      required: ['prompts'],
    },
  ];

  delete defs.Subject.properties.type.format; // need not be UUID

  delete defs.Prompt.properties.variable.format; // need not be UUID

  // AdditionalAttributes & ExternalData have no defined props and may contain anything
  delete defs.AdditionalAttributes.properties;
  delete defs.AdditionalAttributes.additionalProperties;
  delete defs.ExternalData.properties;
  delete defs.ExternalData.additionalProperties;

  defs.VariableRegistry.required = [];

  // Node: `variableRegistry.node`
  // May contain props of any name; each prop references a NodeTypeDef
  defs.Node.patternProperties = { '.+': defs.Node.properties.nodeTypeDef };
  delete defs.Node.properties;
  delete defs.Node.required;

  // NodeTypeDef: `variableRegistry.node[NODE_TYPE]`
  delete defs.NodeTypeDef.properties.displayVariable.format;
  defs.NodeTypeDef.required = ['name', 'label', 'variables'];

  // See comments on Node, above
  defs.Edge.patternProperties = { '.+': defs.Edge.properties.edgeTypeDef };
  delete defs.Edge.properties;
  delete defs.Edge.required;

  delete defs.Edges.properties.display.items.format;
  delete defs.Edges.properties.create.format;
  pull(defs.Edges.required, 'create');

  pull(defs.EdgeTypeDef.required, 'variables');

  // Variables: one of `variableRegistry.node[NODE_TYPE].variables[VARIABLE_NAME]`
  // Used for both nodes & edges
  defs.Variables.patternProperties = { '.+': { ...defs.Variables.properties.variable } };
  delete defs.Variables.properties;
  delete defs.Variables.required;

  // Variable Type must be one of the valid types, and is the only required field
  // https://github.com/codaco/Network-Canvas/wiki/Variable-Types
  defs.Variable.required = ['type'];
  defs.Variable.properties.type.enum = enums.VariableTypeValues;

  defs.OptionElement.title = 'Variable Option';

  // Forms: like variableRegistry, an object with arbitrary keys and well-defined values
  defs.Forms.patternProperties = { '.+': { ...defs.Forms.properties.form } };
  delete defs.Forms.properties;
  delete defs.Forms.required;

  delete defs.Form.properties.type.format; // need not be a UUID
  pull(defs.Form.required, 'optionToAddAnother');

  defs.Field.properties.component.enum = enums.FormComponentValues;
  delete defs.Field.properties.variable.format; // need not be a UUID

  // subject.entity
  defs.Entity.enum = enums.EntityValues;

  // All validations are optional
  delete defs.Validation.required;

  // SkipLogic & Filter rules
  defs.SkipLogic.properties.value.minimum = 1;
  defs.SkipLogic.properties.value.multipleOf = 1;
  defs.SkipLogic.properties.action.enum = enums.SkipLogicActionValues;
  defs.SkipLogic.properties.operator.enum = enums.SkipLogicOperatorValues;
  // value only required for some operators
  pull(defs.SkipLogic.required, 'value');
  defs.SkipLogic.allOf = [
    {
      if: { properties: { operator: { enum: without(defs.SkipLogic.properties.operator.enum, 'ANY', 'NONE') } } },
      then: { required: ['value'] },
    },
  ];

  defs.Filter.properties.join.enum = enums.FilterJoinValues;

  defs.Rule.properties.type.enum = enums.RuleTypeValues;

  defs.Options.title = 'Rule Options';
  defs.Options.properties.operator.enum = enums.FilterOptionsOperatorValues;
  defs.Options.allOf = [
    {
      if: { properties: { operator: { enum: without(enums.FilterOptionsOperatorValues, 'EXISTS', 'NOT_EXISTS') } } },
      then: { required: ['value'] }, // in addition to props which are always required
    },
  ];
  // These need not be UUIDs
  delete defs.Options.properties.type.format;
  delete defs.Options.properties.attribute.format;

  delete defs.SortOrder.properties.property.format;
  delete defs.Property.properties.variable.format;
  delete defs.Highlight.properties.variable.format;
  delete defs.CardOptions.properties.displayLabel.format;
  delete defs.SearchOptions.properties.matchProperties.items.format;
  delete defs.Layout.properties.layoutVariable.format;

  // Items in an information interface
  defs.Item.properties.type.enum = enums.InformationContentTypeValues;

  // Most props are treated by NC as optional; this will
  // need actual review...
  pull(defs.Item.required, 'size');
  pull(defs.Highlight.required, 'allowHighlighting');

  fs.writeFileSync(schemaFile, JSON.stringify(schema, null, 2));

  console.log('Created schema', schemaFile);
};

ensureOutputDir();
generateAbstractProtocol();
generateSchema();
