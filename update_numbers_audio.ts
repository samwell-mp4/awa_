import { supabase } from "./src/integrations/supabase/client.server";

const NUMBERS_JSON = [
  { "pt": "Um", "pat": "Kutkuxú", "audio": "/__l5e/assets-v1/0a50107c-35c2-459b-9fc1-399a0d2aa745/numero-01.mp3" },
  { "pt": "Dois", "pat": "Mokoi", "audio": "/__l5e/assets-v1/bb18fb52-b9a0-43ea-94c5-92fb76ae4062/numero-02.mp3" },
  { "pt": "Três", "pat": "Kaikui", "audio": "/__l5e/assets-v1/4945f279-0e97-441a-87ed-dd4cab73ac5f/numero-03.mp3" },
  { "pt": "Quatro", "pat": "Bap", "audio": "/__l5e/assets-v1/791b663e-0798-467d-80d5-6ee8c5a8d6cb/numero-04.mp3" },
  { "pt": "Cinco", "pat": "Mankoi", "audio": "/__l5e/assets-v1/ad724985-187f-430e-a325-4f2f8f1f38ce/numero-05.mp3" },
  { "pt": "Seis", "pat": "Kutkuxú hãpõhã", "audio": "/__l5e/assets-v1/972dcad9-9c23-4362-a12d-4ac55bbc2374/numero-06.mp3" },
  { "pt": "Sete", "pat": "Mokoi hãpõhã", "audio": "/__l5e/assets-v1/670234f5-0285-450b-93ab-6626f2ce3cd9/numero-07.mp3" },
  { "pt": "Oito", "pat": "Kaikui hãpõhã", "audio": "/__l5e/assets-v1/98aec23b-5271-4e94-9e2b-85e9ebd0db77/numero-08.mp3" },
  { "pt": "Nove", "pat": "Bap hãpõhã", "audio": "/__l5e/assets-v1/b8705bf6-a6e4-4b13-b82a-3f61933b5e50/numero-09.mp3" },
  { "pt": "Dez", "pat": "Mankoi hãpõhã", "audio": "/__l5e/assets-v1/c0bea070-f28f-4014-a5b7-0ca815f4f09f/numero-10.mp3" }
];

async function updateConfig() {
  const { error } = await supabase
    .from('site_config')
    .upsert({ 
      key: 'aprender_numeros', 
      value: NUMBERS_JSON,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating config:', error);
    process.exit(1);
  }
  console.log('Successfully updated aprender_numeros config with new audio URLs.');
}

updateConfig();
