import Ajv from "ajv";
import schema from "../../../.astro/collections/project.schema.json";
import projects from "../../data/project.json";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

export function validateProjects() {
  for (const [i, project] of projects.entries()) {
    const valid = validate(project);
    if (!valid) {
      console.error(`❌ Erro no projeto [${i}]:`, validate.errors);
      throw new Error("Falha na validação dos projetos");
    }
  }
  console.log("✅ Todos os projetos são válidos!");
}
