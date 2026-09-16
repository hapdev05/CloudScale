'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProducts, deleteProduct, getHealthcheck } from '../services/api';
import NodeBadge from '../components/NodeBadge';
import { Trash2, Package, Cpu, PlusCircle } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nodeInfo, setNodeInfo] = useState(null);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllProducts();
      setProducts(data.data || []);
      setNodeInfo(data.nodeInfo);
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối đến Backend Service hoặc Database RDS.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshNode = async () => {
    try {
      const health = await getHealthcheck();
      setNodeInfo(health.serverInfo);
    } catch (err) {
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await deleteProduct(id);
      fetchData();
    } catch (err) {
      alert('Lỗi khi xóa sản phẩm!');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <NodeBadge nodeInfo={nodeInfo} onRefresh={handleRefreshNode} loading={loading} />

      <div className="page-header">
        <h1 className="page-title">Danh Sách Sản Phẩm (Next.js)</h1>
        <p className="page-subtitle">
          Dữ liệu được truy vấn trực tiếp từ cơ sở dữ liệu AWS RDS MySQL thông qua cụm EC2 Backend.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Cpu size={40} className="spin" style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách sản phẩm từ AWS Cloud...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Chưa có sản phẩm nào</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Hãy thêm sản phẩm đầu tiên để kiểm thử hệ thống.</p>
          <Link href="/add-product" className="btn-primary">
            <PlusCircle size={18} />
            <span>Thêm Sản Phẩm Ngay</span>
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <div>
                <span className="product-category">{p.category || 'Chung'}</span>
                <h3 className="product-title">{p.name}</h3>
                <div className="product-price">
                  {Number(p.price).toLocaleString('vi-VN')} đ
                </div>
                <p className="product-desc">{p.description || 'Không có mô tả.'}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Kho: <strong>{p.stock}</strong>
                </span>
                <button className="btn-danger" onClick={() => handleDelete(p.id)}>
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
