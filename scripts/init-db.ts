import { initDbSchema } from "../lib/db";
initDbSchema().then(() => console.log("DB initialized")).catch(console.error);
