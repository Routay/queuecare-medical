import { Search, Building2, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

export default function PharmacyDirectory({ pharmacies, isLoading }) {
  const [search, setSearch] = useState('')

  // Filtrer les pharmacies ET les médicaments par la recherche
  const filteredPharmacies = pharmacies.map(pharmacy => {
    const matchedStock = pharmacy.stock.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    // Si la recherche correspond au nom de la pharmacie, montrer tout le stock
    const pharmacyNameMatch = pharmacy.name.toLowerCase().includes(search.toLowerCase())
    
    return {
      ...pharmacy,
      stock: search ? (pharmacyNameMatch ? pharmacy.stock : matchedStock) : pharmacy.stock,
      visible: search ? (pharmacyNameMatch || matchedStock.length > 0) : true
    }
  }).filter(p => p.visible)

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Chargement des pharmacies...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="pharmacy-header">
        <div className="search-bar" id="pharmacy-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher un médicament ou une pharmacie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredPharmacies.length === 0 ? (
        <div className="glass-panel empty-queue">
          <Building2 size={48} />
          <h4>Aucun résultat</h4>
          <p>Aucune pharmacie ou médicament ne correspond à « {search} ».</p>
        </div>
      ) : (
        <div className="pharmacy-grid">
          {filteredPharmacies.map((pharmacy, index) => (
            <div
              key={pharmacy.id}
              className="pharmacy-card glass-panel"
              style={{ animationDelay: `${index * 0.08}s` }}
              id={`pharmacy-card-${pharmacy.id}`}
            >
              <div className="pharmacy-card-header">
                <div className="pharmacy-card-icon">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="pharmacy-card-title">{pharmacy.name}</div>
                  <div className="pharmacy-card-address">{pharmacy.address}</div>
                </div>
              </div>
              <div className="medicine-list">
                {pharmacy.stock.map((item, idx) => (
                  <div key={idx} className="medicine-item">
                    <span className="medicine-name">{item.name}</span>
                    <span className={`medicine-status ${item.inStock ? 'in-stock' : 'out-of-stock'}`}>
                      <span className={`medicine-dot ${item.inStock ? 'in-stock' : 'out-of-stock'}`}></span>
                      {item.inStock ? 'Disponible' : 'Rupture'}
                    </span>
                  </div>
                ))}
                {pharmacy.stock.length === 0 && (
                  <div className="medicine-item" style={{ justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>
                    Aucun médicament enregistré
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
