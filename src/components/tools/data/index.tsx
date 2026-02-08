
import JsonSchemaValidator from './JsonSchemaValidator';
import ExcelViewer from './ExcelViewer';
import CsvEditor from './CsvEditor';
import FakeDataGenerator from './FakeDataGenerator';
import RandomNameGenerator from './RandomNameGenerator';
import RandomAddressGenerator from './RandomAddressGenerator';
import CsvJsonConverter from './CsvJsonConverter';

const dataTools = {
  "json-validator": JsonSchemaValidator,
  "excel-viewer": ExcelViewer,
  "csv-editor": CsvEditor,
  "fake-data-generator": FakeDataGenerator,
  "random-name": RandomNameGenerator,
  "random-address": RandomAddressGenerator,
  "csv-json": CsvJsonConverter,
}

export default dataTools;