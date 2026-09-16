'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '../../services/api';
import NodeBadge from '../../components/NodeBadge';
import { PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';

export default function AddProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Smartphones',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [nodeInfo, setNodeInfo] = useState(null);
  const [msg, setMsg] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      setMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ Tên và Giá sản phẩm!' });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await createProduct(formData);
      setNodeInfo(res.nodeInfo);
      setMsg({ type: 'success', text: `Đã thêm sản phẩm "${res.data.name}" thành công!` });
      setFormData({ name: '', price: '', stock: '', category: 'Smartphones', description: '' });
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Không thể thêm sản phẩm. Kiểm tra kết nối Backend/RDS.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {nodeInfo && <NodeBadge nodeInfo={nodeInfo} loading={false} />}

      <div className="page-header">
        <h1 className="page-title">Thêm Sản Phẩm Mới (Next.js)</h1>
        <p className="page-subtitle">Nhập thông tin sản phẩm để lưu trực tiếp vào database AWS RDS MySQL.</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
        {msg && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${msg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
              color: msg.type === 'success' ? '#6ee7b7' : '#fca5a5',
            }}
          >
            {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên Sản Phẩm *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="VD: iPhone 15 Pro Max 256GB"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Giá (VND) *</label>
              <input
                type="number"
                name="price"
                className="form-input"
                placeholder="32990000"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số Lượng Tồn Kho</label>
              <input
                type="number"
                name="stock"
                className="form-input"
                placeholder="50"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Danh Mục</label>
            <select
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Smartphones">Smartphones</option>
              <option value="Laptops">Laptops</option>
              <option value="Tablets">Tablets</option>
              <option value="Accessories">Accessories</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mô Tả Sản Phẩm</label>
            <textarea
              name="description"
              className="form-textarea"
              rows={4}
              placeholder="Nhập mô tả chi tiết sản phẩm..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            <PlusCircle size={18} />
            <span>{loading ? 'Đang Lưu Vào RDS MySQL...' : 'Lưu Sản Phẩm'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
