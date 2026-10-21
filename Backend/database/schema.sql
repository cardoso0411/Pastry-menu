-- Pastry Menu: estrutura inicial para pedidos presenciais identificados por celular.
-- Compativel com MySQL 8.0.16+.

CREATE DATABASE pastry_menu
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pastry_menu;

CREATE TABLE estabelecimentos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(160) NOT NULL,
  identificador_url VARCHAR(180) NOT NULL,
  telefone VARCHAR(30) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estabelecimentos_identificador (identificador_url)
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL,
  hash_senha VARCHAR(255) NOT NULL,
  funcao ENUM('proprietario', 'gerente', 'atendente') NOT NULL DEFAULT 'atendente',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_estabelecimento_email (estabelecimento_id, email),
  UNIQUE KEY uk_usuarios_id_estabelecimento (id, estabelecimento_id),
  CONSTRAINT fk_usuarios_estabelecimento
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE categorias (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(500) NULL,
  ordem_exibicao SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categorias_nome (estabelecimento_id, nome),
  UNIQUE KEY uk_categorias_id_estabelecimento (id, estabelecimento_id),
  CONSTRAINT fk_categorias_estabelecimento
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE produtos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  categoria_id BIGINT UNSIGNED NULL,
  nome VARCHAR(160) NOT NULL,
  descricao TEXT NULL,
  preco_base DECIMAL(10,2) NOT NULL,
  url_imagem VARCHAR(2048) NULL,
  ordem_exibicao SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  disponivel BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_produtos_cardapio (estabelecimento_id, disponivel, ordem_exibicao),
  UNIQUE KEY uk_produtos_id_estabelecimento (id, estabelecimento_id),
  CONSTRAINT fk_produtos_estabelecimento
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_produtos_categoria
    FOREIGN KEY (categoria_id, estabelecimento_id)
    REFERENCES categorias (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT ck_produtos_preco CHECK (preco_base >= 0)
) ENGINE=InnoDB;

CREATE TABLE variantes_produto (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  produto_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(100) NOT NULL,
  preco_variante DECIMAL(10,2) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem_exibicao SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_variantes_id_produto (id, produto_id, estabelecimento_id),
  KEY ix_variantes_produto (produto_id, ativo),
  CONSTRAINT fk_variantes_produto
    FOREIGN KEY (produto_id, estabelecimento_id)
    REFERENCES produtos (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT ck_variantes_preco CHECK (preco_variante IS NULL OR preco_variante >= 0)
) ENGINE=InnoDB;

CREATE TABLE grupos_adicionais (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(100) NOT NULL,
  minimo_selecoes TINYINT UNSIGNED NOT NULL DEFAULT 0,
  maximo_selecoes TINYINT UNSIGNED NOT NULL DEFAULT 1,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uk_grupos_adicionais_id_est (id, estabelecimento_id),
  CONSTRAINT fk_grupos_adicionais_est
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT ck_grupos_adicionais_selecoes CHECK (maximo_selecoes >= minimo_selecoes)
) ENGINE=InnoDB;

CREATE TABLE adicionais (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  grupo_adicional_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(100) NOT NULL,
  acrescimo_preco DECIMAL(10,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem_exibicao SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_adicionais_id_grupo (id, grupo_adicional_id, estabelecimento_id),
  UNIQUE KEY uk_adicionais_id_estabelecimento (id, estabelecimento_id),
  KEY ix_adicionais_grupo (grupo_adicional_id, ativo),
  CONSTRAINT fk_adicionais_grupo
    FOREIGN KEY (grupo_adicional_id, estabelecimento_id)
    REFERENCES grupos_adicionais (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT ck_adicionais_preco CHECK (acrescimo_preco >= 0)
) ENGINE=InnoDB;

CREATE TABLE produtos_grupos_adicionais (
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  produto_id BIGINT UNSIGNED NOT NULL,
  grupo_adicional_id BIGINT UNSIGNED NOT NULL,
  ordem_exibicao SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (produto_id, grupo_adicional_id),
  CONSTRAINT fk_produtos_grupos_produto
    FOREIGN KEY (produto_id, estabelecimento_id)
    REFERENCES produtos (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_produtos_grupos_grupo
    FOREIGN KEY (grupo_adicional_id, estabelecimento_id)
    REFERENCES grupos_adicionais (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE pedidos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  numero_pedido INT UNSIGNED NOT NULL,
  celular_cliente CHAR(11) NOT NULL,
  preferencia_pagamento ENUM('caixa', 'maquininha') NOT NULL DEFAULT 'caixa',
  origem ENUM('cardapio_digital', 'equipe') NOT NULL DEFAULT 'cardapio_digital',
  situacao ENUM('recebido', 'em_preparo', 'pronto', 'cliente_avisado', 'finalizado', 'cancelado') NOT NULL DEFAULT 'recebido',
  observacoes VARCHAR(1000) NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pedidos_numero (estabelecimento_id, numero_pedido),
  UNIQUE KEY uk_pedidos_id_estabelecimento (id, estabelecimento_id),
  KEY ix_pedidos_celular (estabelecimento_id, celular_cliente, criado_em),
  KEY ix_pedidos_situacao (estabelecimento_id, situacao, atualizado_em),
  CONSTRAINT fk_pedidos_estabelecimento
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT ck_pedidos_celular CHECK (CHAR_LENGTH(celular_cliente) = 11),
  CONSTRAINT ck_pedidos_valores CHECK (
    subtotal >= 0 AND valor_desconto >= 0 AND valor_total >= 0
    AND valor_total = subtotal - valor_desconto
  )
) ENGINE=InnoDB;

CREATE TABLE itens_pedido (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  pedido_id BIGINT UNSIGNED NOT NULL,
  produto_id BIGINT UNSIGNED NULL,
  variante_produto_id BIGINT UNSIGNED NULL,
  nome_produto_registrado VARCHAR(160) NOT NULL,
  nome_variante_registrada VARCHAR(100) NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  quantidade SMALLINT UNSIGNED NOT NULL,
  observacoes VARCHAR(500) NULL,
  valor_total_item DECIMAL(10,2) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_itens_pedido_id_est (id, estabelecimento_id),
  KEY ix_itens_pedido (pedido_id),
  CONSTRAINT fk_itens_pedido_pedido
    FOREIGN KEY (pedido_id, estabelecimento_id)
    REFERENCES pedidos (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_itens_pedido_produto
    FOREIGN KEY (produto_id, estabelecimento_id)
    REFERENCES produtos (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_itens_pedido_variante
    FOREIGN KEY (variante_produto_id, produto_id, estabelecimento_id)
    REFERENCES variantes_produto (id, produto_id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT ck_itens_pedido_valores CHECK (
    quantidade > 0 AND preco_unitario >= 0 AND valor_total_item >= 0
  )
) ENGINE=InnoDB;

CREATE TABLE adicionais_item_pedido (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  item_pedido_id BIGINT UNSIGNED NOT NULL,
  adicional_id BIGINT UNSIGNED NULL,
  nome_adicional_registrado VARCHAR(100) NOT NULL,
  acrescimo_registrado DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_adicionais_item_pedido (item_pedido_id),
  CONSTRAINT fk_adicionais_item_pedido_item
    FOREIGN KEY (item_pedido_id, estabelecimento_id)
    REFERENCES itens_pedido (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_adicionais_item_pedido_adicional
    FOREIGN KEY (adicional_id, estabelecimento_id)
    REFERENCES adicionais (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT ck_adicionais_item_preco CHECK (acrescimo_registrado >= 0)
) ENGINE=InnoDB;

CREATE TABLE historico_situacoes_pedido (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  pedido_id BIGINT UNSIGNED NOT NULL,
  alterado_por_usuario_id BIGINT UNSIGNED NULL,
  situacao_anterior ENUM('recebido', 'em_preparo', 'pronto', 'cliente_avisado', 'finalizado', 'cancelado') NULL,
  situacao_nova ENUM('recebido', 'em_preparo', 'pronto', 'cliente_avisado', 'finalizado', 'cancelado') NOT NULL,
  observacao VARCHAR(500) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_historico_pedido (pedido_id, criado_em),
  CONSTRAINT fk_historico_pedido
    FOREIGN KEY (pedido_id, estabelecimento_id)
    REFERENCES pedidos (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_historico_usuario
    FOREIGN KEY (alterado_por_usuario_id, estabelecimento_id)
    REFERENCES usuarios (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE pagamentos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  estabelecimento_id BIGINT UNSIGNED NOT NULL,
  pedido_id BIGINT UNSIGNED NOT NULL,
  metodo ENUM('dinheiro', 'pix', 'credito', 'debito') NOT NULL,
  situacao ENUM('pendente', 'pago', 'falhou', 'estornado', 'cancelado') NOT NULL DEFAULT 'pendente',
  valor DECIMAL(10,2) NOT NULL,
  referencia_transacao VARCHAR(160) NULL,
  pago_em TIMESTAMP NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_pagamentos_pedido_situacao (pedido_id, situacao),
  CONSTRAINT fk_pagamentos_pedido
    FOREIGN KEY (pedido_id, estabelecimento_id)
    REFERENCES pedidos (id, estabelecimento_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT ck_pagamentos_valor CHECK (valor > 0)
) ENGINE=InnoDB;
