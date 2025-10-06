import schema from "./component/schema.js";
const modules = import.meta.glob("./component/**/*.ts");
export default { schema, modules };
