-- ============================================================
-- LMS: seed trilha global "Perfumaria de Alto Nivel" (13 modulos)
-- 13 modulos, 13 aulas, 13 provas, 65 questoes.
-- ============================================================

insert into public.trilhas
  (id, tenant_id, titulo, descricao, publico_alvo, ordem, ativa, icon, cor, is_global)
values
('c292be32-c51d-4e1f-b9d4-19154cd679df', NULL, 'Perfumaria de Alto Nível', 'História, anatomia, famílias olfativas, ingredientes, grandes casas, perfumaria árabe e de nicho, técnicas de venda e inteligência de mercado para Ciudad del Este.', NULL, 11, true, '🌸', '#EC4899', true);

insert into public.modulos
  (id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima, tenant_id)
values
('47bec511-c35c-4770-a12b-2a005f1c2a3a', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'História da Perfumaria', 'Da Mesopotâmia ao boom árabe moderno: origem, evolução, as quatro grandes escolas e a indústria por trás das marcas.', 0, 100, 70, NULL),
('dce87396-352c-49ac-bab6-c72357b5bf76', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Anatomia de um Perfume', 'Pirâmide olfativa, concentrações (EDC/EDT/EDP/Extrait), fixação, projeção e drydown.', 1, 100, 70, NULL),
('40508d3a-b5e4-4830-a56c-77234addee8c', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Famílias Olfativas', 'As 16 famílias — cítricos, amadeirados, orientais, gourmand, oud e mais — com ocasião, público e exemplos.', 2, 100, 70, NULL),
('7728d41b-e290-47b8-8e76-120a79413ed3', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Ingredientes da Perfumaria', 'Oud, âmbar, almíscar, rosa, jasmim, açafrão, íris e mais — origem, custo e por que justificam o preço.', 3, 100, 70, NULL),
('b18820ff-c171-419a-a99d-e9c41b921266', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Grandes Casas de Perfumaria', 'Dior, Chanel, YSL, Creed, MFK, Xerjoff, Amouage e mais — identidade, público e posicionamento competitivo.', 4, 100, 70, NULL),
('8b424d43-3284-41f4-b441-6ddef027b80d', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Perfumaria Árabe', 'Tradição, diferenças vs. ocidental, matérias-primas e as principais marcas (Lattafa, Armaf, Rasasi e mais).', 5, 100, 70, NULL),
('7d72dcda-d39f-4d6a-b99b-edac7f5f8b8f', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Perfumaria de Nicho', 'Exclusividade, criação artística, público-alvo e como vender nicho sem competir em preço.', 6, 100, 70, NULL),
('e655a2a6-95e2-4207-8913-bfe3825aa5b1', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Como Descobrir o Perfume Ideal', 'Fluxograma de decisão, perguntas-chave e mapa rápido perfil → família olfativa.', 7, 100, 70, NULL),
('34ddc944-d9ef-479e-afd9-7b3b71f2fb59', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Comparações Inteligentes', 'Como responder "quero algo parecido com..." sem nunca dizer "é igual" — a regra de ouro do cross-sell.', 8, 100, 70, NULL),
('7b16a51f-83cf-4ec7-834c-e46996d6f3c5', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Técnicas de Venda para Perfumaria', 'Abordagem, demonstração com blotters, storytelling, construção de desejo e fechamento assumido.', 9, 100, 70, NULL),
('26be75bd-8c38-4bb7-b6df-7b412df40f2a', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Mercado de Ciudad del Este', 'Perfis de clientes (brasileiro, paraguaio, argentino, turista, revendedor), sazonalidade e diferencial competitivo local.', 10, 100, 70, NULL),
('12f17d8a-e511-432e-b9f0-d4a39aa70bb2', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Inteligência Comercial', 'Como usar o catálogo da loja para mapear lacunas, sugerir aquisições, kits e cross-sell com base em margem e tendência.', 11, 100, 70, NULL),
('9c4fd692-418c-4aa8-9924-b1341cd635fa', 'c292be32-c51d-4e1f-b9d4-19154cd679df', 'Simulações Reais de Atendimento', 'Cenários práticos de atendimento — do indiciso ao revendedor — para aplicar tudo o que foi aprendido.', 12, 100, 70, NULL);

insert into public.aulas
  (id, tenant_id, modulo_id, titulo, tipo_conteudo, url_midia, conteudo_texto, ordem, is_global, slides, xp_reward)
values
('aa8a580b-c584-4cfb-8476-abc0ce38c5ca', NULL, '47bec511-c35c-4770-a12b-2a005f1c2a3a', 'História da Perfumaria', 'texto', NULL, '
<h2>Origem — o começo de tudo</h2>
<p><strong>Per fumum</strong> = "através da fumaça" (latim). O primeiro uso registrado de fragrâncias foi queimar madeiras, resinas e ervas em rituais religiosos.</p>
<p><strong>Egito (4000 a.C.):</strong> perfume era tecnologia espiritual. Sacerdotes queimavam <em>kyphi</em> (resinas + mirra + vinho + mel) nos templos.</p>
<p><strong>Grécia e Roma:</strong> gregos criaram os primeiros perfumes líquidos (infusões em azeite). Roma popularizou o consumo em massa.</p>
<p><strong>Pérsia/Mundo Árabe (800-1400 d.C.):</strong> Ibn Sina (Avicena) inventou a <strong>destilação a vapor</strong> — técnica que até hoje extrai óleos essenciais. Os árabes dominaram o comércio de oud, rosa de Damasco e âmbar cinza.</p>

<h2>Evolução — do Oriente à Europa</h2>
<p><strong>1370:</strong> Água da Rainha da Hungria — primeiro perfume alcoólico (alecrim em álcool). Antes disso, tudo era óleo ou resina.</p>
<p><strong>1533:</strong> Catarina de Médici leva seu perfumista para Paris — início da supremacia francesa.</p>
<p><strong>Grasse (séc. XVII):</strong> capital mundial dos ingredientes. Jasmim de Grasse: € 40.000-80.000/kg de absoluto.</p>
<p><strong>1868:</strong> William Perkin sintetiza a cumarina — primeira molécula sintética. <strong>1882:</strong> Fougère Royale, primeiro perfume com sintéticos intencionais. <strong>1921:</strong> Chanel N°5 — aldeídos sintéticos + naturais, assinatura impossível na natureza.</p>

<h2>As quatro grandes escolas</h2>
<table>
<tr><th>Escola</th><th>Filosofia</th><th>Características</th><th>Casas</th></tr>
<tr><td>🇫🇷 Francesa</td><td>Arte, equilíbrio, sofisticação</td><td>Pirâmide clássica, florais refinados, aldeídos</td><td>Chanel, Dior, Guerlain, Hermès</td></tr>
<tr><td>🇮🇹 Italiana</td><td>Frescor mediterrâneo</td><td>Cítricos, aquático-verde, elegância discreta</td><td>Acqua di Parma, Armani, Bvlgari</td></tr>
<tr><td>🇸🇦 Árabe</td><td>Identidade, status, espiritualidade</td><td>Concentração altíssima, oud, fixação 12-24h+</td><td>Amouage, Al Haramain, Rasasi</td></tr>
<tr><td>🌏 Oriental/Asiática</td><td>Misticismo, minimalismo</td><td>Oud cambojano suave, incenso, wabi-sabi</td><td>Comme des Garçons, Caron</td></tr>
</table>
<p><strong>Diferença cultural fundamental:</strong> no Ocidente o perfume é discrição; no mundo árabe, perfume forte é respeito — cheiro notável marca presença.</p>

<h2>Perfumaria comercial vs. artística</h2>
<table>
<tr><th>Critério</th><th>Comercial</th><th>Artística/Nicho</th></tr>
<tr><td>Objetivo</td><td>Vender muito</td><td>Expressar ideia olfativa</td></tr>
<tr><td>Orçamento</td><td>Controlado por flacon</td><td>Ilimitado — ingrediente manda</td></tr>
<tr><td>Processo</td><td>Marketing → fórmula</td><td>Fórmula → marketing</td></tr>
<tr><td>Preço/ml</td><td>R$ 3-15</td><td>R$ 20-100+</td></tr>
</table>
<p><strong>Ponto prático:</strong> quando o cliente diz "quero algo que ninguém tenha", ele está pedindo para sair do comercial e entrar no artístico — novo ticket.</p>

<h2>A indústria por trás das marcas</h2>
<p>A maioria das marcas não fabrica seus próprios perfumes — contrata casas de fragrância: <strong>IFF</strong> (EUA), <strong>Givaudan</strong> (Suíça — Chanel, Dior, Hermès), <strong>Firmenich/dsm-firmenich</strong>, <strong>Symrise</strong> (Armani, Hugo Boss), <strong>Mane</strong>, <strong>Robertet</strong>.</p>
<p>Processo: Brief → Perfumista (Nose) → Desenvolvimento (anos) → Aprovação interna → Aprovação <strong>IFRA</strong> (regula ingredientes por segurança/alergia) → Produção → Lançamento. Um perfume pode levar 3-7 anos.</p>
<p><strong>IFRA</strong> explica por que clássicos antigos (ex.: Fahrenheit) cheiram diferente hoje — restrição de ingredientes como oakmoss.</p>

<h2>Linha do tempo</h2>
<p>4000 a.C. Egito → 800 d.C. Avicena/destilação → 1370 primeiro alcoólico → 1533 Catarina de Médici → 1700s Grasse → 1868 cumarina sintética → 1882 Fougère Royale → 1921 Chanel N°5 → 1966 Eau Sauvage → 1992 Acqua di Gio → 2010 Aventus → 2015 Baccarat Rouge 540 → 2021+ boom árabe no Ocidente.</p>
      ', 0, true, NULL, 10),
('d7b68805-0366-42eb-bd3a-5b9e4ee078ae', NULL, 'dce87396-352c-49ac-bab6-c72357b5bf76', 'Anatomia de um Perfume', 'texto', NULL, '
<h2>Pirâmide olfativa</h2>
<ul>
<li><strong>Notas de saída (0-15 min):</strong> cítricos e frescos — primeira impressão, evaporam rápido.</li>
<li><strong>Notas de coração (15 min-2h):</strong> florais e especiarias — a "alma" do perfume, o que os outros sentem ao longo do dia.</li>
<li><strong>Notas de fundo (2h-12h+):</strong> madeiras, almíscar, âmbar — o que fica na pele/roupa no fim do dia.</li>
</ul>
<p><strong>Argumento de venda:</strong> "Se você só sentiu o cítrico, sentiu só a saída. Deixa 20 minutos na pele e eu te mostro o coração e o fundo."</p>

<h2>Concentração — EDC, EDT, EDP, Parfum/Extrait</h2>
<table>
<tr><th>Sigla</th><th>Nome</th><th>% óleo</th><th>Duração</th></tr>
<tr><td>EDC</td><td>Eau de Cologne</td><td>2-5%</td><td>2-3h</td></tr>
<tr><td>EDT</td><td>Eau de Toilette</td><td>5-15%</td><td>3-5h</td></tr>
<tr><td>EDP</td><td>Eau de Parfum</td><td>15-20%</td><td>6-8h</td></tr>
<tr><td>Parfum/Extrait</td><td>Extrato puro</td><td>20-40%</td><td>10h+</td></tr>
</table>
<p><strong>Erro comum:</strong> achar que EDP é "sempre melhor". Cítricos frescos costumam funcionar melhor em EDT. Árabes fogem da tabela: "EDP" rotulado muitas vezes tem 25-30% real, equivalente a Extrait ocidental.</p>

<h2>Fixação, projeção e performance</h2>
<p><strong>Fixação</strong> = quanto tempo dura na pele. <strong>Projeção (sillage)</strong> = raio de alcance do cheiro. <strong>Performance</strong> = soma das duas.</p>
<p>Fatores que influenciam: tipo de pele (oleosa retém mais), hidratação prévia, temperatura corporal, clima (calor/umidade de CDE acelera projeção e evaporação), concentração de ingredientes pesados, local de aplicação (pulso/pescoço fixam mais).</p>

<h2>Drydown — evolução na pele</h2>
<p>Perfume nunca cheira igual do início ao fim. <strong>Drydown</strong> é o estágio final, só notas de fundo. Técnica de venda: aplique no blotter, deixe o cliente circular pela loja, volte em 5-10 min para sentir de novo — evita compra por impulso que vira arrependimento.</p>
      ', 0, true, NULL, 10),
('da099727-13da-4156-b90a-d01fadf7feb9', NULL, '40508d3a-b5e4-4830-a56c-77234addee8c', 'Famílias Olfativas', 'texto', NULL, '
<h2>As 16 famílias olfativas</h2>
<table>
<tr><th>Família</th><th>Sensação</th><th>Ocasião</th><th>Exemplos</th></tr>
<tr><td>Cítricos</td><td>Frescor instantâneo, energia</td><td>Dia, clima quente</td><td>Acqua di Gio, Light Blue</td></tr>
<tr><td>Aromáticos</td><td>Fresco-herbáceo, clássico masculino</td><td>Dia a dia, trabalho</td><td>Drakkar Noir, Azzaro pour Homme</td></tr>
<tr><td>Amadeirados</td><td>Quente, sofisticado, terroso</td><td>Tarde/noite, ano todo</td><td>Terre d''Hermès, Santal 33</td></tr>
<tr><td>Orientais</td><td>Envolvente, sensual, quente</td><td>Noite</td><td>Opium, Black Orchid, Spicebomb</td></tr>
<tr><td>Âmbar</td><td>Dourada, quente, doce-resinosa</td><td>Muito usado em árabes</td><td>Ambre Sultan, Al Haramain Amber Oud</td></tr>
<tr><td>Gourmand</td><td>Doce, comestível, jovem</td><td>Casual, encontros</td><td>La Vie est Belle, Lost Cherry</td></tr>
<tr><td>Florais</td><td>Romântica, feminina clássica</td><td>Dia/noite</td><td>Chanel N°5, J''adore</td></tr>
<tr><td>Aquáticos</td><td>Limpa, jovem, esportiva</td><td>Verão, dia</td><td>Cool Water, Acqua di Gio</td></tr>
<tr><td>Verdes</td><td>Natural, crisp, discreta</td><td>Dia, clima ameno</td><td>Chanel N°19</td></tr>
<tr><td>Frutados</td><td>Doce-frutada, sem ser gourmand</td><td>Casual, dia</td><td>DKNY Be Delicious, Flowerbomb</td></tr>
<tr><td>Especiados</td><td>Quente, picante, marcante</td><td>Noite</td><td>Spicebomb, YSL Opium</td></tr>
<tr><td>Couro</td><td>Intensa, "old money"</td><td>Noite, outono</td><td>Tuscan Leather, Knize Ten</td></tr>
<tr><td>Tabaco</td><td>Envolvente, aconchegante</td><td>Noite, frio</td><td>Tobacco Vanille, Tabac Blond</td></tr>
<tr><td>Incenso</td><td>Espiritual, mística</td><td>Noite, formal</td><td>Amouage Interlude</td></tr>
<tr><td>Oud</td><td>Intensa, luxuosa, polarizadora</td><td>Noite, eventos, inverno</td><td>Oud Wood, Rasasi Hawas</td></tr>
<tr><td>Almiscarados</td><td>"Pele limpa", suave, universal</td><td>Dia a dia, base de outras famílias</td><td>Musc Ravageur, The One</td></tr>
</table>

<h2>Tabela-resumo para o balcão</h2>
<table>
<tr><th>Energia</th><th>Melhor horário</th><th>Cliente típico</th></tr>
<tr><td>Cítricos/Aquáticos — alta, leve</td><td>Manhã/dia</td><td>Jovem, casual</td></tr>
<tr><td>Florais/Frutados — média, romântica</td><td>Dia</td><td>Feminino amplo</td></tr>
<tr><td>Amadeirados/Verdes — média, sofisticada</td><td>Tarde</td><td>Profissional</td></tr>
<tr><td>Orientais/Âmbar/Especiados — alta, densa</td><td>Noite</td><td>Quer presença</td></tr>
<tr><td>Gourmand — doce, jovem</td><td>Casual/noite</td><td>Jovem descontraído</td></tr>
<tr><td>Couro/Tabaco/Incenso/Oud — muito alta</td><td>Noite/inverno</td><td>Maduro/nicho/árabe</td></tr>
</table>
<p><strong>Exercício de olfato:</strong> classifique perfumes do estoque em família principal + secundária — treina o julgamento rápido no balcão.</p>
      ', 0, true, NULL, 10),
('414bc546-b5ec-4c38-8942-3b28dbe4fe7e', NULL, '7728d41b-e290-47b8-8e76-120a79413ed3', 'Ingredientes da Perfumaria', 'texto', NULL, '
<h2>Ingredientes-chave</h2>
<ul>
<li><strong>Oud</strong> — madeira de Aquilaria infectada por fungo (Sudeste Asiático). Fumado, animal, terroso. Pode passar US$ 30.000/kg. Símbolo máximo de luxo árabe.</li>
<li><strong>Âmbar</strong> — ambergris natural (raríssimo) ou labdano+baunilha sintético. Doce, salgado, quente. Base de quase todo oriental.</li>
<li><strong>Almíscar</strong> — hoje 100% sintético. "Pele limpa", sensual. Está em praticamente todo perfume moderno.</li>
<li><strong>Baunilha</strong> — vagem de orquídea (Madagascar). Doce, cremosa. Ingrediente mais "comercialmente seguro" do mundo.</li>
<li><strong>Vetiver</strong> — raiz (Haiti/Indonésia). Terroso, verde. Pilar da perfumaria masculina francesa.</li>
<li><strong>Sândalo</strong> — madeira (Índia/Austrália, Mysore protegido). Cremoso, amanteigado. Ingrediente "abraço".</li>
<li><strong>Patchouli</strong> — folha (Indonésia). Terroso-doce. Virou luxo moderno (Coco Mademoiselle).</li>
<li><strong>Bergamota</strong> — cítrico de Calábria. Está em ~50% dos perfumes do mundo.</li>
<li><strong>Rosa</strong> — Bulgária/Damasco. 4 toneladas de pétalas = 1kg de óleo. Rainha do coração floral.</li>
<li><strong>Jasmim</strong> — Grasse/Egito/Índia. Floral indólico sensual, colheita manual noturna.</li>
<li><strong>Açafrão (saffron)</strong> — Irã. Especiaria mais cara do mundo. Assinatura de Dior Homme Intense, Baccarat Rouge.</li>
<li><strong>Íris (Orris)</strong> — Itália/Marrocos, processo de 3 anos. Um dos ingredientes mais caros do mundo — sinônimo de luxo silencioso.</li>
<li><strong>Fava Tonka</strong> — América do Sul. Amêndoa/baunilha/feno — fixador de Tobacco Vanille, La Nuit de l''Homme.</li>
<li><strong>Cedro</strong> — Virgínia/Atlas. Barato e versátil — workhorse da indústria.</li>
<li><strong>Couro</strong> — reconstrução sintética (não é destilável). Old-money.</li>
<li><strong>Resinas</strong> (mirra, olíbano/incenso, benjoim, labdano) — Omã/Somália/Etiópia. Ponte entre perfumaria árabe e nicho ocidental.</li>
</ul>

<h2>Custo — o argumento irrefutável de preço</h2>
<table>
<tr><th>Ingrediente</th><th>Custo/kg (natural)</th><th>Por que vale o preço</th></tr>
<tr><td>Oud natural</td><td>US$ 10.000-30.000+</td><td>Raridade extrema, infecção natural</td></tr>
<tr><td>Rosa de Damasco</td><td>US$ 5.000-10.000</td><td>4 toneladas de pétalas = 1kg de óleo</td></tr>
<tr><td>Jasmim Grasse</td><td>US$ 4.000-8.000</td><td>Colheita manual noturna</td></tr>
<tr><td>Íris (Orris)</td><td>US$ 50.000+</td><td>3 anos de processo, rendimento baixíssimo</td></tr>
<tr><td>Sândalo Mysore</td><td>US$ 2.000-3.000</td><td>Proteção ambiental, escassez</td></tr>
<tr><td>Açafrão</td><td>US$ 5.000-10.000</td><td>Especiaria mais cara do mundo</td></tr>
<tr><td>Almíscar sintético</td><td>US$ 50-200</td><td>Produção em massa</td></tr>
<tr><td>Cedro</td><td>US$ 20-50</td><td>Abundante</td></tr>
</table>
<p><strong>Uso na venda:</strong> cliente questiona preço de nicho com oud/açafrão/íris → explique o custo real da matéria-prima. Vira argumento irrefutável.</p>
      ', 0, true, NULL, 10),
('620a3e5f-7232-491d-974c-c1727379ea20', NULL, 'b18820ff-c171-419a-a99d-e9c41b921266', 'Grandes Casas de Perfumaria', 'texto', NULL, '
<h2>Designers clássicos</h2>
<ul>
<li><strong>Dior</strong> — luxo francês clássico e moderno. Mais vendidos: Sauvage, J''adore, Miss Dior.</li>
<li><strong>Chanel</strong> — elegância atemporal. N°5, Bleu de Chanel, Coco Mademoiselle. Dona dos próprios campos de flores em Grasse.</li>
<li><strong>YSL</strong> — ousadia e sensualidade. Black Opium, Libre, Y. Forte apelo jovem/TikTok.</li>
<li><strong>Armani</strong> — minimalismo italiano. Acqua di Gio, Si, Code.</li>
<li><strong>Versace</strong> — máxima italiana vibrante. Eros, Dylan Blue.</li>
<li><strong>Prada</strong> — intelectual, notas incomuns (chá, íris). Luna Rossa, Paradoxe.</li>
<li><strong>Jean Paul Gaultier</strong> — lavanda+baunilha, frasco corpo humano. Le Male, Scandal.</li>
<li><strong>Paco Rabanne</strong> — futurista, jovem/balada. 1 Million, Invictus, Phantom.</li>
<li><strong>Carolina Herrera</strong> — forte conexão latina. Good Girl, 212, Bad Boy.</li>
<li><strong>Givenchy / Hermès</strong> — heritage parisiense; Hermès é o "perfume que não cheira a perfume" (Terre d''Hermès).</li>
</ul>

<h2>Nicho premium e artístico</h2>
<ul>
<li><strong>Tom Ford</strong> — luxo ousado. Tobacco Vanille, Oud Wood, Black Orchid.</li>
<li><strong>Creed</strong> — heritage aristocrático desde 1760. <strong>Aventus</strong> é o perfume mais hypado da década.</li>
<li><strong>Maison Francis Kurkdjian (MFK)</strong> — precisão técnica. <strong>Baccarat Rouge 540</strong> é referência de comparação viral.</li>
<li><strong>Parfums de Marly</strong> — alternativa acessível a Creed/MFK. Layton, Herod, Delina.</li>
<li><strong>Xerjoff</strong> — maximalismo italiano, projeção e fixação extremas. Naxos, Erba Pura.</li>
<li><strong>Amouage</strong> — realeza de Omã, oud/incenso com técnica francesa. Interlude Man.</li>
<li><strong>Byredo / Diptyque</strong> — minimalismo escandinavo/parisiense boêmio.</li>
<li><strong>Initio</strong> — "perfumaria psicotrópica", marketing de perfume viciante.</li>
<li><strong>Mancera / Montale</strong> — francesa com forte influência árabe, ótimo custo-benefício em oud/rosa.</li>
</ul>

<h2>Posicionamento competitivo</h2>
<table>
<tr><th>Faixa</th><th>Marcas</th><th>Perfil de cliente</th></tr>
<tr><td>Entrada/jovem</td><td>Paco Rabanne, Versace, JPG</td><td>Balada, 18-28 anos</td></tr>
<tr><td>Profissional clássico</td><td>Dior, Armani, Hermès</td><td>25-45, trabalho/dia a dia</td></tr>
<tr><td>Luxo aspiracional</td><td>Carolina Herrera, Givenchy, YSL</td><td>Quer status visível</td></tr>
<tr><td>Nicho acessível</td><td>Mancera, Montale, Nishane</td><td>Quer diferenciação</td></tr>
<tr><td>Nicho premium</td><td>Creed, MFK, Xerjoff, Tom Ford</td><td>Alto poder aquisitivo</td></tr>
<tr><td>Nicho artístico extremo</td><td>Amouage, Byredo, Diptyque, Initio</td><td>Colecionador avançado</td></tr>
</table>
      ', 0, true, NULL, 10),
('f49fd08b-24bf-4456-89c0-8317b4f628ce', NULL, '8b424d43-3284-41f4-b441-6ddef027b80d', 'Perfumaria Árabe', 'texto', NULL, '
<h2>História e cultura</h2>
<p>Perfume no mundo árabe é tradição religiosa e social — perfumar-se antes da oração é prática recomendada. Perfume não é vaidade, é respeito ao próximo e a Deus.</p>

<h2>Diferenças vs. ocidental</h2>
<table>
<tr><th>Aspecto</th><th>Ocidental</th><th>Árabe</th></tr>
<tr><td>Objetivo</td><td>Discrição sutil</td><td>Presença forte, generosidade olfativa</td></tr>
<tr><td>Concentração</td><td>EDT/EDP padronizado</td><td>"EDP" muitas vezes = extrait real</td></tr>
<tr><td>Ingrediente-chave</td><td>Varia por família</td><td>Oud, âmbar, almíscar, açafrão quase sempre</td></tr>
<tr><td>Fixação</td><td>Moderada</td><td>Extrema (12-24h+)</td></tr>
<tr><td>Aplicação</td><td>Pulsos discretos</td><td>Roupa, cabelo, múltiplos pontos</td></tr>
</table>
<p>Matérias-primas típicas: oud, rosa de Taif, âmbar, almíscar, açafrão, sândalo, incenso/bakhoor.</p>

<h2>Marcas árabes principais</h2>
<ul>
<li><strong>Lattafa</strong> — maior fenômeno viral. Khamrah (≈ Tobacco Vanille), Yara (≈ La Vie est Belle), Asad (≈ Le Male Elixir). Excelente custo-benefício.</li>
<li><strong>Afnan</strong> — linha "9 PM" (≈ Sauvage/Bleu de Chanel doce), Supremacy (≈ 1 Million/Aventus).</li>
<li><strong>Armaf</strong> — Club de Nuit Intense Man, o "dupe" mais famoso de Aventus.</li>
<li><strong>Maison Alhambra</strong> — ampla linha de inspirados, preço médio.</li>
<li><strong>Rasasi</strong> — mais premium. Hawas (amadeirado-aquático), La Yuqawam (oriental-especiado). Porta de entrada para o luxo árabe genuíno.</li>
<li><strong>Al Haramain</strong> — tradição mais antiga, foco em oud/âmbar puros. Amber Oud.</li>
<li><strong>Swiss Arabian</strong> — tradição árabe + técnica suíça.</li>
<li><strong>Fragrance World</strong> — dupes fiéis a nichos caros (Xerjoff, Initio) por fração do preço.</li>
<li><strong>Khadlaj, Ajmal</strong> — foco em oud tradicional e attars (óleos sem álcool).</li>
</ul>

<h2>Como vender árabe para quem só conhece designer</h2>
<ol>
<li>Identifique o designer de referência do cliente</li>
<li>Apresente o árabe equivalente como "mesma família olfativa, fixação muito maior, preço melhor"</li>
<li>Nunca diga "cópia" — diga "inspirado" ou "mesma linha olfativa"</li>
<li>Deixe testar e esperar — a fixação árabe é o argumento mais forte, vendido pelo tempo, não pela primeira impressão</li>
</ol>
      ', 0, true, NULL, 10),
('591e0fd1-b3b9-40e9-ac70-61a21cf5fa3c', NULL, '7d72dcda-d39f-4d6a-b99b-edac7f5f8b8f', 'Perfumaria de Nicho', 'texto', NULL, '
<h2>Conceito</h2>
<p>Perfumaria de nicho = produção limitada, conceito artístico não comercial, ingredientes sem limite orçamentário, distribuição seletiva.</p>

<h2>Exclusividade e criação artística</h2>
<p>Vendida não em todo shopping — reforça status. O cliente de nicho busca não cheirar a todo mundo. O perfumista assina a obra como um artista plástico assina um quadro — Francis Kurkdjian, Christopher Sheldrake, Dominique Ropion são nomes reconhecidos por entusiastas.</p>

<h2>Público</h2>
<p>Conhecedor, colecionador, ou aspiracional que busca diferenciação. Geralmente 28+, alto poder aquisitivo ou disposto a investir em poucas peças de qualidade.</p>

<h2>Designer vs. Nicho</h2>
<table>
<tr><th></th><th>Designer</th><th>Nicho</th></tr>
<tr><td>Distribuição</td><td>Massiva</td><td>Seletiva</td></tr>
<tr><td>Orçamento ingrediente</td><td>Limitado</td><td>Livre</td></tr>
<tr><td>Marketing</td><td>Celebridades, campanhas</td><td>Boca a boca, comunidade</td></tr>
<tr><td>Risco de "cheirar igual outro"</td><td>Alto</td><td>Baixo</td></tr>
<tr><td>Argumento de venda</td><td>Reconhecimento de marca</td><td>Exclusividade + qualidade</td></tr>
</table>
<p><strong>Venda de nicho:</strong> não compete em preço. Compete em história, raridade e identidade pessoal. Cliente de nicho quer ouvir sobre o perfumista, o conceito, os ingredientes raros — não sobre desconto.</p>
      ', 0, true, NULL, 10),
('f3084cc1-ce2e-499c-85f8-6ac7846cd42a', NULL, 'e655a2a6-95e2-4207-8913-bfe3825aa5b1', 'Como Descobrir o Perfume Ideal', 'texto', NULL, '
<h2>Fluxograma de decisão</h2>
<p>Cliente entra → "Já tem um perfume que gosta hoje?"</p>
<ul>
<li><strong>Sim:</strong> identificar família do perfume atual → oferecer mesma família + upgrade ou variação.</li>
<li><strong>Não:</strong> perguntas de perfil (idade/profissão, ocasião, estilo pessoal, orçamento, clima preferido) → sugerir família baseada no perfil.</li>
</ul>
<p>Depois: testar 2-3 opções (blotter) → esperar 5-10 min (drydown) → fechar com argumento técnico + oferecer upsell (kit/tamanho maior).</p>

<h2>Perguntas-chave por dimensão</h2>
<ul>
<li><strong>Personalidade:</strong> "Você prefere passar despercebido ou que notem quando você chega?"</li>
<li><strong>Idade/profissão:</strong> indica formalidade (executivo → mais clássico; jovem/criativo → mais ousado)</li>
<li><strong>Estilo:</strong> observe roupa e acessórios — combine estética com olfato</li>
<li><strong>Clima:</strong> CDE é quente/úmido — cítricos/aquáticos performam melhor de dia; orientais/oud funcionam à noite mesmo no calor</li>
<li><strong>Ocasião:</strong> dia a dia, trabalho, balada, presente, casamento</li>
<li><strong>Orçamento:</strong> perguntar com tato — "qual faixa você tinha em mente?" abre espaço para upsell consultivo</li>
</ul>

<h2>Mapa rápido perfil → família</h2>
<table>
<tr><th>Perfil</th><th>Família sugerida</th></tr>
<tr><td>Jovem, balada, chamar atenção</td><td>Doce-amadeirado, especiado (1 Million, Supremacy)</td></tr>
<tr><td>Executivo, discreto</td><td>Amadeirado/cítrico clean (Terre d''Hermès, Bleu de Chanel)</td></tr>
<tr><td>Mulher romântica/clássica</td><td>Floral (J''adore, Good Girl)</td></tr>
<tr><td>Mulher moderna/doce</td><td>Gourmand (La Vie est Belle, Lattafa Yara)</td></tr>
<tr><td>Busca exclusividade</td><td>Nicho (MFK, Xerjoff, Amouage)</td></tr>
<tr><td>Quer fixação máxima</td><td>Árabe oud/âmbar (Rasasi, Al Haramain)</td></tr>
<tr><td>Custo-benefício</td><td>Lattafa, Armaf, Afnan</td></tr>
</table>
      ', 0, true, NULL, 10),
('73628541-55cf-4e95-90b0-963d1efa56bb', NULL, '34ddc944-d9ef-479e-afd9-7b3b71f2fb59', 'Comparações Inteligentes', 'texto', NULL, '
<h2>A regra de ouro</h2>
<p>Nunca diga "é igual". Diga <strong>"é da mesma família, com essa diferença específica..."</strong> — isso constrói confiança e evita decepção pós-compra.</p>

<h2>Casos práticos</h2>
<p><strong>"Quero algo parecido com Bleu de Chanel."</strong><br>Vantagem do original: heritage Chanel, refinamento incomparável. Alternativas: Afnan 9 PM (mais doce, mais barato), Armaf Club de Nuit Blue. Explique: "é da mesma família amadeirada-aquática, mas o Chanel tem uma suavidade que só a casa consegue — esses são ótimos para o dia a dia sem gastar tanto."</p>
<p><strong>"Tem algo semelhante ao Baccarat Rouge?"</strong><br>Original: açafrão + âmbar + madeira, assinatura MFK, viral. Alternativas: Lattafa Ameer Al Oudh, Fragrance World Privé Rouge. Explique: "o BR540 tem uma pureza de ingrediente insubstituível 100%, mas pega 80% da experiência por 10% do preço."</p>
<p><strong>"Algo igual ao Aventus."</strong><br>Original: abacaxi defumado + bétula + almíscar, ícone de status. Alternativa: Armaf Club de Nuit Intense Man — o dupe mais respeitado do mercado.</p>
<p><strong>"Quero um perfume que fixe muito."</strong><br>Direcione para árabe oud/âmbar ou nicho denso (Xerjoff, Tom Ford). Evite cítricos puros — eduque sobre por que (moléculas leves evaporam rápido).</p>
<p><strong>"Quero algo que ninguém tenha."</strong><br>Direcione para nicho menos popular (não MFK/BR540, que já virou mainstream) — Nishane, Initio, linhas mais autorais. Venda sobre exclusividade genuína, ticket mais alto.</p>
      ', 0, true, NULL, 10),
('1ba2e7a8-56ca-435e-aa95-2873350e8518', NULL, '7b16a51f-83cf-4ec7-834c-e46996d6f3c5', 'Técnicas de Venda para Perfumaria', 'texto', NULL, '
<h2>Abordagem e entrevista consultiva</h2>
<p>Nunca "posso ajudar?" (gera "não, só olhando"). Use abertura observacional: <em>"Vi que você parou nessa linha árabe — já usou oud antes?"</em> Faça 3-4 perguntas abertas antes de mostrar produto.</p>

<h2>Demonstração correta</h2>
<p>Blotter primeiro (nunca aplique direto na pele do cliente sem perguntar). Máximo 3 perfumes por vez — o nariz satura depois disso. Identifique cada blotter (caneta), espace o teste em 5 min entre cada. Reserve a pele para o favorito final — pulso, sem esfregar (esfregar quebra moléculas e altera o cheiro).</p>

<h2>Storytelling e venda por emoção</h2>
<p>Sempre conecte com história/ingrediente — história vende mais que especificação técnica fria. Pergunte <em>"como você quer se sentir usando isso?"</em> — não "qual perfume você quer". Pessoas compram identidade, não líquido.</p>

<h2>Construção de desejo</h2>
<p>Crie escassez genuína ("essa linha de oud é edição limitada da importadora"). Mostre o produto com cuidado — ritual de abrir a caixa, apresentar o frasco.</p>

<h2>Fechamento e pós-venda</h2>
<p>Nunca pergunte "vai levar?". Pergunte <strong>"prefere o de 50ml ou já leva o de 100ml que sai melhor o custo por ml?"</strong> — fechamento assumido + upsell embutido. No pós-venda, ensine a aplicação correta (pulsos, sem esfregar) e ofereça voltar para indicar combinações futuras — constrói recompra.</p>
      ', 0, true, NULL, 10),
('5997563c-b784-4002-a51a-8624a0992419', NULL, '26be75bd-8c38-4bb7-b6df-7b412df40f2a', 'Mercado de Ciudad del Este', 'texto', NULL, '
<h2>Perfis de cliente e como adaptar</h2>
<table>
<tr><th>Perfil</th><th>Comportamento</th><th>Como adaptar</th></tr>
<tr><td>Brasileiro</td><td>Pesquisa preço antes, compara com Brasil/online, busca "achado". Vem com lista mental de marcas famosas (Sauvage, BR540).</td><td>Mostre vantagem de preço CDE vs Brasil, valide a escolha e ofereça upgrade/alternativa de maior margem</td></tr>
<tr><td>Paraguaio</td><td>Cliente recorrente/local, conhece a loja, valoriza relacionamento e fidelidade.</td><td>Invista em atendimento de longo prazo, lembre preferências, ofereça lançamentos primeiro a ele</td></tr>
<tr><td>Argentino</td><td>Busca dólar/preço bom por câmbio, costuma comprar em quantidade/revenda informal.</td><td>Trabalhe preço por volume, combos</td></tr>
<tr><td>Turista geral</td><td>Pouco tempo, decisão rápida, quer "o melhor para levar".</td><td>Seja direto, 2-3 opções no máximo, destaque o que é "exclusivo de loja de fronteira"</td></tr>
<tr><td>Revendedor</td><td>Foco em margem e giro, não em história do perfume.</td><td>Fale números: preço de tabela, performance/preço, o que vende mais rápido</td></tr>
</table>

<h2>Sazonalidade</h2>
<p>Dezembro (Natal/Ano Novo) e datas de presente (Dia das Mães, Namorados) — pico de fluxo, prepare kits prontos. Verão (calor extremo) — cítricos/aquáticos vendem mais de dia, oud/âmbar ainda vendem para presença noturna.</p>

<h2>Diferencial competitivo local</h2>
<p>O mercado local é saturado de lojas vendendo os mesmos dupes árabes. <strong>O diferencial real está no atendimento consultivo</strong> — a maioria das lojas só empurra preço, você vende conhecimento. Tendência regional forte: TikTok/Instagram — clientes já chegam pedindo "aquele que viralizou" (geralmente BR540, Lattafa Khamrah, Armaf Club de Nuit). Fique atualizado nessas redes constantemente.</p>
      ', 0, true, NULL, 10),
('cb0097b9-43a0-4ca5-b97e-b57235c20046', NULL, '12f17d8a-e511-432e-b9f0-d4a39aa70bb2', 'Inteligência Comercial', 'texto', NULL, '
<h2>Do vendedor ao estrategista</h2>
<p>Depois de dominar produto, história e técnica de venda, o próximo passo é pensar como gestor de portfólio — não só vender o que já está na prateleira, mas identificar o que falta.</p>

<h2>O que analisar a partir do catálogo da loja</h2>
<ul>
<li><strong>Lacunas de portfólio:</strong> quais famílias olfativas, faixas de preço ou marcas populares (ex. o que viralizou) a loja ainda não tem?</li>
<li><strong>Aquisições por tendência e demanda:</strong> cruzar o que os clientes pedem (redes sociais, atendimento) com o que está disponível hoje.</li>
<li><strong>Produtos de maior potencial de margem:</strong> nem sempre o mais vendido é o mais lucrativo — dupes árabes de alta fixação costumam ter ótima margem relativa ao preço de custo.</li>
<li><strong>Kits e cross-sell:</strong> combinar perfume + fixador/hidratante, ou "leve o par" (dia + noite), aumenta ticket médio sem parecer forçado.</li>
<li><strong>Exposição de vitrine:</strong> os itens de maior margem e maior potencial de venda por impulso devem ficar na linha de visão imediata.</li>
</ul>

<h2>Como aplicar na prática</h2>
<p>Toda recomendação de portfólio deve ser justificada com comportamento de consumidor real e tendência de mercado — nunca "achismo". Antes de sugerir uma nova aquisição, pergunte: "isso resolve uma lacuna real ou só duplica o que já vendemos bem?"</p>
      ', 0, true, NULL, 10),
('fe1bb8e1-02fa-47b8-8345-ec908258f481', NULL, '9c4fd692-418c-4aa8-9924-b1341cd635fa', 'Simulações Reais de Atendimento', 'texto', NULL, '
<h2>Por que simular</h2>
<p>Conhecimento técnico só vira resultado quando testado em situação real. Os cenários abaixo cobrem os tipos de atendimento mais comuns e mais difíceis de uma loja de perfumes em Ciudad del Este.</p>

<h2>Banco de cenários</h2>
<ol>
<li><strong>Cliente indeciso</strong> entre 4 perfumes, sem orçamento definido — use perguntas de perfil (Módulo 8) para reduzir as opções antes de testar no blotter.</li>
<li><strong>Conhecedor que já testou tudo</strong>, quer algo "underground" — direcione para nicho menos popular (Módulo 7/9), fale do perfumista e do conceito, não do preço.</li>
<li><strong>Comprando presente para esposa</strong>, não sabe nada de perfume — pergunte sobre a personalidade dela, não sobre notas técnicas; sugira floral ou gourmand clássico com boa aceitação.</li>
<li><strong>Quer economizar</strong>, pede "o mais barato que dure bem" — direcione para árabe custo-benefício (Lattafa, Armaf, Afnan — Módulo 6), explicando a lógica de concentração real.</li>
<li><strong>Pede alta fixação</strong> para trabalho que exige estar perto de pessoas o dia todo — oud/âmbar árabe ou nicho denso, evite cítricos puros (Módulo 9).</li>
<li><strong>Quer exclusividade total</strong>, rejeita tudo que reconhece — nicho autoral pouco popular, nunca ofereça o que já virou mainstream (BR540, Aventus).</li>
<li><strong>Só conhece Sauvage e Aventus</strong>, resistente a sugestão nova — comece pela mesma família (amadeirado-fresco), amplie aos poucos com "é da mesma linha, mas com esse diferencial...".</li>
<li><strong>Quer migrar de designer para árabe</strong>, com receio do "cheiro forte demais" — comece por um árabe mais equilibrado (Rasasi Hawas), não pelo oud mais intenso da loja.</li>
<li><strong>Revendedor pedindo margem e giro</strong>, não personalidade — fale números: preço de tabela, performance/preço, o que vende mais rápido (Módulo 12).</li>
</ol>
<p><strong>Como praticar:</strong> escolha um cenário, responda como se estivesse atendendo de verdade, depois compare sua resposta com as técnicas dos módulos anteriores — abordagem, perguntas de perfil, storytelling e fechamento assumido.</p>
      ', 0, true, NULL, 10);

insert into public.provas
  (id, tenant_id, modulo_id, titulo, nota_minima)
values
('2e79e73e-fd83-40ee-a913-11f03a47ae6e', NULL, '47bec511-c35c-4770-a12b-2a005f1c2a3a', 'Prova: História da Perfumaria', 70),
('17823cb2-7e1d-461d-b37c-ceb08f72c2a6', NULL, 'dce87396-352c-49ac-bab6-c72357b5bf76', 'Prova: Anatomia de um Perfume', 70),
('ea7d879b-4fd0-4d19-be3a-1478e37e9fc5', NULL, '40508d3a-b5e4-4830-a56c-77234addee8c', 'Prova: Famílias Olfativas', 70),
('d395fdd0-c299-4d65-ad6c-b69c6c752711', NULL, '7728d41b-e290-47b8-8e76-120a79413ed3', 'Prova: Ingredientes da Perfumaria', 70),
('ed20f860-5161-4a60-96c2-8c976a42c889', NULL, 'b18820ff-c171-419a-a99d-e9c41b921266', 'Prova: Grandes Casas de Perfumaria', 70),
('827a826e-cd15-4be0-958d-bca55caeb88f', NULL, '8b424d43-3284-41f4-b441-6ddef027b80d', 'Prova: Perfumaria Árabe', 70),
('e2e6f55f-ad37-4e0a-bf50-c385cb0397a7', NULL, '7d72dcda-d39f-4d6a-b99b-edac7f5f8b8f', 'Prova: Perfumaria de Nicho', 70),
('42ea16cb-0e15-4c01-9e42-cf16796c5611', NULL, 'e655a2a6-95e2-4207-8913-bfe3825aa5b1', 'Prova: Como Descobrir o Perfume Ideal', 70),
('3213c0e7-bcd6-4480-8759-4cccf4b14896', NULL, '34ddc944-d9ef-479e-afd9-7b3b71f2fb59', 'Prova: Comparações Inteligentes', 70),
('76dd3ffb-5324-468d-bb54-d00bd861044c', NULL, '7b16a51f-83cf-4ec7-834c-e46996d6f3c5', 'Prova: Técnicas de Venda para Perfumaria', 70),
('cafabeae-4441-45da-8df2-55b11e820b61', NULL, '26be75bd-8c38-4bb7-b6df-7b412df40f2a', 'Prova: Mercado de Ciudad del Este', 70),
('d82cb379-0740-4c66-89cb-e28c7cad19df', NULL, '12f17d8a-e511-432e-b9f0-d4a39aa70bb2', 'Prova: Inteligência Comercial', 70),
('7b6485e3-ffaa-41e3-81ed-82c1fb58b9a8', NULL, '9c4fd692-418c-4aa8-9924-b1341cd635fa', 'Prova: Simulações Reais de Atendimento', 70);

insert into public.questoes_prova
  (id, tenant_id, prova_id, pergunta, opcoes, indice_correta, explicacao)
values
('6e42f2da-c57f-441c-87ee-cb4e26b62f33', NULL, '2e79e73e-fd83-40ee-a913-11f03a47ae6e', 'O que significa a palavra "perfume" (per fumum)?', '["Através do óleo","Através da fumaça","Cheiro da flor","Essência pura"]'::jsonb, 1, '"Per fumum" vem do latim e significa "através da fumaça" — os primeiros perfumes eram resinas e madeiras queimadas em rituais.'),
('83d56bbb-0181-4ddb-acf1-72c1b79876ec', NULL, '2e79e73e-fd83-40ee-a913-11f03a47ae6e', 'Quem inventou a destilação a vapor e o que isso mudou?', '["Ernest Beaux — permitiu criar aldeídos sintéticos","Ibn Sina (Avicena) — permitiu extrair óleos essenciais de flores e plantas","William Perkin — permitiu sintetizar a cumarina","Coco Chanel — permitiu engarrafar perfumes em massa"]'::jsonb, 1, 'Avicena, médico persa do século X, inventou a destilação a vapor — técnica usada até hoje para extrair óleos essenciais. Mudou a perfumaria para sempre.'),
('45dff0d7-2ee0-43af-9c5a-93629b0f9a75', NULL, '2e79e73e-fd83-40ee-a913-11f03a47ae6e', 'Qual a diferença cultural fundamental entre perfumaria ocidental e árabe?', '["Ocidental busca discrição; árabe busca presença forte como sinal de respeito","Ocidental usa mais oud; árabe usa mais cítricos","Árabe é sempre mais barata que a ocidental","Não há diferença relevante"]'::jsonb, 0, 'No Ocidente, discrição é sofisticação. No mundo árabe, perfume forte é generosidade e respeito ao próximo — por isso concentrações e fixação são muito mais altas.'),
('4cded938-659c-4c3a-99b6-b3fade4dcd01', NULL, '2e79e73e-fd83-40ee-a913-11f03a47ae6e', 'O que a Givaudan representa na indústria de perfumaria?', '["Uma marca de nicho árabe","Um órgão regulador de ingredientes","Uma das grandes casas de fragrância que cria perfumes para Chanel, Dior e Hermès","A cidade francesa onde nasceu a perfumaria"]'::jsonb, 2, 'Givaudan (Suíça) é uma das maiores casas de fragrância do mundo — cria perfumes para múltiplas marcas de luxo, o que explica por que um nicho pode superar um designer em qualidade.'),
('48defc74-f246-4db0-b3a3-c18a5cc49088', NULL, '2e79e73e-fd83-40ee-a913-11f03a47ae6e', 'Por que perfumes clássicos como o Fahrenheit original cheiravam diferente das versões atuais?', '["Mudança de fábrica","A IFRA restringiu alguns ingredientes naturais por segurança/alergia, forçando reformulações","O perfumista original se aposentou","Aumento do preço dos frascos"]'::jsonb, 1, 'A IFRA regula o uso de ingredientes por questões de segurança e alergia. Moléculas como o oakmoss foram restringidas, o que reformulou muitos clássicos.'),
('4dcefaf7-b5d2-4cb0-8190-84869006a4ac', NULL, '17823cb2-7e1d-461d-b37c-ceb08f72c2a6', 'Quais as três camadas da pirâmide olfativa, em ordem?', '["Fundo → Coração → Saída","Saída → Coração → Fundo","Coração → Saída → Fundo","Saída → Fundo → Coração"]'::jsonb, 1, 'Saída (0-15 min, cítricos/frescos) → Coração (15min-2h, florais/especiarias) → Fundo (2h-12h+, madeiras/âmbar/almíscar).'),
('af846330-2fb0-474d-847f-75b3d149337e', NULL, '17823cb2-7e1d-461d-b37c-ceb08f72c2a6', 'Ordenando por concentração crescente de óleo essencial, qual sequência está correta?', '["EDP, EDC, EDT, Extrait","EDC, EDT, EDP, Extrait","Extrait, EDP, EDT, EDC","EDT, EDC, Extrait, EDP"]'::jsonb, 1, 'EDC (2-5%) < EDT (5-15%) < EDP (15-20%) < Extrait/Parfum (20-40%).'),
('a08cba44-3b56-4cbb-9577-d077af60e1a5', NULL, '17823cb2-7e1d-461d-b37c-ceb08f72c2a6', 'Por que um árabe rotulado "EDP" pode fixar mais que um EDP francês?', '["Porque usa mais álcool","Porque a concentração real costuma ser de 25-30%, equivalente a um Extrait ocidental","Porque é sempre mais barato","Não há diferença real"]'::jsonb, 1, 'Rótulos árabes fogem da tabela ocidental — "EDP" muitas vezes tem concentração real de Extrait, daí a fixação muito maior com preço menor.'),
('5075aa8f-fbed-4fc9-89f1-f4f95fb8e88b', NULL, '17823cb2-7e1d-461d-b37c-ceb08f72c2a6', 'O que é "skin scent"?', '["Um perfume com fixação alta mas projeção baixa — fica colado na pele","Um perfume que muda de cor na pele","Sinônimo de Extrait","Um defeito de fabricação"]'::jsonb, 0, 'Skin scent é quando o perfume tem boa fixação mas projeção baixa — só quem chega perto sente. O oposto de um perfume com sillage monstruosa.'),
('698c6df5-b0ab-4d97-bff9-84dc428886a5', NULL, '17823cb2-7e1d-461d-b37c-ceb08f72c2a6', 'Por que não se deve deixar o cliente decidir em 10 segundos de teste?', '["Porque ele está sentindo só a nota de saída, não o coração e o fundo do perfume","Porque o blotter precisa secar","Porque a loja perde tempo","Não há problema em decidir rápido"]'::jsonb, 0, 'Decisão rápida = decisão baseada só na saída. O drydown (fundo) é o que o cliente vai sentir o dia todo — por isso vale esperar 5-10 minutos antes de fechar.'),
('18a5cc33-5774-46b9-aab1-f5fe8d53ce99', NULL, 'ea7d879b-4fd0-4d19-be3a-1478e37e9fc5', 'Qual família olfativa é mais associada a "pele limpa" e serve de base para quase todo perfume moderno?', '["Gourmand","Almiscarados","Verdes","Especiados"]'::jsonb, 1, 'Almíscar (branco/sintético) dá sensação de "pele limpa" e é fixador universal — está presente em praticamente todo perfume moderno.'),
('140f7d0f-330d-4d2e-9fe7-8d69df04ff11', NULL, 'ea7d879b-4fd0-4d19-be3a-1478e37e9fc5', 'Para um cliente que quer algo fresco para usar de dia no calor de CDE, qual família recomendar primeiro?', '["Couro/Tabaco","Cítricos/Aquáticos","Oud","Orientais densos"]'::jsonb, 1, 'Cítricos e aquáticos têm energia alta e leve — ideais para dia e clima quente.'),
('de23f4e4-bb45-436b-8dac-c578cf0e24ec', NULL, 'ea7d879b-4fd0-4d19-be3a-1478e37e9fc5', 'Qual família é mais "old money" e associada a perfumes noturnos sofisticados de outono?', '["Couro","Frutados","Aquáticos","Verdes"]'::jsonb, 0, 'Couro tem sensação intensa e sofisticada — clássico de perfumes noturnos maduros, ex. Tuscan Leather.'),
('8f9a893f-af36-4478-bd87-3a1d6d002cfa', NULL, 'ea7d879b-4fd0-4d19-be3a-1478e37e9fc5', 'Um cliente jovem pede algo "doce, tipo sobremesa". Qual família?', '["Gourmand","Incenso","Verdes","Aromáticos"]'::jsonb, 0, 'Gourmand traz baunilha, caramelo, chocolate — sensação doce e comestível, forte apelo jovem.'),
('d4669ef8-653c-4a7c-89fe-eaca1c705d9b', NULL, 'ea7d879b-4fd0-4d19-be3a-1478e37e9fc5', 'Qual família é mais polarizadora e associada à tradição árabe de luxo noturno?', '["Cítricos","Oud","Frutados","Aquáticos"]'::jsonb, 1, 'Oud é intenso, fumado e profundo — símbolo máximo do luxo árabe, mas polariza pelo caráter forte.'),
('6628a3d4-acd3-4787-8edc-37bcc4af7319', NULL, 'd395fdd0-c299-4d65-ad6c-b69c6c752711', 'Por que o oud natural pode custar mais que US$ 10.000/kg?', '["Porque é sintetizado em laboratório caro","Porque vem de madeira de Aquilaria infectada por fungo, um processo raro e não industrializável","Porque só existe em um país","Porque é usado apenas em perfumes femininos"]'::jsonb, 1, 'O oud vem da infecção natural (fungo) da árvore Aquilaria — processo raro e imprevisível, o que torna o oud um dos ingredientes mais caros do mundo.'),
('b7cfc835-621f-4911-8dbd-115aee54d90d', NULL, 'd395fdd0-c299-4d65-ad6c-b69c6c752711', 'Por que a íris (orris) é um dos ingredientes mais caros da perfumaria?', '["Processo de extração leva cerca de 3 anos com rendimento baixíssimo","É importada apenas da China","É usada em pequenas quantidades por lei","Não tem substituto sintético"]'::jsonb, 0, 'A raiz de Orris precisa de ~3 anos de processamento e tem rendimento muito baixo — por isso pode custar mais de US$ 50.000/kg.'),
('97091305-c032-4d3b-9a77-0043f95cd172', NULL, 'd395fdd0-c299-4d65-ad6c-b69c6c752711', 'Qual ingrediente está presente em praticamente todo perfume moderno como fixador de "pele limpa"?', '["Almíscar sintético","Oud","Açafrão","Íris"]'::jsonb, 0, 'O almíscar sintético é barato, versátil e dá a sensação de "pele limpa" — está em quase toda fórmula moderna.'),
('b8f7dcf2-e1d5-46b6-993f-676d1eae982a', NULL, 'd395fdd0-c299-4d65-ad6c-b69c6c752711', 'Quantas toneladas de pétalas de rosa de Damasco são necessárias para produzir 1kg de óleo?', '["1 tonelada","4 toneladas","10 toneladas","Meia tonelada"]'::jsonb, 1, 'São necessárias cerca de 4 toneladas de pétalas para extrair 1kg de óleo de rosa de Damasco — daí o custo alto.'),
('d4938756-166d-4fc6-a415-863a04229cca', NULL, 'd395fdd0-c299-4d65-ad6c-b69c6c752711', 'Como usar o custo dos ingredientes como argumento de venda?', '["Nunca falar de custo, só de marca","Explicar ao cliente o custo real da matéria-prima (oud, açafrão, íris) quando ele questiona o preço de um nicho","Dizer que todo perfume caro é só marketing","Comparar apenas o tamanho do frasco"]'::jsonb, 1, 'Quando o cliente questiona o preço de um nicho, explicar o custo real da matéria-prima (ex. oud, açafrão, íris) constrói um argumento técnico e irrefutável.'),
('49c90ea0-ef68-4dd7-bb6c-b76a6c3710f7', NULL, 'ed20f860-5161-4a60-96c2-8c976a42c889', 'Qual perfume é considerado "o mais hypado da década" e ícone de status masculino?', '["Sauvage (Dior)","Aventus (Creed)","Le Male (JPG)","Terre d''Hermès"]'::jsonb, 1, 'Aventus da Creed é considerado o perfume masculino mais hypado da última década, símbolo de sucesso.'),
('be967d3f-62d9-42c0-8be3-838f65c8c667', NULL, 'ed20f860-5161-4a60-96c2-8c976a42c889', 'Qual perfume virou referência de comparação viral no TikTok ("cheira a...?")', '["Baccarat Rouge 540 (MFK)","Acqua di Gio (Armani)","1 Million (Paco Rabanne)","N°5 (Chanel)"]'::jsonb, 0, 'O Baccarat Rouge 540 da Maison Francis Kurkdjian virou fenômeno viral e referência de comparação para nichos e dupes.'),
('d7714cd3-ca8f-4764-b86d-734a91d39454', NULL, 'ed20f860-5161-4a60-96c2-8c976a42c889', 'Qual casa é conhecida por ser dona dos próprios campos de flores em Grasse?', '["Chanel","Versace","Paco Rabanne","Prada"]'::jsonb, 0, 'A Chanel controla parte da própria produção de flores em Grasse, garantindo qualidade e exclusividade de matéria-prima.'),
('c3573d18-dc7a-40e1-897a-a83492d06394', NULL, 'ed20f860-5161-4a60-96c2-8c976a42c889', 'Para um cliente jovem que quer algo para balada com ticket de entrada, qual faixa de marcas oferecer primeiro?', '["Amouage, Byredo, Diptyque","Paco Rabanne, Versace, JPG","Creed, MFK, Xerjoff","Mancera, Montale"]'::jsonb, 1, 'Paco Rabanne, Versace e JPG são o posicionamento de entrada/jovem — ideal para balada e público 18-28 anos.'),
('fc49a0a7-a50d-44eb-ad85-8a8ffdba6175', NULL, 'ed20f860-5161-4a60-96c2-8c976a42c889', 'O que caracteriza a filosofia da Hermès em perfumaria?', '["Maximalismo e ingredientes raros","\"Perfume que não cheira a perfume\" — minimalismo e transparência (escola de Jean-Claude Ellena)","Foco exclusivo em oud","Marketing agressivo de celebridades"]'::jsonb, 1, 'A Hermès é reconhecida pela escola "transparente" de Jean-Claude Ellena — artesanal, minimalista, "menos é mais".'),
('de4dd0c2-a579-41fe-a110-78c622258cc8', NULL, '827a826e-cd15-4be0-958d-bca55caeb88f', 'Qual marca árabe é conhecida como o "dupe" mais respeitado de Creed Aventus?', '["Lattafa Khamrah","Armaf Club de Nuit Intense Man","Al Haramain Amber Oud","Rasasi Hawas"]'::jsonb, 1, 'O Armaf Club de Nuit Intense Man é amplamente reconhecido como o melhor "dupe" de Aventus no mercado.'),
('102ed0d4-365b-476a-8eb0-6af2b56712b9', NULL, '827a826e-cd15-4be0-958d-bca55caeb88f', 'Ao vender um árabe equivalente para um cliente que só conhece designer, o que NUNCA se deve dizer?', '["\"É da mesma família olfativa\"","\"É uma cópia\"","\"Tem fixação muito maior\"","\"É inspirado nessa linha\""]'::jsonb, 1, 'Nunca use a palavra "cópia" — isso desvaloriza o produto. Use "inspirado" ou "mesma linha olfativa", que soa como diferenciação, não pirataria.'),
('525d285f-693e-4d5e-9b93-38d7880214dc', NULL, '827a826e-cd15-4be0-958d-bca55caeb88f', 'Por que a fixação é o argumento mais forte ao vender perfume árabe?', '["Porque é vendida pelo tempo — o cliente sente a diferença ao longo do dia, não na primeira impressão","Porque o cliente não percebe diferença nenhuma","Porque árabes não têm nota de saída","Porque fixação não importa para o cliente"]'::jsonb, 0, 'A fixação é um argumento que se prova com o tempo — por isso vale deixar o cliente esperar e sentir ao longo do atendimento, não fechar na primeira cheirada.'),
('7e90a1e7-5e52-4dd6-a603-6c28c6d4755b', NULL, '827a826e-cd15-4be0-958d-bca55caeb88f', 'Qual marca é considerada porta de entrada para o "luxo árabe genuíno"?', '["Emir","Paris Corner","Rasasi","Fragrance World"]'::jsonb, 2, 'Rasasi é considerada a marca mais premium entre as árabes tradicionais — ótima porta de entrada para o luxo árabe genuíno.'),
('6308bf0a-ba82-46b3-aabb-c65e85b0d582', NULL, '827a826e-cd15-4be0-958d-bca55caeb88f', 'Por que perfumar-se é tradição religiosa no mundo árabe?', '["Porque é recomendado perfumar-se antes da oração — sinal de respeito ao próximo e a Deus","Porque é uma exigência legal","Porque é um costume recente, dos anos 2000","Porque só é usado em casamentos"]'::jsonb, 0, 'No mundo árabe, perfumar-se antes da oração é prática recomendada — perfume é respeito, não vaidade.'),
('0f00050c-4516-4baf-976d-47f92746cd00', NULL, 'e2e6f55f-ad37-4e0a-bf50-c385cb0397a7', 'O que define perfumaria de nicho?', '["Preço sempre mais baixo que designer","Produção limitada, conceito artístico, ingredientes sem limite de orçamento e distribuição seletiva","Venda exclusiva em farmácias","Uso obrigatório de oud"]'::jsonb, 1, 'Nicho se define pela produção limitada, liberdade criativa/orçamentária e distribuição seletiva — não por categoria de ingrediente específico.'),
('558d0b81-a7b4-40aa-be15-0270c9b399d3', NULL, 'e2e6f55f-ad37-4e0a-bf50-c385cb0397a7', 'Como se deve argumentar o preço de um perfume de nicho?', '["Focando em desconto e promoção","Comparando o tamanho do frasco com o de um designer","Falando de história, raridade dos ingredientes e identidade pessoal","Dizendo que é mais barato que a concorrência"]'::jsonb, 2, 'Nicho não compete em preço — compete em história, exclusividade e identidade. O foco da venda é qualitativo, não promocional.'),
('a6838dfd-3c39-4545-bdb2-8da02d26f996', NULL, 'e2e6f55f-ad37-4e0a-bf50-c385cb0397a7', 'Por que o risco de "cheirar igual outra pessoa" é baixo em perfumes de nicho?', '["Porque nicho é vendido em todo shopping","Porque a distribuição é seletiva e a produção é limitada","Porque nicho não tem notas de saída","Porque nicho é sempre mais barato"]'::jsonb, 1, 'A distribuição seletiva e produção limitada do nicho reduzem drasticamente a chance de encontrar outra pessoa usando o mesmo perfume.'),
('b95ee283-7839-4f97-be6f-df52c4626fe9', NULL, 'e2e6f55f-ad37-4e0a-bf50-c385cb0397a7', 'Qual é o perfil típico do cliente de perfumaria de nicho?', '["Jovem de 16-18 anos sem orçamento definido","Conhecedor ou aspiracional, geralmente 28+, com alto poder aquisitivo ou disposto a investir em poucas peças","Apenas revendedores em busca de giro","Apenas turistas de passagem rápida"]'::jsonb, 1, 'O público de nicho costuma ser mais maduro, conhecedor ou aspiracional, disposto a pagar mais por exclusividade e qualidade.'),
('60af189b-082c-4da2-959b-68d3693f4995', NULL, 'e2e6f55f-ad37-4e0a-bf50-c385cb0397a7', 'O que o perfumista representa numa fragrância de nicho?', '["Um funcionário anônimo da fábrica","O \"artista\" que assina a obra, como referência de qualidade e conceito","Um cargo puramente administrativo","Não tem relevância nenhuma para a venda"]'::jsonb, 1, 'Perfumistas como Francis Kurkdjian ou Dominique Ropion assinam suas criações como artistas — isso é parte do valor percebido pelo cliente conhecedor.'),
('6a7ba45a-e2e5-44fe-9d3a-79f8014f098c', NULL, '42ea16cb-0e15-4c01-9e42-cf16796c5611', 'Qual é a primeira pergunta recomendada ao atender um cliente indeciso?', '["\"Qual seu orçamento?\"","\"Já tem um perfume que gosta hoje?\"","\"Quer o mais caro da loja?\"","\"Prefere masculino ou feminino?\""]'::jsonb, 1, 'Perguntar se o cliente já tem um perfume de referência permite identificar a família olfativa dele e direcionar a conversa com precisão.'),
('9f48b282-1ef8-4cc7-8ace-6886ef1d6474', NULL, '42ea16cb-0e15-4c01-9e42-cf16796c5611', 'Qual família recomendar para um executivo discreto?', '["Gourmand doce","Amadeirado/cítrico clean","Oud intenso","Frutado jovem"]'::jsonb, 1, 'Perfil executivo/discreto combina com amadeirados e cítricos limpos, como Terre d''Hermès ou Bleu de Chanel.'),
('a23010a3-acf6-4190-93b2-ed5a182a133c', NULL, '42ea16cb-0e15-4c01-9e42-cf16796c5611', 'Por que perguntar o orçamento "com tato" em vez de direto?', '["Porque não é importante saber o orçamento","Porque abre espaço para upsell consultivo sem constranger o cliente","Porque a loja não vende por faixa de preço","Porque só clientes ricos merecem atenção"]'::jsonb, 1, 'Perguntar com tato ("qual faixa você tinha em mente?") mantém a conversa consultiva e abre espaço para sugerir upgrades sem pressão.'),
('47fd37d4-065e-4ed2-83b4-3c03beaa48b2', NULL, '42ea16cb-0e15-4c01-9e42-cf16796c5611', 'Qual a ordem correta do processo de venda depois de identificar o perfil do cliente?', '["Fechar a venda → testar → esperar drydown","Testar 2-3 opções → esperar 5-10 min (drydown) → fechar com argumento técnico + upsell","Mostrar todo o estoque → decidir sozinho pelo cliente","Aplicar direto na pele sem blotter"]'::jsonb, 1, 'O processo correto é testar poucas opções no blotter, esperar o drydown, e só então fechar com argumento técnico e oferta de upsell.'),
('83bfc1ff-8da0-465b-a2c7-fa5c848b3836', NULL, '42ea16cb-0e15-4c01-9e42-cf16796c5611', 'Por que o clima de Ciudad del Este influencia a recomendação de família olfativa?', '["Porque não influencia em nada","Porque calor/umidade aceleram evaporação e projeção — cítricos/aquáticos rendem melhor de dia, orientais/oud à noite","Porque só existe uma estação na cidade","Porque árabes não funcionam em clima quente"]'::jsonb, 1, 'O clima quente e úmido de CDE acelera a evaporação e projeção — por isso cítricos/aquáticos são melhores de dia, e orientais/oud continuam funcionando à noite mesmo no calor.'),
('fcf7f70d-b25b-48bd-9e3a-5a9ca731d981', NULL, '3213c0e7-bcd6-4480-8759-4cccf4b14896', 'Qual frase NUNCA deve ser usada ao oferecer uma alternativa a um perfume famoso?', '["\"É da mesma família\"","\"É igual\"","\"Tem uma diferença específica\"","\"É inspirado nessa linha\""]'::jsonb, 1, 'Nunca diga "é igual" — isso cria expectativa que gera decepção. Use "é da mesma família, com essa diferença específica..."'),
('94c10d64-aef2-43eb-ba5c-396a443c0b73', NULL, '3213c0e7-bcd6-4480-8759-4cccf4b14896', 'Se o cliente pede algo parecido com Baccarat Rouge 540, qual o argumento correto?', '["Dizer que é exatamente igual e mais barato","Explicar que a alternativa pega boa parte da experiência por uma fração do preço, mas o original tem pureza insubstituível","Recusar vender qualquer alternativa","Dizer que o BR540 é ruim"]'::jsonb, 1, 'O argumento correto reconhece o valor do original (pureza do ingrediente) e posiciona a alternativa pelo custo-benefício, sem prometer identidade total.'),
('47f16af1-67c8-4e27-8510-c9496e88006c', NULL, '3213c0e7-bcd6-4480-8759-4cccf4b14896', 'Qual é o "dupe" mais respeitado do mercado para o Aventus da Creed?', '["Afnan 9 PM","Armaf Club de Nuit Intense Man","Lattafa Yara","Al Haramain Amber Oud"]'::jsonb, 1, 'O Armaf Club de Nuit Intense Man é amplamente reconhecido como o dupe mais respeitado de Aventus.'),
('1023a975-4e77-44d9-be30-838dd93cdffc', NULL, '3213c0e7-bcd6-4480-8759-4cccf4b14896', 'Para um cliente que quer "algo que ninguém tenha", qual estratégia é a mais correta?', '["Oferecer o Baccarat Rouge 540, já que é muito bom","Direcionar para nichos menos populares e mainstream, como Nishane ou Initio, vendendo exclusividade genuína","Oferecer o Sauvage da Dior","Dizer que não existe isso"]'::jsonb, 1, 'Perfumes já virais como BR540 não servem para esse pedido — a resposta certa é oferecer nichos menos populares, com ticket mais alto justificado pela exclusividade real.'),
('44c0679c-184e-41fa-925a-a88bf2e04bf4', NULL, '3213c0e7-bcd6-4480-8759-4cccf4b14896', 'Por que evitar cítricos puros para um cliente que pede "fixação máxima"?', '["Porque cítricos são sempre mais caros","Porque moléculas cítricas são leves e evaporam rápido, o oposto de alta fixação","Porque cítricos não existem em versão árabe","Não há motivo — cítricos fixam igual a qualquer outro"]'::jsonb, 1, 'Notas cítricas são moléculas leves de saída — evaporam rápido. Para fixação máxima, o caminho correto é oud/âmbar árabe ou nicho denso.'),
('afa62f8c-b787-4a2f-abd6-92e3aa385177', NULL, '76dd3ffb-5324-468d-bb54-d00bd861044c', 'Qual abertura de atendimento deve ser evitada?', '["\"Vi que você parou nessa linha árabe\"","\"Posso ajudar?\"","\"Já usou oud antes?\"","Uma pergunta observacional sobre o que o cliente está olhando"]'::jsonb, 1, '"Posso ajudar?" costuma gerar "não, só olhando" — a abordagem observacional funciona muito melhor para abrir conversa.'),
('a3462d17-90dc-4f75-98e1-69764038544a', NULL, '76dd3ffb-5324-468d-bb54-d00bd861044c', 'Quantos perfumes no máximo devem ser testados por vez no blotter?', '["1","3","6","10"]'::jsonb, 1, 'No máximo 3 perfumes por vez — depois disso o nariz satura e o cliente perde a capacidade de diferenciar.'),
('5fa33484-16d9-4092-a4b6-9e68ba2bb587', NULL, '76dd3ffb-5324-468d-bb54-d00bd861044c', 'Por que não se deve esfregar o perfume no pulso depois de aplicar?', '["Porque mancha a pele","Porque esfregar quebra as moléculas e altera o cheiro","Porque é falta de educação","Não há problema em esfregar"]'::jsonb, 1, 'Esfregar gera calor e fricção que quebram a estrutura molecular do perfume, alterando a forma como ele evolui na pele.'),
('f66d6544-101b-4ac3-b054-c4ba0d8c4c5c', NULL, '76dd3ffb-5324-468d-bb54-d00bd861044c', 'Qual é o fechamento assumido correto?', '["\"Vai levar?\"","\"Prefere o de 50ml ou já leva o de 100ml que sai melhor o custo por ml?\"","\"Pensa e volta outro dia\"","\"Não tenho mais nada pra mostrar\""]'::jsonb, 1, 'O fechamento assumido pressupõe que o cliente vai comprar e já embute um upsell de tamanho — muito mais eficaz que perguntar "vai levar?".'),
('ef34c0bc-bdbb-4e0a-9e99-326fc169094b', NULL, '76dd3ffb-5324-468d-bb54-d00bd861044c', 'Por que perguntar "como você quer se sentir usando isso?" é mais eficaz que "qual perfume você quer?"', '["Porque é mais rápido de responder","Porque pessoas compram identidade e emoção, não apenas o líquido","Porque elimina a necessidade de testar o perfume","Não faz diferença nenhuma"]'::jsonb, 1, 'A venda por emoção reconhece que o cliente compra uma identidade/sentimento — a pergunta certa direciona a conversa para isso, não para especificação técnica.'),
('d9876b49-5495-407c-8b69-fce175207430', NULL, 'cafabeae-4441-45da-8df2-55b11e820b61', 'Qual é o comportamento típico do cliente brasileiro em CDE?', '["Nunca pesquisa preço antes","Pesquisa preço, compara com o Brasil/online e busca um \"achado\", geralmente já com marcas famosas em mente","Só compra por indicação de amigos","Prefere sempre nicho artístico caro"]'::jsonb, 1, 'O cliente brasileiro costuma pesquisar e comparar preços antes, chegando com uma lista mental de marcas famosas (ex. Sauvage, BR540) e buscando um bom negócio.'),
('0266b6db-45de-4bde-9368-188fae666e76', NULL, 'cafabeae-4441-45da-8df2-55b11e820b61', 'Como abordar melhor o cliente paraguaio recorrente/local?', '["Tratá-lo igual a um turista de passagem","Investir em atendimento de longo prazo, lembrar preferências e oferecer lançamentos primeiro a ele","Focar só em desconto de volume","Ignorar, já que ele sempre volta de qualquer jeito"]'::jsonb, 1, 'O cliente paraguaio valoriza relacionamento e fidelidade — vale investir em atendimento de longo prazo e tratamento diferenciado.'),
('c70ba0c5-b380-4111-90bd-561693be3b75', NULL, 'cafabeae-4441-45da-8df2-55b11e820b61', 'Qual é o real diferencial competitivo de uma loja de perfumes em CDE, dado que o mercado é saturado de dupes árabes?', '["Ter o menor preço possível sempre","O atendimento consultivo — vender conhecimento, não só preço","Vender apenas marcas de nicho caras","Copiar a estratégia dos concorrentes"]'::jsonb, 1, 'Como o mercado é saturado de lojas empurrando preço, o atendimento consultivo (conhecimento real de perfumaria) é o que diferencia de verdade.'),
('44844170-e5d8-4412-93cb-468dd70f0753', NULL, 'cafabeae-4441-45da-8df2-55b11e820b61', 'Qual estratégia melhor se aplica ao cliente argentino, dado o perfil de câmbio e revenda informal?', '["Ignorar volume e vender só unidade","Trabalhar preço por volume e combos","Oferecer apenas nicho artístico caro","Recusar vender mais de uma unidade"]'::jsonb, 1, 'O cliente argentino busca preço bom por câmbio e costuma comprar em quantidade — combos e preço por volume atendem melhor esse perfil.'),
('ef3ba84b-33c9-45c8-94bf-e7a140c233e3', NULL, 'cafabeae-4441-45da-8df2-55b11e820b61', 'Por que é importante acompanhar TikTok/Instagram para vender perfume em CDE?', '["Porque não tem nenhuma relevância comercial","Porque clientes já chegam pedindo \"o que viralizou\" (ex. BR540, Lattafa Khamrah) — estar atualizado permite atender essa demanda","Porque a loja precisa postar todos os dias","Porque só turistas usam essas redes"]'::jsonb, 1, 'A tendência regional forte de redes sociais faz clientes chegarem já pedindo o produto viral do momento — o vendedor precisa estar atualizado para atender e also para direcionar para alternativas.'),
('46c784b1-4a11-47eb-8f5d-c41d9134b182', NULL, 'd82cb379-0740-4c66-89cb-e28c7cad19df', 'O que significa "mapear lacunas de portfólio" numa loja de perfumes?', '["Contar quantos frascos existem no estoque","Identificar famílias olfativas, faixas de preço ou marcas populares que a loja ainda não oferece","Trocar a decoração da vitrine","Reduzir o número de marcas disponíveis"]'::jsonb, 1, 'Mapear lacunas é comparar o que a loja tem com o que o mercado/cliente demanda, identificando o que falta oferecer.'),
('ec80f2bb-03bd-48b8-b3d3-dd8e21dee327', NULL, 'd82cb379-0740-4c66-89cb-e28c7cad19df', 'Por que o produto mais vendido nem sempre é o de maior potencial de margem?', '["Porque venda e margem são sempre a mesma coisa","Porque dupes de alta fixação, por exemplo, podem ter ótima margem relativa mesmo vendendo menos que um best-seller de baixo custo","Porque margem não importa para uma loja de varejo","Porque só produtos caros dão margem"]'::jsonb, 1, 'Volume de venda e margem são métricas diferentes — um produto de menor giro pode ser mais lucrativo proporcionalmente, e vale identificar isso.'),
('5f51d81e-6c6f-40b8-9ff6-838adc14a5fe', NULL, 'd82cb379-0740-4c66-89cb-e28c7cad19df', 'Qual é um exemplo correto de estratégia de cross-sell em perfumaria?', '["Vender só um item por cliente","Combinar perfume + hidratante/fixador, ou sugerir \"o par\" (dia + noite)","Nunca sugerir produto adicional","Empurrar qualquer produto aleatório no caixa"]'::jsonb, 1, 'Cross-sell eficaz combina produtos que fazem sentido juntos (perfume + fixador, ou dia + noite), aumentando o ticket sem parecer forçado.'),
('7300969f-1fed-4f91-a77e-6b44c8e68dc3', NULL, 'd82cb379-0740-4c66-89cb-e28c7cad19df', 'Antes de sugerir uma nova aquisição de catálogo, qual pergunta deve ser feita?', '["\"Isso resolve uma lacuna real ou só duplica o que já vendemos bem?\"","\"Isso é o mais caro do mercado?\"","\"O fornecedor é conhecido?\"","Nenhuma pergunta é necessária"]'::jsonb, 0, 'Toda decisão de portfólio deve ser justificada — a pergunta central é se o novo item preenche uma lacuna real, evitando duplicar o que já existe.'),
('aabccdf1-908b-4404-80a3-c400e09d7367', NULL, 'd82cb379-0740-4c66-89cb-e28c7cad19df', 'Qual critério deve guiar a exposição de vitrine segundo a inteligência comercial?', '["Ordem alfabética apenas","Itens de maior margem e potencial de compra por impulso na linha de visão imediata","Sempre os produtos mais baratos na frente","Não importa a posição dos produtos"]'::jsonb, 1, 'A vitrine deve priorizar produtos de maior margem e maior potencial de impulso, maximizando o retorno do espaço físico.'),
('a9a2afbd-e9aa-47c1-a6c7-0644aaaa5762', NULL, '7b6485e3-ffaa-41e3-81ed-82c1fb58b9a8', 'Um cliente diz "já testei tudo, quero algo underground". Qual a melhor abordagem?', '["Oferecer o Baccarat Rouge 540, que é muito bom","Direcionar para nicho menos popular, falando do perfumista e do conceito, não do preço","Insistir em um designer clássico","Dizer que não existe nada assim na loja"]'::jsonb, 1, 'Para um conhecedor que já testou tudo, o caminho é nicho autoral pouco popular — o argumento é conceito e exclusividade, não preço.'),
('223a9ea7-0e65-4fb5-86f9-2e137aa52d9f', NULL, '7b6485e3-ffaa-41e3-81ed-82c1fb58b9a8', 'Um cliente pede presente para a esposa e não entende nada de perfume. Qual a pergunta certa?', '["Perguntar sobre notas técnicas específicas que ele não vai saber responder","Perguntar sobre a personalidade dela e sugerir floral ou gourmand clássico","Pedir para ele escolher sozinho sem ajuda","Oferecer o perfume mais caro da loja direto"]'::jsonb, 1, 'Quando o comprador não entende de perfume, a pergunta certa foca na personalidade da pessoa presenteada, não em jargão técnico.'),
('9068ecb8-2bd7-41bb-952a-9dc1dde2ff27', NULL, '7b6485e3-ffaa-41e3-81ed-82c1fb58b9a8', 'Um cliente quer migrar de designer para árabe mas teme "cheiro forte demais". Por onde começar?', '["Pelo oud mais intenso da loja, para impressionar","Por um árabe mais equilibrado, como Rasasi Hawas, antes de propor algo mais denso","Recusar vender árabe para esse cliente","Insistir que ele vai se acostumar com qualquer intensidade"]'::jsonb, 1, 'Para quem teme intensidade, o caminho certo é começar por um árabe mais equilibrado, ganhando confiança antes de propor fragrâncias mais densas.'),
('2a837d3e-ce84-4b57-927c-1f770fec4117', NULL, '7b6485e3-ffaa-41e3-81ed-82c1fb58b9a8', 'Um revendedor pede recomendação focado só em margem e giro. Qual o erro mais comum a evitar?', '["Falar de preço de tabela e performance/preço","Insistir em storytelling de história e ingrediente, ignorando os números que ele pediu","Indicar o que vende mais rápido","Ser direto e objetivo"]'::jsonb, 1, 'Com um revendedor, o storytelling emocional não é o que importa — o erro é insistir nisso ao invés de fornecer números concretos de margem e giro.'),
('dd3bc8ed-4641-4e4c-a35e-c08afffa26b8', NULL, '7b6485e3-ffaa-41e3-81ed-82c1fb58b9a8', 'Cliente só conhece Sauvage e Aventus e resiste a qualquer sugestão nova. Qual estratégia funciona melhor?', '["Insistir em um perfume de família completamente diferente","Começar pela mesma família olfativa (amadeirado-fresco) e ampliar aos poucos com \"é da mesma linha, mas com esse diferencial...\"","Dizer que o gosto dele é limitado","Desistir de oferecer qualquer alternativa"]'::jsonb, 1, 'Clientes resistentes respondem melhor a uma ponte gradual — começar na mesma família olfativa e expandir aos poucos gera confiança, sem confronto.');
