// File: src/components/Arena/ItemsCatalog.jsx (NEW FILE)
import React, { useState, useEffect } from 'react';
import arenaService from '../services/arena';

export default function ItemsCatalog({ onSelectItem }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});

  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [page, category]);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('[ItemsCatalog] Fetching items catalog...', { page, category });

      const response = await arenaService.getItemsCatalog(page, 10, category);

      if (response.success) {
        const fetchedItems = response.data.items || [];
        const fetchedPagination = response.data.pagination || {};

        console.log('[ItemsCatalog] Items catalog loaded:', {
          totalItems: fetchedItems.length,
          currentPage: page,
          totalPages: fetchedPagination.pages || 0
        });

        setItems(fetchedItems);
        setPagination(fetchedPagination);
      } else {
        setError(response.message || 'Failed to load items');
      }

    } catch (err) {
      console.error('[ItemsCatalog] Fetch items error:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategory) => {
    // Debounce search to avoid too many API calls
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(
      setTimeout(() => {
        setCategory(newCategory);
        setPage(1); // Reset to page 1 when changing category
      }, 500)
    );
  };

  const handleSelectItem = (item) => {
    console.log('[ItemsCatalog] Item selected:', item);
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination.pages || 1)) {
      setPage(newPage);
    }
  };

  return (
    <div className="items-catalog" style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: '#fff'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📦 Items Catalog</h3>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by category..."
          onChange={(e) => handleCategoryChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Filter items by category (search is debounced)
        </small>
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666'
        }}>
          <div>⏳ Loading items...</div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {items.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {items.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e3f2fd';
                    e.target.style.borderColor = '#2196f3';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f9f9f9';
                    e.target.style.borderColor = '#ddd';
                  }}
                >
                  <div style={{
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#333'
                  }}>
                    {item.name || 'Unknown Item'}
                  </div>

                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    {item.description || 'No description available'}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '10px'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#28a745'
                    }}>
                      {item.price || 0} chips
                    </div>
                    <button
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Select
                    </button>
                  </div>

                  {item.category && (
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      marginTop: '5px'
                    }}>
                      Category: {item.category}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📦</div>
              <div>No items found</div>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>
                {category ? `No items in category "${category}"` : 'No items available in catalog'}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: page === 1 ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Previous
              </button>

              <span style={{
                padding: '8px 16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                Page {page} of {pagination.pages}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.pages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: page === pagination.pages ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === pagination.pages ? 'not-allowed' : 'pointer'
                }}
              >
                Next →
              </button>
            </div>
          )}

          {/* Item count info */}
          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#666',
            marginTop: '15px'
          }}>
            Showing {items.length} of {pagination.total || 0} items
          </div>
        </>
      )}
    </div>
  );
}