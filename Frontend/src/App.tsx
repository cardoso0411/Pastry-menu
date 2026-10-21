import { useEffect, useMemo, useRef, useState } from "react"
import { apiErrorMessage, createOrder, getCatalog, getOrderStatus, type CreatedOrder, type OrderStatus } from "./api"

type Page = "home" | "menu" | "product" | "cart" | "checkout" | "success" | "tracking" | "admin"
type PaymentPreference = "cashier" | "card_terminal"

type Product = {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  badge?: string
}
type CartItem = Product & { note?: string }
type Category = { id: number; name: string; description: string }

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

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const phoneDigits = (value: string) => value.replace(/\D/g, "").slice(0, 11)
const validMobilePhone = (value: string) => /^[1-9]{2}9\d{8}$/.test(value)
const formatPhone = (value: string) => {
  const digits = phoneDigits(value)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
const maskedPhone = (value: string) => `(**) *****-${phoneDigits(value).slice(-4)}`
const paymentLabel = (preference: PaymentPreference) =>
  preference === "cashier" ? "Pagar no caixa" : "Solicitar maquininha à equipe"
const groupCart = (cart: CartItem[]) => {
  const groups = new Map<string, CartItem & { quantity: number }>()
  for (const item of cart) {
    const key = `${item.id}:${item.note || ""}`
    const existing = groups.get(key)
    if (existing) existing.quantity += 1
    else groups.set(key, { ...item, quantity: 1 })
  }
  return [...groups.values()]
}

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
  products,
  categories,
  openProduct,
}: {
  navigate: (p: Page) => void
  add: (product: Product) => void
  products: Product[]
  categories: Category[]
  openProduct: (product: Product) => void
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
            Escolha seus favoritos no cardápio digital, informe seu celular
            e acompanhe o preparo do pedido.
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate("menu")} icon="arrow">
              Ver cardápio
            </Button>
            <span>
              <Icon name="clock" /> Pedido presencial, feito na hora
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-sun" />
          <img
            src={photos.hero}
            alt="Pastéis crocantes servidos em uma panela"
          />
          <div className="fresh-note">
            feito
            <br />
            <strong>fresquinho!</strong>
          </div>
        </div>
      </section>

      <section className="category-strip">
        <div className="shell category-row">
          {categories.map(({ id, name, description }, i) => (
            <button
              key={id}
              className="category-item"
              onClick={() => navigate("menu")}
            >
              <span className={`category-icon category-${i + 1}`}>
                <Icon name={i === 3 ? "star" : "box"} />
              </span>
              <span>
                <strong>{name}</strong>
                <small>{description}</small>
              </span>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </section>

      <section className="featured shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow"><i /> Nosso cardápio</span>
            <Heading>Escolha seu favorito</Heading>
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
              open={() => openProduct(product)}
              add={() => add(product)}
            />
          ))}
        </div>
      </section>

      <section className="promo shell">
        <div>
          <span className="promo-kicker">Feito na hora</span>
          <Heading>
            Escolha seu pastel<br />
            favorito
          </Heading>
          <p>Confira os sabores disponíveis no cardápio.</p>
          <Button variant="dark" onClick={() => navigate("menu")}>
            Ver cardápio
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
            <small>Faça seu pedido no cardápio digital</small>
          </span>
        </div>
        <div>
          <Icon name="star" />
          <span>
            <strong>Identificado pelo celular</strong>
            <small>Acompanhe o preparo sem confusão</small>
          </span>
        </div>
      </section>
    </main>
  )
}

