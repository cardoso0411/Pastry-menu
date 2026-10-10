import { useMemo, useState } from "react"

type Page = "home" | "menu" | "product" | "cart" | "checkout" | "success" | "tracking" | "admin"

type Product = {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  badge?: string
}

const photos = {
  hero: "https://images.unsplash.com/photo-1543738066-49621e5b1f87?auto=format&fit=crop&w=1400&q=86",
  pastel:
    "https://images.unsplash.com/photo-1571292226185-6a16b4d879ee?auto=format&fit=crop&w=900&q=84",
  plate:
    "https://images.unsplash.com/photo-1681389158414-adf7f9583f24?auto=format&fit=crop&w=900&q=84",
  snack:
    "https://images.unsplash.com/photo-1704763673093-45b6267a7b8e?auto=format&fit=crop&w=900&q=84",
  sweet:
    "https://images.unsplash.com/photo-1677370261616-48751f23f8a2?auto=format&fit=crop&w=900&q=84",
}

const products: Product[] = [
  {
    id: 1,
    name: "Pastel da Casa",
    description: "Carne temperada, queijo meia cura e azeitonas.",
    price: 16.9,
    category: "Especiais",
    image: photos.pastel,
    badge: "Mais pedido",
  },
  {
    id: 2,
    name: "Carne com Queijo",
    description: "Carne moída artesanal e muçarela derretida.",
    price: 14.9,
    category: "Clássicos",
    image: photos.plate,
  },
  {
    id: 3,
    name: "Palmito Cremoso",
    description: "Palmito, requeijão cremoso e ervas frescas.",
    price: 15.9,
    category: "Vegetarianos",
    image: photos.snack,
    badge: "Vegetariano",
  },
  {
    id: 4,
    name: "Romeu & Julieta",
    description: "Goiabada cascão com queijo, crocante por fora.",
    price: 12.9,
    category: "Doces",
    image: photos.sweet,
    badge: "Novo",
  },
]

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.6L21 7H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    back: (
      <>
        <path d="M19 12H5" />
        <path d="m10 17-5-5 5-5" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    orders: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    box: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo" aria-label="Pastry Menu">
      <div className="logo-mark">
        <span />
      </div>
      {!compact && (
        <div className="logo-type">
          <strong>PASTRY</strong>
          <small>MENU</small>
        </div>
      )}
    </div>
  )
}

function Button({
  children,
  variant = "primary",
  onClick,
  icon,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "ghost" | "dark"
  onClick?: () => void
  icon?: string
  type?: "button" | "submit"
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{children}</span>
      {icon && <Icon name={icon} />}
    </button>
  )
}

function Heading({
  as = 2,
  children,
  className = "",
}: {
  as?: 1 | 2 | 3
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="heading"
      aria-level={as}
      className={`heading heading-${as} ${className}`}
    >
      {children}
    </div>
  )
}

