require('dotenv').config()

const fs = require('node:fs/promises')
const path = require('node:path')
const mysql = require('mysql2/promise')

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pastry_menu',
    multipleStatements: true,
  })
  try {
    const sql = await fs.readFile(path.join(__dirname, '../database/dados_iniciais.sql'), 'utf8')
    await connection.query(sql)
    const [[establishment]] = await connection.execute(
      "SELECT id FROM estabelecimentos WHERE identificador_url = 'pastry-menu' LIMIT 1",
    )
    console.log(`Dados iniciais carregados. Configure ESTABELECIMENTO_ID=${establishment.id} no .env.`)
  } finally {
    await connection.end()
  }
}

main().catch(error => {
  console.error('Falha ao carregar dados iniciais:', error.message)
  process.exitCode = 1
})
