
-- Recategorize Patxôhã dictionary entries so trilhas find more words.
-- Only touches entries currently in 'Geral' to preserve any manual curation.

-- SAUDAÇÕES
UPDATE public.dictionary SET category='Saudações'
WHERE language='Patxôhã' AND category='Geral' AND (
  term_pt ~* '\m(bom dia|boa tarde|boa noite|olá|ola|oi|tchau|adeus|até|ate logo|obrigad|agradec|saudação|saudacao|saudar|bem-vindo|bem vindo|paz|abraço|abraco|beijo|desculp|com licença|com licenca|por favor|prazer)\M'
);

-- FAMÍLIA
UPDATE public.dictionary SET category='Família'
WHERE language='Patxôhã' AND category='Geral' AND (
  term_pt ~* '\m(pai|mãe|mae|filho|filha|filhos|irmão|irmao|irmã|irma|avô|avo|avó|tio|tia|primo|prima|sobrinho|sobrinha|marido|esposa|esposo|namorad|família|familia|parente|parentes|cacique|pajé|paje|cunhad|sogr|padrinh|madrinh|nora|genro|bebê|bebe|criança|crianca|menino|menina|rapaz|moça|moca|homem|mulher|povo|aldeia|comunidade|ancião|anciao|anciã|ancia|jovem|velho|velha)\M'
);

-- NATUREZA
UPDATE public.dictionary SET category='Natureza'
WHERE language='Patxôhã' AND category='Geral' AND (
  term_pt ~* '\m(sol|lua|estrela|céu|ceu|nuvem|chuva|vento|trovão|trovao|relâmpago|relampago|arco-íris|arco iris|dia|noite|manhã|manha|tarde|madrugada|rio|mar|água|agua|lago|lagoa|cachoeira|córrego|corrego|nascente|fonte|terra|chão|chao|areia|pedra|pedras|montanha|morro|serra|mata|floresta|árvore|arvore|folha|folhas|flor|flores|raiz|raízes|raizes|semente|fruta|fruto|frutos|planta|capim|grama|erva|cipó|cipo|tronco|galho|madeira|pau|fogo|fumaça|fumaca|orvalho|neblina|estação|estacao|verão|verao|inverno|primavera|outono|natureza|mundo|universo|paisagem|caminho|trilha|floresta|selva|praia|ilha|vale|planície|planicie|barro|lama)\M'
);

-- ANIMAIS
UPDATE public.dictionary SET category='Animais'
WHERE language='Patxôhã' AND category='Geral' AND (
  term_pt ~* '\m(onça|onca|jaguar|gato|cachorro|cão|cao|cavalo|boi|vaca|porco|porca|coelho|galinha|galo|pato|ganso|peru|carneiro|ovelha|cabra|bode|macaco|mico|preguiça|preguica|tamanduá|tamandua|tatu|capivara|paca|cutia|veado|anta|jabuti|tartaruga|jacaré|jacare|cobra|serpente|lagarto|calango|iguana|peixe|piaba|tilápia|tilapia|pirarucu|tucunaré|tucunare|traíra|traira|tainha|tubarão|tubarao|golfinho|baleia|caranguejo|siri|camarão|camarao|lagosta|molusco|ostra|pássaro|passaro|ave|arara|papagaio|tucano|beija-flor|beija flor|coruja|urubu|gavião|gaviao|águia|aguia|pomba|pombo|galo|pintinho|garça|garca|marreco|codorna|inseto|abelha|marimbondo|formiga|besouro|borboleta|mosca|mosquito|aranha|escorpião|escorpiao|minhoca|caracol|lagartixa|sapo|rã|ra|bicho|animal|animais|caça|caca|manada|bando|rebanho)\M'
);