function Header({
  page,
  navigate,
  cartCount,
}: {
  page: Page
  navigate: (p: Page) => void
  cartCount: number
}) {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          className="logo-button"
          onClick={() => navigate("home")}
          aria-label="Ir para início"
        >
          <Logo />
        </button>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <button
            className={page === "home" ? "active" : ""}
            onClick={() => navigate("home")}
          >
            Início
          </button>
          <button
            className={page === "menu" ? "active" : ""}
            onClick={() => navigate("menu")}
          >
            Cardápio
          </button>
          <button onClick={() => navigate("tracking")}>Acompanhar pedido</button>
          <button onClick={() => navigate("admin")}>Área da loja</button>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button search-desktop"
            aria-label="Buscar"
            onClick={() => navigate("menu")}
          >
            <Icon name="search" />
          </button>
          <button
            className="cart-button"
            onClick={() => navigate("cart")}
            aria-label={`Carrinho com ${cartCount} itens`}
          >
            <Icon name="cart" />
            <span className="cart-label">Carrinho</span>
            {cartCount > 0 && <b>{cartCount}</b>}
          </button>
          <button
            className="icon-button mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menu"
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Navegação mobile">
          {([
            ["home", "Início"],
            ["menu", "Cardápio"],
            ["tracking", "Acompanhar pedido"],
            ["admin", "Área da loja"],
          ] as [Page, string][]).map(([target, label]) => (
            <button
              key={target}
              onClick={() => {
                navigate(target)
                setOpen(false)
              }}
            >
              {label}
              <Icon name="arrow" />
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}

function ProductCard({
  product,
  open,
  add,
}: {
  product: Product
  open: () => void
  add: () => void
}) {
  return (
    <article className="product-card">
      <button
        className="product-image"
        onClick={open}
        aria-label={`Ver ${product.name}`}
      >
        <img src={product.image} alt={product.name} />
        {product.badge && <span className="badge">{product.badge}</span>}
      </button>
      <div className="product-copy">
        <small>{product.category}</small>
        <button className="product-name" onClick={open}>
          {product.name}
        </button>
        <p>{product.description}</p>
        <div className="product-foot">
          <strong>{money(product.price)}</strong>
          <button
            className="add-button"
            onClick={add}
            aria-label={`Adicionar ${product.name}`}
          >
            <Icon name="plus" />
          </button>
        </div>
      </div>
    </article>
  )
}

function Home({
  navigate,
  add,
  tableNumber,
}: {
  navigate: (p: Page) => void
  add: (product: Product) => void
  tableNumber: string
}) {
  return (
    <main>
      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">
            <i /> Feito na hora, do nosso jeito
          </span>
          <Heading as={1}>
            Crocante por fora.
            <br />
            <em>Irresistível</em> por dentro.
          </Heading>
          <p>
            Escolha seus favoritos pelo tablet da mesa. A gente prepara tudo
            na hora e leva até você.
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate("menu")} icon="arrow">
              Ver cardápio
            </Button>
            <span>
              <Icon name="location" /> Atendimento na mesa {tableNumber}
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-sun" />
          <img
            src={photos.hero}
            alt="Pastéis crocantes servidos em uma panela"
          />
          <div className="rating-card">
            <span>
              <Icon name="star" />
            </span>
            <div>
              <strong>4,9</strong>
              <small>+2 mil avaliações</small>
            </div>
          </div>
          <div className="fresh-note">
            feito
            <br />
            <strong>fresquinho!</strong>
          </div>
        </div>
      </section>

      <section className="category-strip">
        <div className="shell category-row">
          {[
            ["Clássicos", "Carne, queijo e mais"],
            ["Especiais", "Combinações da casa"],
            ["Vegetarianos", "Leves e saborosos"],
            ["Doces", "Para fechar bem"],
          ].map(([name, text], i) => (
            <button
              key={name}
              className="category-item"
              onClick={() => navigate("menu")}
            >
              <span className={`category-icon category-${i + 1}`}>
                <Icon name={i === 3 ? "star" : "box"} />
              </span>
              <span>
                <strong>{name}</strong>
                <small>{text}</small>
              </span>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </section>

      <section className="featured shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <i /> Os queridinhos
            </span>
            <Heading>Mais pedidos da casa</Heading>
          </div>
          <button className="text-link" onClick={() => navigate("menu")}>
            Ver todos <Icon name="arrow" />
          </button>
        </div>
        <div className="product-grid">
          {products.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              open={() => navigate("product")}
              add={() => add(product)}
            />
          ))}
        </div>
      </section>

      <section className="promo shell">
        <div>
          <span className="promo-kicker">Oferta da semana</span>
          <Heading>
            Dois pastéis +<br />
            caldo de cana
          </Heading>
          <p>A dupla perfeita para matar a fome.</p>
          <div className="promo-price">
            <small>por apenas</small>
            <strong>R$ 29,90</strong>
          </div>
          <Button variant="dark" onClick={() => navigate("menu")}>
            Quero essa oferta
          </Button>
        </div>
        <img src={photos.plate} alt="Pastéis dourados da oferta" />
      </section>

      <section className="info-bar shell">
        <div>
          <Icon name="clock" />
          <span>
            <strong>Ter–Dom</strong>
            <small>11h às 22h30</small>
          </span>
        </div>
        <div>
          <Icon name="location" />
          <span>
            <strong>Peça pelo tablet</strong>
            <small>Sem fila, direto da sua mesa</small>
          </span>
        </div>
        <div>
          <Icon name="star" />
          <span>
            <strong>Servido na sua mesa</strong>
            <small>Preparado na hora, com carinho</small>
          </span>
        </div>
      </section>
    </main>
  )
}

function MenuPage({
  navigate,
  add,
}: {
  navigate: (p: Page) => void
  add: (product: Product) => void
}) {
  const [category, setCategory] = useState("Todos")
  const [query, setQuery] = useState("")
  const categories = [
    "Todos",
    "Clássicos",
    "Especiais",
    "Vegetarianos",
    "Doces",
  ]
  const visible = products.filter(
    (p) =>
      (category === "Todos" || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <main className="menu-page shell">
      <div className="menu-intro">
        <span className="eyebrow">
          <i /> Escolha sem pressa
        </span>
        <Heading as={1}>Nosso cardápio</Heading>
        <p>Pastéis feitos na hora, com massa sequinha e recheio de verdade.</p>
      </div>
      <div className="menu-tools">
        <label className="search-field">
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qual pastel você procura?"
          />
        </label>
        <div className="chips">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="menu-result">
        <span>
          <strong>{visible.length}</strong> sabores encontrados
        </span>
        <select aria-label="Ordenar produtos">
          <option>Mais pedidos</option>
          <option>Menor preço</option>
        </select>
      </div>
      {visible.length ? (
        <div className="product-grid">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              open={() => navigate("product")}
              add={() => add(product)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="search" size={32} />
          <Heading as={3}>Nenhum pastel encontrado</Heading>
          <p>Tente buscar outro sabor ou categoria.</p>
        </div>
      )}
    </main>
  )
}

function ProductPage({
  navigate,
  add,
}: {
  navigate: (p: Page) => void
  add: (product: Product) => void
}) {
  const product = products[0]
  const [qty, setQty] = useState(1)
  const [size, setSize] = useState("Tradicional")
  return (
    <main className="product-page shell">
      <button className="back-link" onClick={() => navigate("menu")}>
        <Icon name="back" /> Voltar ao cardápio
      </button>
      <div className="product-detail">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
          <span className="badge">Mais pedido</span>
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            <i /> Especial da casa
          </span>
          <Heading as={1}>{product.name}</Heading>
          <div className="detail-rating">
            <Icon name="star" />
            <strong>4,9</strong>
            <span>(328 avaliações)</span>
          </div>
          <p className="detail-description">
            Nossa receita mais amada: carne moída bem temperada, queijo meia
            cura derretido, azeitonas e um toque de cheiro-verde.
          </p>
          <div className="ingredients">
            <strong>Ingredientes</strong>
            <p>
              Carne bovina, queijo meia cura, azeitonas, cebola, cheiro-verde e
              temperos da casa.
            </p>
          </div>
          <fieldset className="options">
            <legend>
              Escolha o tamanho <small>Obrigatório</small>
            </legend>
            {["Tradicional", "Grande (+ R$ 4,00)"].map((item) => (
              <label key={item} className={size === item ? "selected" : ""}>
                <input
                  type="radio"
                  name="size"
                  checked={size === item}
                  onChange={() => setSize(item)}
                />
                <span>{item}</span>
                <b>
                  {item === "Tradicional"
                    ? money(product.price)
                    : money(product.price + 4)}
                </b>
              </label>
            ))}
          </fieldset>
          <label className="note-field">
            <strong>Alguma observação?</strong>
            <textarea
              placeholder="Ex.: sem azeitonas, bem passado..."
              maxLength={140}
            />
          </label>
          <div className="detail-action">
            <div className="stepper">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>
                <Icon name="minus" />
              </button>
              <strong>{qty}</strong>
              <button onClick={() => setQty(qty + 1)}>
                <Icon name="plus" />
              </button>
            </div>
            <Button
              onClick={() => {
                for (let i = 0; i < qty; i++) add(product)
                navigate("cart")
              }}
            >
              Adicionar • {money(product.price * qty)}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

function CartPage({
  navigate,
  cart,
  remove,
}: {
  navigate: (p: Page) => void
  cart: Product[]
  remove: (id: number) => void
}) {
  const subtotal = cart.reduce((sum, p) => sum + p.price, 0)
  const grouped = products
    .map((p) => ({ ...p, qty: cart.filter((i) => i.id === p.id).length }))
    .filter((p) => p.qty)
  return (
    <main className="cart-page shell">
      <button className="back-link" onClick={() => navigate("menu")}>
        <Icon name="back" /> Continuar comprando
      </button>
      <Heading as={1}>Seu carrinho</Heading>
      {!cart.length ? (
        <div className="empty-state cart-empty">
          <Icon name="cart" size={36} />
          <Heading as={3}>Seu carrinho está vazio</Heading>
          <p>Que tal escolher um pastel quentinho?</p>
          <Button onClick={() => navigate("menu")}>Ver cardápio</Button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {grouped.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt="" />
                <div>
                  <strong>{item.name}</strong>
                  <small>Tradicional</small>
                  <button onClick={() => remove(item.id)}>Remover</button>
                </div>
                <span>{item.qty} un.</span>
                <b>{money(item.price * item.qty)}</b>
              </article>
            ))}
            <label className="note-field">
              <strong>Observação do pedido</strong>
              <textarea placeholder="Precisa de algo? Escreva aqui." />
            </label>
          </div>
          <aside className="order-summary">
            <Heading as={3}>Resumo do pedido</Heading>
            <div>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            <hr />
            <div className="total">
              <span>Total</span>
              <b>{money(subtotal)}</b>
            </div>
            <small>Pedido para consumo na pastelaria</small>
            <Button onClick={() => navigate("checkout")} icon="arrow">
              Revisar pedido
            </Button>
          </aside>
        </div>
      )}
    </main>
  )
}

function Checkout({
  navigate,
  total,
  cart,
  tableNumber,
}: {
  navigate: (p: Page) => void
  total: number
  cart: Product[]
  tableNumber: string
}) {
  const [step, setStep] = useState(1)
  const titles = ["Mesa", "Pagamento", "Revisão"]
  const grouped = products
    .map((product) => ({
      ...product,
      quantity: cart.filter((item) => item.id === product.id).length,
    }))
    .filter((product) => product.quantity > 0)
  return (
    <main className="checkout-page shell">
      <button
        className="back-link"
        onClick={() => (step > 1 ? setStep(step - 1) : navigate("cart"))}
      >
        <Icon name="back" /> Voltar
      </button>
      <div className="checkout-header">
        <div>
          <span className="eyebrow">
            <i /> Pedido para consumo na pastelaria
          </span>
          <Heading as={1}>{titles[step - 1]}</Heading>
        </div>
        <Logo />
      </div>
      <div className="progress-steps">
        {titles.map((title, index) => (
          <div key={title} className={step >= index + 1 ? "active" : ""}>
            <span>{step > index + 1 ? <Icon name="check" /> : index + 1}</span>
            <small>{title}</small>
          </div>
        ))}
      </div>
      <div className="checkout-layout">
        <section className="checkout-form">
          {step === 1 && (
            <>
              <Heading as={3}>Este pedido será servido na sua mesa</Heading>
              <div className="review-card">
                <div>
                  <span>Mesa</span>
                  <strong>{tableNumber}</strong>
                  <small>Confira se o número corresponde à sua mesa.</small>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <Heading as={3}>Como prefere pagar?</Heading>
              <div className="choice-list compact">
                <label className="selected">
                  <input type="radio" name="payment" defaultChecked />
                  <span>
                    <strong>No caixa</strong>
                    <small>Ao terminar sua refeição</small>
                  </span>
                </label>
                <label>
                  <input type="radio" name="payment" />
                  <span>
                    <strong>Pix pelo tablet</strong>
                    <small>Faça o pagamento pelo celular</small>
                  </span>
                </label>
                <label>
                  <input type="radio" name="payment" />
                  <span>
                    <strong>Cartão na mesa</strong>
                    <small>Solicite a maquininha à equipe</small>
                  </span>
                </label>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <Heading as={3}>Confira seu pedido</Heading>
              <div className="review-card">
                <div>
                  <span>Consumo</span>
                  <strong>Mesa {tableNumber}</strong>
                </div>
                <button onClick={() => setStep(1)}>Editar</button>
              </div>
              <div className="review-card">
                <div>
                  <span>Pagamento</span>
                  <strong>Forma escolhida no tablet</strong>
                </div>
                <button onClick={() => setStep(2)}>Editar</button>
              </div>
              {grouped.map((item) => (
                <div className="review-card" key={item.id}>
                  <div>
                    <span>{item.quantity} × {item.name}</span>
                    <strong>{money(item.price * item.quantity)}</strong>
                  </div>
                </div>
              ))}
            </>
          )}
          <div className="form-action">
            <Button
              onClick={() =>
                step < 3 ? setStep(step + 1) : navigate("success")
              }
              icon="arrow"
            >
              {step === 3 ? "Enviar pedido à cozinha" : "Continuar"}
            </Button>
          </div>
        </section>
        <aside className="mini-summary">
          <span>Mesa {tableNumber}</span>
          {grouped.map((item) => (
            <div className="mini-product" key={item.id}>
              <img src={item.image} alt="" />
              <div>
                <strong>{item.quantity}× {item.name}</strong>
                <small>Consumo na pastelaria</small>
              </div>
              <b>{money(item.price * item.quantity)}</b>
            </div>
          ))}
          <hr />
          <div>
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          <small>
            <Icon name="clock" /> Preparado na hora e servido à mesa
          </small>
        </aside>
      </div>
    </main>
  )
}

function Success({
  navigate,
  total,
  tableNumber,
}: {
  navigate: (p: Page) => void
  total: number
  tableNumber: string
}) {
  return (
    <main className="success-page shell">
      <div className="success-icon">
        <Icon name="check" size={40} />
      </div>
      <span className="eyebrow">
        <i /> Pedido confirmado
      </span>
      <Heading as={1}>
        Oba! Já recebemos
        <br />
        seu pedido.
      </Heading>
      <p>
        Agora é com a gente. Vamos preparar tudo fresquinho e levar até a sua
        mesa.
      </p>
      <div className="success-card">
        <div>
          <span>Número do pedido</span>
          <strong>#PM-1048</strong>
        </div>
        <div>
          <span>Mesa</span>
          <strong>{tableNumber}</strong>
        </div>
        <div>
          <span>Total</span>
          <strong>{money(total)}</strong>
        </div>
      </div>
      <Button onClick={() => navigate("tracking")} icon="arrow">
        Ver status do pedido
      </Button>
      <button className="text-link" onClick={() => navigate("home")}>
        Voltar ao início
      </button>
    </main>
  )
}

function Tracking({ navigate, tableNumber }: { navigate: (p: Page) => void; tableNumber: string }) {
  const steps = [
    ["Pedido recebido", "19:04"],
    ["Em preparação", "19:08"],
    ["Pronto", "Aguardando"],
    ["Servido na mesa", "Aguardando"],
    ["Finalizado", "Aguardando"],
  ]
  return (
    <main className="tracking-page shell">
      <button className="back-link" onClick={() => navigate("home")}>
        <Icon name="back" /> Início
      </button>
      <div className="tracking-intro">
        <span className="eyebrow">
          <i /> Pedido #PM-1048
        </span>
        <Heading as={1}>
          Acompanhe seu pedido
          <br />
          até a mesa.
        </Heading>
        <p>
          Estamos preparando tudo fresquinho para servir na <strong>mesa {tableNumber}.</strong>
        </p>
      </div>
      <div className="tracking-layout">
        <section className="timeline">
          {steps.map(([name, time], index) => (
            <div key={name} className={index <= 1 ? "done" : ""}>
              <span>{index < 1 ? <Icon name="check" /> : index + 1}</span>
              <div>
                <strong>{name}</strong>
                <small>{time}</small>
                {index === 1 && (
                  <p>Seus pastéis estão sendo preparados agora.</p>
                )}
              </div>
            </div>
          ))}
        </section>
        <aside className="delivery-card">
          <span>Consumo na pastelaria</span>
          <Heading as={2}>Mesa {tableNumber}</Heading>
          <div className="map-art">
            <Icon name="location" size={32} />
          </div>
          <strong>Seu pedido está sendo preparado</strong>
          <small>A equipe leva até a sua mesa quando estiver pronto.</small>
          <hr />
          <button>
            Precisa de ajuda? <Icon name="arrow" />
          </button>
        </aside>
      </div>
    </main>
  )
}

function Admin({ navigate }: { navigate: (p: Page) => void }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [tab, setTab] = useState("Visão geral")
  const [status, setStatus] = useState("Em preparação")
  const [orderDetail, setOrderDetail] = useState(false)
  const [productForm, setProductForm] = useState(false)
  const nav = [
    ["Visão geral", "grid"],
    ["Pedidos", "orders"],
    ["Produtos", "box"],
    ["Categorias", "grid"],
    ["Clientes", "user"],
  ]

  if (!authenticated) {
    return (
      <main className="admin-login">
        <button className="admin-back" onClick={() => navigate("home")}>
          <Icon name="back" /> Voltar para a loja
        </button>
        <section className="login-card">
          <Logo />
          <span className="eyebrow">
            <i /> Área administrativa
          </span>
          <Heading as={1}>Bem-vinda de volta.</Heading>
          <p>Acompanhe sua operação e mantenha o cardápio sempre atualizado.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setAuthenticated(true)
            }}
          >
            <label>
              E-mail
              <input type="email" defaultValue="admin@pastrymenu.com.br" />
            </label>
            <label>
              Senha
              <input type="password" defaultValue="pastrymenu" />
            </label>
            <div className="login-options">
              <label>
                <input type="checkbox" defaultChecked /> Manter conectado
              </label>
              <button type="button">Esqueci minha senha</button>
            </div>
            <Button type="submit" icon="arrow">
              Entrar no painel
            </Button>
          </form>
          <small>Acesso exclusivo para a equipe Pastry Menu</small>
        </section>
        <aside className="login-art">
          <img src={photos.hero} alt="Pastéis preparados na loja" />
          <div>
            <span>Operação de hoje</span>
            <strong>48 pedidos</strong>
            <small>96% entregues no prazo</small>
          </div>
        </aside>
      </main>
    )
  }

  const changeTab = (nextTab: string) => {
    setTab(nextTab)
    setOrderDetail(false)
    setProductForm(false)
  }

  return (
    <main className="admin">
      <aside className="admin-sidebar">
        <Logo />
        <nav>
          {nav.map(([label, icon]) => (
            <button
              key={label}
              className={tab === label ? "active" : ""}
              onClick={() => changeTab(label)}
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </nav>
        <button className="store-link" onClick={() => navigate("home")}>
          <Icon name="back" /> Ver loja
        </button>
      </aside>
      <section className="admin-content">
        <div className="admin-top">
          <div>
            <small>Terça-feira, 28 de maio</small>
            <Heading as={1}>{tab}</Heading>
          </div>
          <div className="admin-user">
            <span>MA</span>
            <div>
              <strong>Marina Alves</strong>
              <small>Administradora</small>
            </div>
          </div>
        </div>
        {tab === "Visão geral" && (
          <>
            <div className="operation-banner">
              <div>
                <span className="live-dot" />
                <strong>Loja aberta</strong>
                <small>Recebendo pedidos normalmente</small>
              </div>
              <Button variant="secondary">Gerenciar operação</Button>
            </div>
            <div className="metric-grid">
              {[
                ["Pedidos hoje", "48", "+12%"],
                ["Em preparação", "06", "agora"],
                ["Faturamento", "R$ 1.842", "+8%"],
                ["Ticket médio", "R$ 38,40", "+3%"],
              ].map(([label, value, trend]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{trend}</small>
                </article>
              ))}
            </div>
            <div className="admin-grid">
              <section className="admin-panel">
                <div className="panel-title">
                  <Heading as={3}>Pedidos recentes</Heading>
                  <button onClick={() => changeTab("Pedidos")}>
                    Ver todos <Icon name="arrow" />
                  </button>
                </div>
                <OrdersTable
                  status={status}
                  setStatus={setStatus}
                  onOpen={() => {
                    setTab("Pedidos")
                    setOrderDetail(true)
                  }}
                />
              </section>
              <section className="admin-panel quick-panel">
                <div className="panel-title">
                  <Heading as={3}>Resumo da operação</Heading>
                </div>
                <div className="status-count">
                  <span className="status yellow">6</span>
                  <div>
                    <strong>Em preparação</strong>
                    <small>Tempo médio: 14 min</small>
                  </div>
                </div>
                <div className="status-count">
                  <span className="status green">3</span>
                  <div>
                    <strong>Prontos</strong>
                    <small>Aguardando servir</small>
                  </div>
                </div>
                <div className="status-count">
                  <span className="status red">2</span>
                  <div>
                    <strong>Atrasados</strong>
                    <small>Precisam de atenção</small>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
        {tab === "Pedidos" && !orderDetail && (
          <section className="admin-panel full-panel">
            <div className="panel-title">
              <div>
                <Heading as={3}>Todos os pedidos</Heading>
                <small>Atualização em tempo real</small>
              </div>
              <div className="chips">
                <button className="active">Todos</button>
                <button>Novos</button>
                <button>Em preparo</button>
                <button>Prontos</button>
              </div>
            </div>
            <OrdersTable
              status={status}
              setStatus={setStatus}
              expanded
              onOpen={() => setOrderDetail(true)}
            />
          </section>
        )}
        {tab === "Pedidos" && orderDetail && (
          <section className="admin-panel full-panel detail-panel">
            <button
              className="back-link"
              onClick={() => setOrderDetail(false)}
            >
              <Icon name="back" /> Voltar para pedidos
            </button>
            <div className="order-detail-head">
              <div>
                <span>Pedido #1048</span>
                <Heading as={2}>Mesa 08</Heading>
                <small>Recebido hoje às 19:04 • Consumo no salão</small>
              </div>
              <label>
                Status do pedido
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option>Novo</option>
                  <option>Em preparação</option>
                  <option>Pronto</option>
                  <option>Servido na mesa</option>
                  <option>Finalizado</option>
                </select>
              </label>
            </div>
            <div className="order-detail-grid">
              <div>
                <Heading as={3}>Itens do pedido</Heading>
                <article className="detail-order-item">
                  <img src={products[0].image} alt="" />
                  <div>
                    <strong>2× Pastel da Casa</strong>
                    <small>Tradicional • Sem azeitonas</small>
                  </div>
                  <b>R$ 33,80</b>
                </article>
                <div className="detail-total">
                  <span>Subtotal</span>
                  <b>R$ 33,80</b>
                  <span>Mesa</span>
                  <b>08</b>
                  <strong>Total</strong>
                  <strong>R$ 33,80</strong>
                </div>
              </div>
              <aside>
                <Heading as={3}>Atendimento da mesa</Heading>
                <div className="contact-block">
                  <span>Identificação</span>
                  <strong>Marina Alves</strong>
                  <small>(11) 99999-1234</small>
                </div>
                <div className="contact-block">
                  <span>Atendimento</span>
                  <strong>08</strong>
                  <small>Consumo no salão</small>
                </div>
                <div className="contact-block">
                  <span>Pagamento</span>
                  <strong>Pix • Pago</strong>
                </div>
              </aside>
            </div>
          </section>
        )}
        {tab === "Produtos" && !productForm && (
          <section className="admin-panel full-panel">
            <div className="panel-title">
              <div>
                <Heading as={3}>Produtos cadastrados</Heading>
                <small>4 produtos ativos</small>
              </div>
              <Button icon="plus" onClick={() => setProductForm(true)}>
                Novo produto
              </Button>
            </div>
            <div className="admin-products">
              {products.map((p) => (
                <article key={p.id}>
                  <img src={p.image} alt="" />
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.category}</small>
                  </div>
                  <b>{money(p.price)}</b>
                  <span className="availability">Disponível</span>
                  <button>Editar</button>
                </article>
              ))}
            </div>
          </section>
        )}
        {tab === "Produtos" && productForm && (
          <section className="admin-panel full-panel product-form-panel">
            <button
              className="back-link"
              onClick={() => setProductForm(false)}
            >
              <Icon name="back" /> Voltar para produtos
            </button>
            <div className="panel-title">
              <div>
                <Heading as={2}>Cadastrar produto</Heading>
                <small>Preencha as informações que aparecem no cardápio.</small>
              </div>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setProductForm(false)
              }}
              className="admin-form"
            >
              <div className="image-upload">
                <Icon name="plus" />
                <strong>Adicionar foto</strong>
                <small>JPG ou PNG • proporção 4:3</small>
              </div>
              <div className="form-fields">
                <label>
                  Nome do produto
                  <input placeholder="Ex.: Pastel de frango" required />
                </label>
                <label>
                  Categoria
                  <select defaultValue="">
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option>Clássicos</option>
                    <option>Especiais</option>
                    <option>Vegetarianos</option>
                    <option>Doces</option>
                  </select>
                </label>
                <label className="wide">
                  Descrição
                  <textarea placeholder="Conte o que torna esse pastel especial." />
                </label>
                <label>
                  Preço
                  <input placeholder="R$ 0,00" />
                </label>
                <label>
                  Disponibilidade
                  <select>
                    <option>Disponível</option>
                    <option>Indisponível</option>
                  </select>
                </label>
                <div className="wide admin-form-action">
                  <Button variant="secondary" onClick={() => setProductForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar produto</Button>
                </div>
              </div>
            </form>
          </section>
        )}
        {tab === "Categorias" && (
          <section className="admin-panel full-panel">
            <div className="panel-title">
              <div>
                <Heading as={3}>Categorias do cardápio</Heading>
                <small>Organize como os clientes encontram os produtos.</small>
              </div>
              <Button icon="plus">Nova categoria</Button>
            </div>
            <div className="category-admin-grid">
              {[
                ["Clássicos", "8 produtos", "Ativa"],
                ["Especiais", "6 produtos", "Ativa"],
                ["Vegetarianos", "4 produtos", "Ativa"],
                ["Doces", "5 produtos", "Ativa"],
              ].map(([name, count, state], index) => (
                <article key={name}>
                  <span className={`category-icon category-${index + 1}`}>
                    <Icon name={index === 3 ? "star" : "box"} />
                  </span>
                  <div>
                    <strong>{name}</strong>
                    <small>{count}</small>
                  </div>
                  <b>{state}</b>
                  <button>Editar</button>
                </article>
              ))}
            </div>
          </section>
        )}
        {tab === "Clientes" && (
          <section className="admin-panel full-panel">
            <div className="panel-title">
              <div>
                <Heading as={3}>Clientes</Heading>
                <small>1.284 clientes cadastrados</small>
              </div>
              <label className="admin-search">
                <Icon name="search" />
                <input placeholder="Buscar cliente" />
              </label>
            </div>
            <div className="customers-table">
              {[
                ["MA", "Marina Alves", "18 pedidos", "R$ 684,20", "Hoje"],
                ["CL", "Carlos Lima", "12 pedidos", "R$ 430,80", "Ontem"],
                ["BR", "Bianca Reis", "9 pedidos", "R$ 351,40", "24 mai"],
                ["JC", "João Costa", "7 pedidos", "R$ 286,10", "21 mai"],
              ].map(([initials, name, orders, spent, last]) => (
                <article key={name}>
                  <span>{initials}</span>
                  <div>
                    <strong>{name}</strong>
                    <small>{orders}</small>
                  </div>
                  <b>{spent}</b>
                  <small>Último pedido: {last}</small>
                  <button aria-label={`Ver cliente ${name}`}>
                    <Icon name="arrow" />
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

function OrdersTable({
  status,
  setStatus,
  expanded = false,
  onOpen,
}: {
  status: string
  setStatus: (s: string) => void
  expanded?: boolean
  onOpen?: () => void
}) {
  const rows = [
    ["#1048", "Mesa 08", "2 itens", "R$ 33,80", status],
    ["#1047", "Mesa 03", "4 itens", "R$ 72,40", "Novo"],
    ["#1046", "Mesa 06", "3 itens", "R$ 51,70", "Pronto"],
    ["#1045", "Mesa 02", "2 itens", "R$ 32,80", "Em preparação"],
  ]
  return (
    <div className="orders-table">
      {rows.slice(0, expanded ? 4 : 3).map((row, i) => (
        <article key={row[0]}>
          <strong>{row[0]}</strong>
          <div>
            <b>{row[1]}</b>
            <small>{row[2]}</small>
          </div>
          <b>{row[3]}</b>
          {i === 0 ? (
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Novo</option>
              <option>Em preparação</option>
              <option>Pronto</option>
              <option>Finalizado</option>
            </select>
          ) : (
            <span
              className={`order-status ${
                row[4] === "Pronto" ? "ready" : row[4] === "Novo" ? "new" : ""
              }`}
            >
              {row[4]}
            </span>
          )}
          <button aria-label="Ver pedido" onClick={onOpen}>
            <Icon name="arrow" />
          </button>
        </article>
      ))}
    </div>
  )
}

function Footer({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <footer>
      <div className="shell footer-inner">
        <Logo />
        <p>Pastel feito na hora e servido na sua mesa.</p>
        <nav>
          <button onClick={() => navigate("menu")}>Cardápio</button>
          <button onClick={() => navigate("tracking")}>Acompanhar pedido</button>
          <button onClick={() => navigate("admin")}>Área da loja</button>
        </nav>
        <small>© 2025 Pastry Menu</small>
      </div>
    </footer>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>("home")
  const [cart, setCart] = useState<Product[]>([])
  const [toast, setToast] = useState("")
  const tableNumber = new URLSearchParams(window.location.search).get("mesa") || "08"
  const navigate = (target: Page) => {
    setPage(target)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const add = (product: Product) => {
    setCart((current) => [...current, product])
    setToast(`${product.name} adicionado ao carrinho`)
    window.setTimeout(() => setToast(""), 2400)
  }
  const remove = (id: number) =>
    setCart((current) => {
      const index = current.findIndex((item) => item.id === id)
      return index < 0 ? current : current.filter((_, i) => i !== index)
    })
  const total = useMemo(
    () => cart.reduce((sum, p) => sum + p.price, 0),
    [cart],
  )
  const isAdmin = page === "admin"
  return (
    <>
      {!isAdmin && (
        <Header page={page} navigate={navigate} cartCount={cart.length} />
      )}
      {page === "home" && <Home navigate={navigate} add={add} tableNumber={tableNumber} />}
      {page === "menu" && <MenuPage navigate={navigate} add={add} />}
      {page === "product" && <ProductPage navigate={navigate} add={add} />}
      {page === "cart" && (
        <CartPage navigate={navigate} cart={cart} remove={remove} />
      )}
      {page === "checkout" && <Checkout navigate={navigate} total={total} cart={cart} tableNumber={tableNumber} />}
      {page === "success" && <Success navigate={navigate} total={total} tableNumber={tableNumber} />}
      {page === "tracking" && <Tracking navigate={navigate} tableNumber={tableNumber} />}
      {page === "admin" && <Admin navigate={navigate} />}
      {!isAdmin && page !== "success" && <Footer navigate={navigate} />}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" />
          </span>
          {toast}
          <button onClick={() => navigate("cart")}>Ver carrinho</button>
        </div>
      )}
    </>
  )
}
