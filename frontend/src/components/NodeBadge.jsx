'use client';

import React from 'react';
import { Server, RefreshCw } from 'lucide-react';

export default function NodeBadge({ nodeInfo, onRefresh, loading }) {
  const hostname = nodeInfo?.hostname || 'Unknown EC2 Node';

  return (
    <div className="node-badge-bar">
      <div className="badge-info">
        <div className="pulsing-dot" />
        <Server size={18} style={{ color: '#00f2fe' }} />
        <span className="badge-text">
          Được phản hồi từ Server Node (ALB Target):{' '}
          <span className="badge-highlight">{hostname}</span>
        </span>
      </div>

      {onRefresh && (
        <button
          className="btn-primary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh Node (Demo ALB)
        </button>
      )}
    </div>
  );
}
