USE pastry_menu;

INSERT INTO estabelecimentos (nome, identificador_url, ativo)
SELECT 'Pastry Menu', 'pastry-menu', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM estabelecimentos WHERE identificador_url = 'pastry-menu'
);

SET @estabelecimento_id = (
  SELECT id FROM estabelecimentos WHERE identificador_url = 'pastry-menu' LIMIT 1
);

INSERT INTO categorias (estabelecimento_id, nome, descricao, ordem_exibicao)
SELECT @estabelecimento_id, 'Clássicos', 'Sabores tradicionais', 1
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE estabelecimento_id = @estabelecimento_id AND nome = 'Clássicos');
INSERT INTO categorias (estabelecimento_id, nome, descricao, ordem_exibicao)
SELECT @estabelecimento_id, 'Especiais', 'Combinações da casa', 2
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE estabelecimento_id = @estabelecimento_id AND nome = 'Especiais');
INSERT INTO categorias (estabelecimento_id, nome, descricao, ordem_exibicao)
SELECT @estabelecimento_id, 'Vegetarianos', 'Opções sem carne', 3
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE estabelecimento_id = @estabelecimento_id AND nome = 'Vegetarianos');
INSERT INTO categorias (estabelecimento_id, nome, descricao, ordem_exibicao)
SELECT @estabelecimento_id, 'Doces', 'Sabores doces', 4
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE estabelecimento_id = @estabelecimento_id AND nome = 'Doces');

INSERT INTO produtos (estabelecimento_id, categoria_id, nome, descricao, preco_base, url_imagem, ordem_exibicao)
SELECT @estabelecimento_id, c.id, 'Pastel da Casa', 'Carne temperada, queijo meia cura e azeitonas.', 16.90,
  'https://images.unsplash.com/photo-1571292226185-6a16b4d879ee?auto=format&fit=crop&w=900&q=84', 1
FROM categorias c WHERE c.estabelecimento_id = @estabelecimento_id AND c.nome = 'Especiais'
  AND NOT EXISTS (SELECT 1 FROM produtos p WHERE p.estabelecimento_id = @estabelecimento_id AND p.nome = 'Pastel da Casa');
INSERT INTO produtos (estabelecimento_id, categoria_id, nome, descricao, preco_base, url_imagem, ordem_exibicao)
SELECT @estabelecimento_id, c.id, 'Carne com Queijo', 'Carne moída artesanal e muçarela derretida.', 14.90,
  'https://images.unsplash.com/photo-1681389158414-adf7f9583f24?auto=format&fit=crop&w=900&q=84', 2
FROM categorias c WHERE c.estabelecimento_id = @estabelecimento_id AND c.nome = 'Clássicos'
  AND NOT EXISTS (SELECT 1 FROM produtos p WHERE p.estabelecimento_id = @estabelecimento_id AND p.nome = 'Carne com Queijo');
INSERT INTO produtos (estabelecimento_id, categoria_id, nome, descricao, preco_base, url_imagem, ordem_exibicao)
SELECT @estabelecimento_id, c.id, 'Palmito Cremoso', 'Palmito, requeijão cremoso e ervas frescas.', 15.90,
  'https://images.unsplash.com/photo-1704763673093-45b6267a7b8e?auto=format&fit=crop&w=900&q=84', 3
FROM categorias c WHERE c.estabelecimento_id = @estabelecimento_id AND c.nome = 'Vegetarianos'
  AND NOT EXISTS (SELECT 1 FROM produtos p WHERE p.estabelecimento_id = @estabelecimento_id AND p.nome = 'Palmito Cremoso');
INSERT INTO produtos (estabelecimento_id, categoria_id, nome, descricao, preco_base, url_imagem, ordem_exibicao)
SELECT @estabelecimento_id, c.id, 'Romeu e Julieta', 'Goiabada com queijo.', 12.90,
  'https://images.unsplash.com/photo-1677370261616-48751f23f8a2?auto=format&fit=crop&w=900&q=84', 4
FROM categorias c WHERE c.estabelecimento_id = @estabelecimento_id AND c.nome = 'Doces'
  AND NOT EXISTS (SELECT 1 FROM produtos p WHERE p.estabelecimento_id = @estabelecimento_id AND p.nome = 'Romeu e Julieta');
