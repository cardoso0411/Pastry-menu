require('dotenv').config({ path: require('node:path').join(__dirname, '../backend.env') })

const crypto = require('node:crypto')
const express = require('express')
const pool = require('./db')

const app = express()
const port = Number(process.env.PORT || 3001)
const establishmentId = Number(process.env.ESTABELECIMENTO_ID || 1)
const tokenSecret = process.env.PEDIDO_TOKEN_SECRET || ''

app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))

function httpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function cents(value) {
  return Math.round(Number(value) * 100)
}

function reais(value) {
  return (value / 100).toFixed(2)
}

function tokenForOrder(id) {
  const signature = crypto.createHmac('sha256', tokenSecret).update(String(id)).digest('hex')
  return `${id}.${signature}`
}

function authorizedOrderId(request) {
  const token = /^Bearer (\d+)\.([a-f0-9]{64})$/.exec(request.get('authorization') || '')
  if (!token || token[1] !== request.params.id) throw httpError(403, 'Acesso ao pedido não autorizado.')
  const expected = crypto.createHmac('sha256', tokenSecret).update(token[1]).digest()
  const provided = Buffer.from(token[2], 'hex')
  if (!crypto.timingSafeEqual(expected, provided)) throw httpError(403, 'Acesso ao pedido não autorizado.')
  return token[1]
}

app.get('/api/saude', async (_request, response, next) => {
  try {
    await pool.query('SELECT 1')
    response.json({ situacao: 'ok' })
  } catch (error) { next(error) }
})

app.get('/api/cardapio', async (_request, response, next) => {
  try {
    const [establishments] = await pool.execute(
      'SELECT id, nome FROM estabelecimentos WHERE id = ? AND ativo = 1', [establishmentId],
    )
    if (!establishments.length) throw httpError(404, 'Estabelecimento não encontrado ou inativo.')
    const [categories] = await pool.execute(
      `SELECT id, nome, descricao FROM categorias
       WHERE estabelecimento_id = ? AND ativo = 1 ORDER BY ordem_exibicao, nome`,
      [establishmentId],
    )
    const [products] = await pool.execute(
      `SELECT p.id, p.nome, p.descricao, p.preco_base, p.url_imagem,
              c.id AS categoria_id, c.nome AS categoria
       FROM produtos p LEFT JOIN categorias c
         ON c.id = p.categoria_id AND c.estabelecimento_id = p.estabelecimento_id
       WHERE p.estabelecimento_id = ? AND p.disponivel = 1
         AND (c.id IS NULL OR c.ativo = 1)
       ORDER BY p.ordem_exibicao, p.nome`,
      [establishmentId],
    )
    response.json({
      estabelecimento: establishments[0],
      categorias: categories,
      produtos: products.map(product => ({ ...product, preco_base: Number(product.preco_base) })),
    })
  } catch (error) { next(error) }
})

