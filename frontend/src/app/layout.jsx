import './globals.css';
import Navbar from '../components/Navbar';
import { Cloud } from 'lucide-react';

export const metadata = {
  title: 'CloudAutoScale - AWS Cloud Auto Scaling & Load Balancing Demo',
  description: 'Developing and Testing a Cloud-Based Web Application with Auto Scaling and Load Balancing',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <div className="app-container">
          <Navbar />

          <main className="main-content">
            {children}
          </main>

          <footer className="footer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Cloud size={16} style={{ color: '#00f2fe' }} />
              <strong>CloudAutoScale Project (Next.js)</strong> - AWS EC2 Auto Scaling & Application Load Balancer
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Powered by Next.js 14 + Node.js + Express + AWS RDS MySQL + Terraform
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
