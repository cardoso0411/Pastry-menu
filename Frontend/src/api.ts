import axios from "axios"

export type Catalog = {
  estabelecimento: { id: number; nome: string }
  categorias: { id: number; nome: string; descricao: string | null }[]
  produtos: {
    id: number
    nome: string
    descricao: string | null
    preco_base: number
    url_imagem: string | null
    categoria: string | null
  }[]
}

export type CreatedOrder = {
  id: number
  numero_pedido: number
  situacao: string
  valor_total: number
  token_consulta: string
}

export type OrderStatus = {
  id: number
  numero_pedido: number
  situacao: string
  preferencia_pagamento: "caixa" | "maquininha"
  valor_total: number
  criado_em: string
  atualizado_em: string
}

const api = axios.create({ baseURL: "/api", timeout: 10000 })

export async function getCatalog() {
  const { data } = await api.get<Catalog>("/cardapio")
  return data
}

export async function createOrder(payload: {
  celular_cliente: string
  preferencia_pagamento: "caixa" | "maquininha"
  observacoes?: string
  itens: { produto_id: number; quantidade: number; observacoes?: string }[]
}) {
  const { data } = await api.post<CreatedOrder>("/pedidos", payload)
  return data
}

export async function getOrderStatus(order: CreatedOrder) {
  const { data } = await api.get<OrderStatus>(`/pedidos/${order.id}`, {
    headers: { Authorization: `Bearer ${order.token_consulta}` },
  })
  return data
}

export function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ erro?: string }>(error))
    return error.response?.data?.erro || "Não foi possível conectar ao servidor. Tente novamente."
  return "Não foi possível concluir a operação. Tente novamente."
}
