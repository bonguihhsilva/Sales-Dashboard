-- Seed mockup de catalogo (produtos/categorias) p/ tenant Star Company.
-- Tabelas legadas mantidas a pedido (material de exemplo). Idempotente: nao duplica.
-- Nota: produtos/categorias nao sao lidas por nenhuma tela do app atual (schema legado,
-- substituido por sales_records). Dado existe so para as tabelas nao ficarem vazias.
with t as (
  select id as tid from tenants where slug = 'star-company'
),
ins_cat as (
  insert into categorias (tenant_id, nome, cor)
  select t.tid, c.nome, c.cor
  from t, (values
    ('Telefonia','#ef4444'),
    ('Informática','#7c3aed'),
    ('Eletrônicos','#2563eb'),
    ('Perfumaria','#db2777'),
    ('Relógios','#f59e0b'),
    ('Áudio','#10b981')
  ) as c(nome,cor)
  where not exists (select 1 from categorias where tenant_id = t.tid)
  returning id, nome
)
insert into produtos (tenant_id, nome, modelo, marca, sku, categoria_id)
select (select tid from t), p.nome, nullif(p.modelo,''), p.marca, p.sku, ic.id
from (values
  ('iPhone 15 Pro 256GB','A3102','Apple','APL-IP15P-256','Telefonia'),
  ('Galaxy S24 Ultra 512GB','SM-S928','Samsung','SAM-S24U-512','Telefonia'),
  ('Redmi Note 13 Pro 256GB','2312DRA50G','Xiaomi','XIA-RN13P-256','Telefonia'),
  ('Galaxy A55 5G 256GB','SM-A556','Samsung','SAM-A55-256','Telefonia'),
  ('MacBook Air M3 13 pol 256GB','MRXN3','Apple','APL-MBA-M3-256','Informática'),
  ('IdeaPad Slim 5 16GB','82XF','Lenovo','LEN-IPS5-16','Informática'),
  ('ROG Strix G16 RTX4060','G614','Asus','ASU-ROG-G16','Informática'),
  ('Mouse MX Master 3S','910-006','Logitech','LOG-MXM3S','Informática'),
  ('Smart TV OLED 55 pol C4','OLED55C4','LG','LG-OLED55C4','Eletrônicos'),
  ('Smart TV Neo QLED 65 pol','QN65QN90','Samsung','SAM-QN90-65','Eletrônicos'),
  ('PlayStation 5 Slim','CFI-2015','Sony','SON-PS5-SLIM','Eletrônicos'),
  ('Sauvage EDP 100ml','','Dior','DIO-SAUV-100','Perfumaria'),
  ('Bleu de Chanel EDP 100ml','','Chanel','CHA-BLEU-100','Perfumaria'),
  ('La Vie Est Belle 75ml','','Lancôme','LAN-LVEB-75','Perfumaria'),
  ('G-Shock GA-2100','GA-2100','Casio','CAS-GA2100','Relógios'),
  ('Apple Watch Series 9 45mm','MR9','Apple','APL-AWS9-45','Relógios'),
  ('AirPods Pro 2 USB-C','A3048','Apple','APL-APP2-USBC','Áudio'),
  ('WH-1000XM5','WH1000XM5','Sony','SON-XM5','Áudio'),
  ('JBL Charge 5','JBLCHARGE5','JBL','JBL-CHG5','Áudio')
) as p(nome,modelo,marca,sku,cat)
join ins_cat ic on ic.nome = p.cat;
