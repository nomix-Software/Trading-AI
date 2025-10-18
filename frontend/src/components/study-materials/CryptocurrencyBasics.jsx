import "../../pages/courses/study-materials.css"

const getMaterialForQuestion = (id) => {
  const materials = {
    1: {
      title: "Fundamentos de Blockchain",
      content: [
        {
          subtitle: "¿Qué es Blockchain?",
          text: "Blockchain es un registro distribuido e inmutable que mantiene una lista de registros (bloques) enlazados y asegurados usando criptografía.",
          points: [
            "Inmutable: Una vez registrado, no se puede modificar",
            "Descentralizado: No hay una autoridad central",
            "Transparente: Todas las transacciones son públicas",
            "Seguro: Protegido por criptografía avanzada",
          ],
        },
      ],
      icon: "🔗",
    },
    2: {
      title: "Bitcoin: La Primera Criptomoneda",
      content: [
        {
          subtitle: "Historia y Características",
          text: "Bitcoin fue creado en 2009 por Satoshi Nakamoto como la primera criptomoneda descentralizada.",
          points: [
            "Suministro Limitado: Solo existirán 21 millones de bitcoins",
            "Proof of Work: Utiliza minería para validar transacciones",
            "Divisibilidad: 1 Bitcoin = 100,000,000 satoshis",
            "Peer-to-peer: Transacciones directas sin intermediarios",
          ],
        },
      ],
      icon: "₿",
    },
    3: {
      title: "Altcoins Principales",
      content: [
        {
          subtitle: "Criptomonedas Alternativas",
          text: "Todas las criptomonedas que no son Bitcoin se conocen como 'altcoins'. Cada una tiene características únicas.",
          points: [
            "Ethereum (ETH): Plataforma de contratos inteligentes",
            "Binance Coin (BNB): Token del exchange Binance",
            "Cardano (ADA): Blockchain de tercera generación",
            "Solana (SOL): Blockchain de alta velocidad",
          ],
        },
      ],
      icon: "🏦",
    },
    4: {
      title: "Wallets y Seguridad",
      content: [
        {
          subtitle: "Tipos de Wallets",
          text: "Las wallets son herramientas para almacenar y gestionar criptomonedas de forma segura.",
          points: [
            "Hot Wallets: Conectadas a internet, más convenientes pero menos seguras",
            "Cold Wallets: Sin conexión a internet, más seguras para almacenamiento",
            "Hardware Wallets: Dispositivos físicos para máxima seguridad",
            "Paper Wallets: Claves impresas en papel",
          ],
        },
      ],
      icon: "🔐",
    },
    5: {
      title: "DeFi Basics",
      content: [
        {
          subtitle: "Finanzas Descentralizadas",
          text: "DeFi recrea servicios financieros tradicionales usando blockchain y contratos inteligentes.",
          points: [
            "DEX: Exchanges descentralizados para intercambio sin intermediarios",
            "Lending/Borrowing: Préstamos y depósitos descentralizados",
            "Liquidity Pools: Provisión de liquidez para ganar recompensas",
            "Yield Farming: Estrategias para maximizar rendimientos",
          ],
        },
      ],
      icon: "🏛️",
    },
    6: {
      title: "Trading de Criptomonedas",
      content: [
        {
          subtitle: "Características Únicas",
          text: "El trading de criptomonedas tiene particularidades que lo diferencian de otros mercados.",
          points: [
            "Mercado 24/7: Opera los 365 días del año sin parar",
            "Alta Volatilidad: Movimientos de precio más amplios que forex",
            "Liquidez Variable: Varía entre diferentes criptomonedas",
            "Sensible a Noticias: Reacciona fuertemente a regulaciones",
          ],
        },
      ],
      icon: "📊",
    },
  }

  return materials[id] || materials[1]
}

const CryptocurrencyBasics = ({ questionId = 1 }) => {
  const material = getMaterialForQuestion(questionId)

  return (
    <div className="study-material-container">
      <div className="study-material-header">
        <div className="material-icon">{material.icon}</div>
        <h2 className="material-title">{material.title}</h2>
        <div className="study-badge">Criptomonedas</div>
      </div>

      <div className="study-content">
        {material.content.map((section, index) => (
          <div key={index} className="content-section">
            <h3 className="section-subtitle">{section.subtitle}</h3>
            <p className="section-text">{section.text}</p>
            {section.points && (
              <ul className="section-points">
                {section.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="point-item">
                    <span className="point-bullet">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="study-footer">
        <div className="study-tip">
          <strong>💡 Tip de Seguridad:</strong> Nunca compartas tu clave privada o seed phrase. Siempre verifica las
          direcciones antes de enviar fondos.
        </div>
      </div>
    </div>
  )
}

export default CryptocurrencyBasics