function MenuPage({
  add,
  products,
  categories,
  openProduct,
}: {
  add: (product: Product) => void
  products: Product[]
  categories: Category[]
  openProduct: (product: Product) => void
}) {
  const [category, setCategory] = useState("Todos")
  const [query, setQuery] = useState("")
  const categoryNames = ["Todos", ...categories.map((item) => item.name)]
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
          {categoryNames.map((item) => (
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
              open={() => openProduct(product)}
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
  product,
}: {
  navigate: (p: Page) => void
  add: (product: Product, note?: string) => void
  product: Product
}) {
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState("")
  return (
    <main className="product-page shell">
      <button className="back-link" onClick={() => navigate("menu")}>
        <Icon name="back" /> Voltar ao cardápio
      </button>
      <div className="product-detail">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
          {product.badge && <span className="badge">{product.badge}</span>}
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            <i /> {product.category || "Cardápio"}
          </span>
          <Heading as={1}>{product.name}</Heading>
          <p className="detail-description">{product.description}</p>
          <label className="note-field">
            <strong>Alguma observação?</strong>
            <textarea
              placeholder="Ex.: sem azeitonas, bem passado..."
              maxLength={140}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <div className="detail-action">
            <div className="stepper">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>
                <Icon name="minus" />
              </button>
              <strong>{qty}</strong>
              <button onClick={() => setQty(Math.min(99, qty + 1))}>
                <Icon name="plus" />
              </button>
            </div>
            <Button
              onClick={() => {
                for (let i = 0; i < qty; i++) add(product, note.trim())
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
  cart: CartItem[]
  remove: (id: number, note?: string) => void
}) {
  const subtotal = cart.reduce((sum, p) => sum + p.price, 0)
  const grouped = groupCart(cart)
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
              <article className="cart-item" key={`${item.id}:${item.note || ""}`}>
                <img src={item.image} alt="" />
                <div>
                  <strong>{item.name}</strong>
                  {item.note && <small>{item.note}</small>}
                  <button onClick={() => remove(item.id, item.note)}>Remover</button>
                </div>
                <span>{item.quantity} un.</span>
                <b>{money(item.price * item.quantity)}</b>
              </article>
            ))}
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
  submitOrder,
  total,
  cart,
  customerPhone,
  setCustomerPhone,
  paymentPreference,
  setPaymentPreference,
  submitting,
  submitError,
}: {
  navigate: (p: Page) => void
  submitOrder: () => Promise<void>
  total: number
  cart: CartItem[]
  customerPhone: string
  setCustomerPhone: (phone: string) => void
  paymentPreference: PaymentPreference
  setPaymentPreference: (preference: PaymentPreference) => void
  submitting: boolean
  submitError: string
}) {
  const [step, setStep] = useState(1)
  const [phoneError, setPhoneError] = useState(false)
  const titles = ["Identificação", "Pagamento", "Revisão"]
  const continueCheckout = () => {
    if (submitting) return
    if (step === 1 && !validMobilePhone(customerPhone)) {
      setPhoneError(true)
      return
    }
    if (step < 3) setStep(step + 1)
    else submitOrder()
  }
  const grouped = groupCart(cart)
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
              <Heading as={3}>Qual é o seu número de celular?</Heading>
              <div className="field-grid">
                <label className="wide">
                  Celular com DDD
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="(11) 99999-9999"
                    value={formatPhone(customerPhone)}
                    onChange={(event) => {
                      setCustomerPhone(phoneDigits(event.target.value))
                      setPhoneError(false)
                    }}
                    aria-invalid={phoneError}
                    aria-describedby={phoneError ? "phone-error" : undefined}
                  />
                </label>
              </div>
              {phoneError && (
                <p className="field-error" id="phone-error" role="alert">
                  Informe um celular válido com DDD e 11 dígitos.
                </p>
              )}
              <p>Usaremos esse número para identificar e localizar seu pedido.</p>
            </>
          )}
          {step === 2 && (
            <>
              <Heading as={3}>Como prefere pagar?</Heading>
              <div className="choice-list compact">
                <label className={paymentPreference === "cashier" ? "selected" : ""}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentPreference === "cashier"}
                    onChange={() => setPaymentPreference("cashier")}
                  />
                  <span>
                    <strong>Pagar no caixa</strong>
                    <small>Informe seu celular ou número do pedido à equipe</small>
                  </span>
                </label>
                <label className={paymentPreference === "card_terminal" ? "selected" : ""}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentPreference === "card_terminal"}
                    onChange={() => setPaymentPreference("card_terminal")}
                  />
                  <span>
                    <strong>Solicitar maquininha à equipe</strong>
                    <small>A equipe chamará pelo seu pedido para o pagamento</small>
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
                  <span>Celular para identificação</span>
                  <strong>{formatPhone(customerPhone)}</strong>
                </div>
                <button onClick={() => setStep(1)}>Editar</button>
              </div>
              <div className="review-card">
                <div>
                  <span>Pagamento</span>
                  <strong>{paymentLabel(paymentPreference)}</strong>
                </div>
                <button onClick={() => setStep(2)}>Editar</button>
              </div>
              {grouped.map((item) => (
                <div className="review-card" key={`${item.id}:${item.note || ""}`}>
                  <div>
                    <span>{item.quantity} × {item.name}</span>
                    <strong>{money(item.price * item.quantity)}</strong>
                    {item.note && <small>{item.note}</small>}
                  </div>
                </div>
              ))}
            </>
          )}
          <div className="form-action">
            {submitError && <p className="field-error" role="alert">{submitError}</p>}
            <Button
              onClick={continueCheckout}
              icon="arrow"
              disabled={submitting || (step === 3 && !cart.length)}
            >
              {submitting ? "Enviando pedido..." : step === 3 ? "Enviar pedido à cozinha" : "Continuar"}
            </Button>
          </div>
        </section>
        <aside className="mini-summary">
          <span>Pedido presencial</span>
          {grouped.map((item) => (
            <div className="mini-product" key={`${item.id}:${item.note || ""}`}>
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
            <Icon name="clock" /> Preparado na hora para você
          </small>
        </aside>
      </div>
    </main>
  )
}

function Success({
  navigate,
  total,
  customerPhone,
  paymentPreference,
  orderNumber,
}: {
  navigate: (p: Page) => void
  total: number
  customerPhone: string
  paymentPreference: PaymentPreference
  orderNumber: number
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
        Vamos preparar tudo fresquinho. Acompanhe o pedido pelo celular informado.
      </p>
      <div className="success-card">
        <div><span>Número do pedido</span><strong>#{orderNumber}</strong></div>
        <div>
          <span>Identificação</span>
          <strong>{maskedPhone(customerPhone)}</strong>
        </div>
        <div>
          <span>Pagamento</span>
          <strong>{paymentPreference === "cashier" ? "No caixa" : "Maquininha com a equipe"}</strong>
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

function Tracking({
  navigate,
  customerPhone,
  paymentPreference,
  order,
  status,
  statusError,
}: {
  navigate: (p: Page) => void
  customerPhone: string
  paymentPreference: PaymentPreference
  order: CreatedOrder | null
  status: OrderStatus | null
  statusError: string
}) {
  if (!order) {
    return (
      <main className="tracking-page shell">
        <div className="empty-state cart-empty">
          <Icon name="orders" size={36} />
          <Heading as={2}>Nenhum pedido em andamento</Heading>
          <p>Escolha seus pastéis no cardápio para começar.</p>
          <Button onClick={() => navigate("menu")}>Ver cardápio</Button>
        </div>
      </main>
    )
  }
  const steps: [string, string, string][] = [
    ["recebido", "Pedido recebido", "Confirmado no cardápio"],
    ["em_preparo", "Em preparação", "Aguardando"],
    ["pronto", "Pronto", "Aguardando"],
    ["cliente_avisado", "Cliente avisado", "Aguardando"],
    ["finalizado", "Finalizado", "Aguardando"],
  ]
  const currentStep = steps.findIndex(([key]) => key === (status?.situacao || order.situacao))
  return (
    <main className="tracking-page shell">
      <button className="back-link" onClick={() => navigate("home")}>
        <Icon name="back" /> Início
      </button>
      <div className="tracking-intro">
        <span className="eyebrow">
          <i /> Acompanhamento do pedido
        </span>
        <Heading as={1}>
          Acompanhe seu pedido
          <br />
          até ficar pronto.
        </Heading>
        <p>
          Pedido <strong>#{order.numero_pedido}</strong> · Identificação pelo celular <strong>{maskedPhone(customerPhone)}.</strong>
        </p>
        {statusError && <p className="field-error" role="alert">{statusError}</p>}
        {status?.situacao === "cancelado" && <p className="field-error">Este pedido foi cancelado.</p>}
      </div>
      <div className="tracking-layout">
        <section className="timeline">
          {steps.map(([, name, time], index) => (
            <div key={name} className={index <= currentStep ? "done" : ""}>
              <span>{index <= currentStep ? <Icon name="check" /> : index + 1}</span>
              <div>
                <strong>{name}</strong>
                <small>{time}</small>
                {index === 0 && (
                  <p>Seu pedido foi enviado para a equipe.</p>
                )}
              </div>
            </div>
          ))}
        </section>
        <aside className="delivery-card">
          <span>Pagamento presencial</span>
          <Heading as={2}>{paymentPreference === "cashier" ? "No caixa" : "Maquininha"}</Heading>
          <div className="map-art">
            <Icon name="orders" size={32} />
          </div>
          <strong>Pedido enviado para a equipe</strong>
          <small>
            {paymentPreference === "cashier"
              ? "Informe seu celular à equipe no caixa para pagar."
              : "A equipe chamará você para pagar com a maquininha."}
          </small>
          <hr />
          <button>
            Precisa de ajuda? <Icon name="arrow" />
          </button>
        </aside>
      </div>
    </main>
  )
}

function Admin({ navigate, products }: { navigate: (p: Page) => void; products: Product[] }) {
  const [authenticated] = useState(false)
  const [tab, setTab] = useState("Visão geral")
  const [status, setStatus] = useState("Em preparação")
  const [orderDetail, setOrderDetail] = useState(false)
  const [productForm, setProductForm] = useState(false)
  const nav = [
    ["Visão geral", "grid"],
    ["Pedidos", "orders"],
    ["Produtos", "box"],
    ["Categorias", "grid"],
    ["Celulares", "user"],
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
              // O painel administrativo ainda não possui autenticação na API.
            }}
          >
            <label>
              E-mail
              <input type="email" disabled />
            </label>
            <label>
              Senha
              <input type="password" disabled />
            </label>
            <div className="login-options">
              <label>
                <input type="checkbox" defaultChecked /> Manter conectado
              </label>
              <button type="button">Esqueci minha senha</button>
            </div>
            <p>O acesso da equipe será ativado após a integração da autenticação.</p>
          </form>
          <small>Acesso exclusivo para a equipe Pastry Menu</small>
        </section>
        <aside className="login-art">
          <img src={photos.hero} alt="Pastéis preparados na loja" />
          <div>
            <span>Operação de hoje</span>
            <strong>Área da equipe</strong>
            <small>Em preparação</small>
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
                    <small>Aguardando chamar o cliente</small>
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
                <Heading as={2}>Celular •••• 4321</Heading>
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
                  <option>Cliente avisado</option>
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
                  <strong>Total</strong>
                  <strong>R$ 33,80</strong>
                </div>
              </div>
              <aside>
                <Heading as={3}>Identificação e pagamento</Heading>
                <div className="contact-block">
                  <span>Celular</span>
                  <strong>(11) 9••••-4321</strong>
                  <small>Confirme os últimos quatro dígitos com o cliente</small>
                </div>
                <div className="contact-block">
                  <span>Pagamento</span>
                  <strong>No caixa • Pendente</strong>
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
        {tab === "Celulares" && (
          <section className="admin-panel full-panel">
            <div className="panel-title">
              <div>
                <Heading as={3}>Histórico por celular</Heading>
                <small>Pedidos agrupados pelo número informado</small>
              </div>
              <label className="admin-search">
                <Icon name="search" />
                <input placeholder="Buscar celular" />
              </label>
            </div>
            <div className="customers-table">
              {[
                ["21", "(11) 9••••-4321", "18 pedidos", "R$ 684,20", "Hoje"],
                ["65", "(11) 9••••-8765", "12 pedidos", "R$ 430,80", "Ontem"],
                ["34", "(11) 9••••-1234", "9 pedidos", "R$ 351,40", "24 mai"],
                ["78", "(11) 9••••-5678", "7 pedidos", "R$ 286,10", "21 mai"],
              ].map(([initials, phone, orders, spent, last]) => (
                <article key={phone}>
                  <span>{initials}</span>
                  <div>
                    <strong>{phone}</strong>
                    <small>{orders}</small>
                  </div>
                  <b>{spent}</b>
                  <small>Último pedido: {last}</small>
                  <button aria-label={`Ver pedidos do celular ${phone}`}>
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
    ["#1048", "Celular •••• 4321", "2 itens", "R$ 33,80", status],
    ["#1047", "Celular •••• 8765", "4 itens", "R$ 72,40", "Novo"],
    ["#1046", "Celular •••• 1234", "3 itens", "R$ 51,70", "Pronto"],
    ["#1045", "Celular •••• 5678", "2 itens", "R$ 32,80", "Em preparação"],
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
              <option>Cliente avisado</option>
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
        <p>Pastel feito na hora, pedido identificado pelo celular.</p>
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
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [catalogError, setCatalogError] = useState("")
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [toast, setToast] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>("cashier")
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null)
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [statusError, setStatusError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const submitInFlight = useRef(false)
  const [submitError, setSubmitError] = useState("")
  const [submittedTotal, setSubmittedTotal] = useState(0)
  useEffect(() => {
    let active = true
    getCatalog().then((catalog) => {
      if (!active) return
      setCategories(catalog.categorias.map((item) => ({
        id: item.id, name: item.nome, description: item.descricao || "",
      })))
      setProducts(catalog.produtos.map((item) => ({
        id: item.id, name: item.nome, description: item.descricao || "",
        price: item.preco_base, category: item.categoria || "Outros",
        image: item.url_imagem || photos.pastel,
      })))
      setCatalogError("")
    }).catch((error) => {
      if (active) setCatalogError(apiErrorMessage(error))
    }).finally(() => { if (active) setCatalogLoading(false) })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!createdOrder || page !== "tracking") return
    let active = true
    const refresh = () => getOrderStatus(createdOrder).then((status) => {
      if (active) { setOrderStatus(status); setStatusError("") }
    }).catch((error) => {
      if (active) setStatusError(apiErrorMessage(error))
    })
    void refresh()
    const interval = window.setInterval(refresh, 10000)
    return () => { active = false; window.clearInterval(interval) }
  }, [createdOrder, page])
  const navigate = (target: Page) => {
    if (target === "home" && createdOrder) {
      setCart([])
      setCustomerPhone("")
      setPaymentPreference("cashier")
      setCreatedOrder(null)
      setOrderStatus(null)
      setSubmittedTotal(0)
    }
    setPage(target)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const add = (product: Product, note?: string) => {
    setCart((current) => [...current, { ...product, note }])
    setToast(`${product.name} adicionado ao carrinho`)
    window.setTimeout(() => setToast(""), 2400)
  }
  const remove = (id: number, note?: string) =>
    setCart((current) => {
      const index = current.findIndex((item) => item.id === id && item.note === note)
      return index < 0 ? current : current.filter((_, i) => i !== index)
    })
  const total = useMemo(
    () => cart.reduce((sum, p) => sum + p.price, 0),
    [cart],
  )
  const openProduct = (product: Product) => {
    setSelectedProduct(product)
    navigate("product")
  }
  const submitOrder = async () => {
    if (submitInFlight.current || !cart.length) return
    submitInFlight.current = true
    setSubmitting(true)
    setSubmitError("")
    try {
      const order = await createOrder({
        celular_cliente: customerPhone,
        preferencia_pagamento: paymentPreference === "cashier" ? "caixa" : "maquininha",
        itens: groupCart(cart).map((item) => ({
          produto_id: item.id, quantidade: item.quantity, observacoes: item.note,
        })),
      })
      setCreatedOrder(order)
      setOrderStatus(null)
      setSubmittedTotal(order.valor_total)
      setCart([])
      navigate("success")
    } catch (error) {
      setSubmitError(apiErrorMessage(error))
    } finally {
      submitInFlight.current = false
      setSubmitting(false)
    }
  }
  const isAdmin = page === "admin"
  return (
    <>
      {!isAdmin && (
        <Header page={page} navigate={navigate} cartCount={cart.length} />
      )}
      {catalogError && (page === "home" || page === "menu") &&
        <p className="field-error shell" role="alert">Cardápio indisponível: {catalogError}</p>}
      {catalogLoading && (page === "home" || page === "menu") &&
        <p className="shell" role="status">Carregando cardápio...</p>}
      {page === "home" && <Home navigate={navigate} add={add} products={products} categories={categories} openProduct={openProduct} />}
      {page === "menu" && <MenuPage add={add} products={products} categories={categories} openProduct={openProduct} />}
      {page === "product" && selectedProduct && <ProductPage key={selectedProduct.id} navigate={navigate} add={add} product={selectedProduct} />}
      {page === "cart" && (
        <CartPage navigate={navigate} cart={cart} remove={remove} />
      )}
      {page === "checkout" && (
        <Checkout
          navigate={navigate}
          submitOrder={submitOrder}
          total={total}
          cart={cart}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          paymentPreference={paymentPreference}
          setPaymentPreference={setPaymentPreference}
          submitting={submitting}
          submitError={submitError}
        />
      )}
      {page === "success" && (
        <Success
          navigate={navigate}
          total={submittedTotal}
          customerPhone={customerPhone}
          paymentPreference={paymentPreference}
          orderNumber={createdOrder?.numero_pedido || 0}
        />
      )}
      {page === "tracking" && (
        <Tracking
          navigate={navigate}
          customerPhone={customerPhone}
          paymentPreference={paymentPreference}
          order={createdOrder}
          status={orderStatus}
          statusError={statusError}
        />
      )}
      {page === "admin" && <Admin navigate={navigate} products={products} />}
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
