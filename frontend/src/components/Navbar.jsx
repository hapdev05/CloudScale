'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, PlusCircle, Search, Home as HomeIcon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand-logo">
          <Cloud size={28} style={{ color: '#00f2fe' }} />
          <span>CloudAutoScale</span>
        </Link>

        <div className="nav-links">
          <Link
            href="/"
            className={`nav-item ${pathname === '/' ? 'active' : ''}`}
          >
            <HomeIcon size={18} />
            <span>Trang Chủ</span>
          </Link>

          <Link
            href="/add-product"
            className={`nav-item ${pathname === '/add-product' ? 'active' : ''}`}
          >
            <PlusCircle size={18} />
            <span>Thêm Sản Phẩm</span>
          </Link>

          <Link
            href="/search"
            className={`nav-item ${pathname === '/search' ? 'active' : ''}`}
          >
            <Search size={18} />
            <span>Tìm Kiếm</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
