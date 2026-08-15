-- Libera gerente escolher quais categorias de treinamento cada vendedor ve
-- (ex: nao mostrar Skin Care para vendedor de Informatica).
-- NULL = ve todas as categorias (default, compatibilidade com vendedores existentes).
alter table profiles
  add column if not exists categorias_permitidas text[];

comment on column profiles.categorias_permitidas is 'Categorias de treinamento visiveis para o vendedor (ver categorias.ts CATEGORIAS). NULL = todas.';