app.post('/api/pedidos', async (request, response, next) => {
  const { celular_cliente: phone, preferencia_pagamento: payment, observacoes, itens } = request.body || {}
  if (typeof phone !== 'string' || !/^[1-9]{2}9\d{8}$/.test(phone))
    return next(httpError(400, 'Informe um celular válido com DDD.'))
  if (!['caixa', 'maquininha'].includes(payment))
    return next(httpError(400, 'Preferência de pagamento inválida.'))
  if (observacoes != null && (typeof observacoes !== 'string' || observacoes.length > 1000))
    return next(httpError(400, 'Observações do pedido inválidas.'))
  if (!Array.isArray(itens) || !itens.length || itens.length > 50 || itens.some(item =>
    !item || !Number.isSafeInteger(item.produto_id) || item.produto_id < 1 ||
    !Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 99 ||
    (item.observacoes != null && (typeof item.observacoes !== 'string' || item.observacoes.length > 500))
  )) return next(httpError(400, 'Itens do pedido inválidos.'))

  const connection = await pool.getConnection().catch(next)
  if (!connection) return
  try {
    await connection.beginTransaction()
    const [establishments] = await connection.execute(
      'SELECT id FROM estabelecimentos WHERE id = ? AND ativo = 1 FOR UPDATE', [establishmentId],
    )
    if (!establishments.length) throw httpError(404, 'Estabelecimento não encontrado ou inativo.')

    const ids = [...new Set(itens.map(item => item.produto_id))]
    const placeholders = ids.map(() => '?').join(', ')
    const [products] = await connection.execute(
      `SELECT p.id, p.nome, p.preco_base FROM produtos p
       LEFT JOIN categorias c ON c.id = p.categoria_id AND c.estabelecimento_id = p.estabelecimento_id
       WHERE p.estabelecimento_id = ? AND p.id IN (${placeholders}) AND p.disponivel = 1
         AND (c.id IS NULL OR c.ativo = 1)`,
      [establishmentId, ...ids],
    )
    if (products.length !== ids.length) throw httpError(409, 'Um produto do carrinho não está mais disponível.')
    const productById = new Map(products.map(product => [Number(product.id), product]))
    const subtotal = itens.reduce((sum, item) =>
      sum + cents(productById.get(item.produto_id).preco_base) * item.quantidade, 0)
    if (!Number.isSafeInteger(subtotal) || subtotal > 9999999999)
      throw httpError(400, 'Valor do pedido acima do limite permitido.')

    const [[{ nextNumber }]] = await connection.execute(
      'SELECT COALESCE(MAX(numero_pedido), 0) + 1 AS nextNumber FROM pedidos WHERE estabelecimento_id = ?',
      [establishmentId],
    )
    const [created] = await connection.execute(
      `INSERT INTO pedidos (estabelecimento_id, numero_pedido, celular_cliente,
         preferencia_pagamento, origem, situacao, observacoes, subtotal, valor_total)
       VALUES (?, ?, ?, ?, 'cardapio_digital', 'recebido', ?, ?, ?)`,
      [establishmentId, nextNumber, phone, payment, observacoes?.trim() || null, reais(subtotal), reais(subtotal)],
    )
    for (const item of itens) {
      const product = productById.get(item.produto_id)
      const itemCents = cents(product.preco_base) * item.quantidade
      await connection.execute(
        `INSERT INTO itens_pedido (estabelecimento_id, pedido_id, produto_id,
           nome_produto_registrado, preco_unitario, quantidade, observacoes, valor_total_item)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [establishmentId, created.insertId, item.produto_id, product.nome,
          product.preco_base, item.quantidade, item.observacoes?.trim() || null, reais(itemCents)],
      )
    }
    await connection.execute(
      `INSERT INTO historico_situacoes_pedido
         (estabelecimento_id, pedido_id, situacao_nova)
       VALUES (?, ?, 'recebido')`, [establishmentId, created.insertId],
    )
    await connection.commit()
    response.status(201).json({
      id: created.insertId,
      numero_pedido: nextNumber,
      situacao: 'recebido',
      valor_total: Number(reais(subtotal)),
      token_consulta: tokenForOrder(created.insertId),
    })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
  }
})

app.get('/api/pedidos/:id', async (request, response, next) => {
  try {
    const id = authorizedOrderId(request)
    const [orders] = await pool.execute(
      `SELECT id, numero_pedido, situacao, preferencia_pagamento, valor_total, criado_em, atualizado_em
       FROM pedidos WHERE id = ? AND estabelecimento_id = ?`, [id, establishmentId],
    )
    if (!orders.length) throw httpError(404, 'Pedido não encontrado.')
    response.json({ ...orders[0], valor_total: Number(orders[0].valor_total) })
  } catch (error) { next(error) }
})

app.use((error, _request, response, _next) => {
  if (error.status) return response.status(error.status).json({ erro: error.message })
  console.error(error)
  response.status(500).json({ erro: 'Não foi possível concluir a operação.' })
})

if (!Number.isSafeInteger(establishmentId) || establishmentId < 1 || tokenSecret.length < 32) {
  console.error('Configure ESTABELECIMENTO_ID e PEDIDO_TOKEN_SECRET (mínimo de 32 caracteres) no Backend/backend.env.')
  process.exit(1)
}

pool.query('SELECT 1')
  .then(() => app.listen(port, () => console.log(`API disponível na porta ${port}`)))
  .catch(error => {
    console.error('Falha na conexão com MySQL. Verifique se o servidor está ativo e as credenciais em Backend/backend.env:', error.message)
    process.exitCode = 1
    pool.end()
  })
