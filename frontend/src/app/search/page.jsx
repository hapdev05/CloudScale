'use client';

import React, { useState } from 'react';
import { searchProducts } from '../../services/api';
import NodeBadge from '../../components/NodeBadge';
import { Search, Package, Cpu } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nodeInfo, setNodeInfo] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await searchProducts(query.trim());
      setResults(res.data || []);
      setNodeInfo(res.nodeInfo);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {nodeInfo && <NodeBadge nodeInfo={nodeInfo} loading={false} />}

      <div className="page-header">
        <h1 className="page-title">Tìm Kiếm Sản Phẩm (Next.js)</h1>
        <p className="page-subtitle">Tìm kiếm sản phẩm theo tên với truy vấn SQL LIKE trên AWS RDS.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Nhập tên sản phẩm cần tìm (VD: iphone, macbook)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{ flexShrink: 0 }}>
            <Search size={18} />
            <span>{loading ? 'Đang Tìm...' : 'Tìm Kiếm'}</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Cpu size={40} className="spin" style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Đang truy vấn dữ liệu từ MySQL RDS...</p>
        </div>
      ) : searched ? (
        results.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}"</h3>
          </div>
        ) : (
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
              Tìm thấy {results.length} sản phẩm phù hợp:
            </h3>
            <div className="product-grid">
              {results.map((p) => (
                <div key={p.id} className="product-card">
                  <div>
                    <span className="product-category">{p.category || 'Chung'}</span>
                    <h3 className="product-title">{p.name}</h3>
                    <div className="product-price">
                      {Number(p.price).toLocaleString('vi-VN')} đ
                    </div>
                    <p className="product-desc">{p.description || 'Không có mô tả.'}</p>
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Tồn kho: <strong>{p.stock}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
