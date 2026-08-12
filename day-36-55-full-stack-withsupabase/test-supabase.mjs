import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzuwtktrtyrhkwobaobs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dXd0a3RydHlyaGt3b2Jhb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDAxNTYsImV4cCI6MjEwMDIxNjE1Nn0.rY23IS5pPfUnfHYoDSYGytaCtn9a6Na0JY24Hi8X70Y';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Fetching OpenAPI spec...");
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
  const spec = await res.json();
  console.log("Spec keys:", Object.keys(spec));
  console.log("Spec info:", spec.info);
  const schemas = spec.definitions || spec.components?.schemas || {};
  console.log("Schemas keys:", Object.keys(schemas));
  const cardsSchema = schemas.cards;
  if (!cardsSchema) {
    console.error("No cards schema found!");
    return;
  }
  
  const properties = cardsSchema.properties;
  console.log("Cards table columns:", Object.keys(properties));
  if (properties.width && properties.height) {
    console.log("Width and height columns EXIST in the database!");
    console.log("Width type:", properties.width.type);
    console.log("Height type:", properties.height.type);
  } else {
    console.log("Width and/or height columns are MISSING from the database!");
  }
  

}

test();
