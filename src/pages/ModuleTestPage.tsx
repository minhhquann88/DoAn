import React, { useState } from 'react';
import './ModuleTestPage.css';

interface ApiResult {
  endpoint: string;
  status: number;
  data?: any;
  error?: string;
  timestamp: string;
}

const ModuleTestPage: React.FC = () => {
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = 'http://localhost:8080/api/v1';

  const addResult = (result: ApiResult) => {
    setResults(prev => [result, ...prev]);
  };

  const testApi = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    const timestamp = new Date().toLocaleString('vi-VN');
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      const data = await response.json();

      addResult({
        endpoint: `${method} ${endpoint}`,
        status: response.status,
        data,
        timestamp,
      });
    } catch (error: any) {
      addResult({
        endpoint: `${method} ${endpoint}`,
        status: 0,
        error: error.message,
        timestamp,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="module-test-page">
      <div className="header">
        <h1>🧪 Module API Test Dashboard</h1>
        <p>Test các API của Module 6, 7, 8, 9</p>
      </div>

      <div className="controls">
        <button onClick={clearResults} className="btn-clear">
          🗑️ Xóa kết quả
        </button>
      </div>

      <div className="test-sections">
        {/* Module 8 - Statistics */}
        <div className="test-section">
          <h2>📊 Module 8: Statistics & Reports</h2>
          <div className="test-buttons">
            <button 
              onClick={() => testApi('/statistics/dashboard')} 
              disabled={loading}
              className="btn-test"
            >
              Dashboard Stats
            </button>
            <button 
              onClick={() => testApi('/statistics/course/1')} 
              disabled={loading}
              className="btn-test"
            >
              Course Stats (ID: 1)
            </button>
            <button 
              onClick={() => testApi('/statistics/student/1')} 
              disabled={loading}
              className="btn-test"
            >
              Student Stats (ID: 1)
            </button>
            <button 
              onClick={() => testApi('/statistics/instructor/1')} 
              disabled={loading}
              className="btn-test"
            >
              Instructor Stats (ID: 1)
            </button>
            <button 
              onClick={() => testApi('/statistics/revenue?startDate=2025-01-01T00:00:00&endDate=2025-12-31T23:59:59')} 
              disabled={loading}
              className="btn-test"
            >
              Revenue Report 2025
            </button>
            <button 
              onClick={() => testApi('/statistics/completion')} 
              disabled={loading}
              className="btn-test"
            >
              Completion Report
            </button>
          </div>
        </div>

        {/* Module 9 - Payment & Certificate */}
        <div className="test-section">
          <h2>💰 Module 9: Payment & Certificate</h2>
          <div className="test-buttons">
            <button 
              onClick={() => testApi('/transactions?page=0&size=10')} 
              disabled={loading}
              className="btn-test"
            >
              Get Transactions
            </button>
            <button 
              onClick={() => testApi('/transactions', 'POST', {
                userId: 1,
                courseId: 1,
                amount: 299000,
                paymentGateway: 'VNPAY'
              })} 
              disabled={loading}
              className="btn-test btn-post"
            >
              Create Transaction
            </button>
            <button 
              onClick={() => testApi('/transactions/user/1?page=0&size=5')} 
              disabled={loading}
              className="btn-test"
            >
              User Transactions (ID: 1)
            </button>
            <button 
              onClick={() => testApi('/transactions/course/1?page=0&size=5')} 
              disabled={loading}
              className="btn-test"
            >
              Course Transactions (ID: 1)
            </button>
            <button 
              onClick={() => testApi('/certificates?userId=1&page=0&size=10')} 
              disabled={loading}
              className="btn-test"
            >
              User Certificates
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="results-section">
        <h2>📋 Kết quả Test ({results.length})</h2>
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <span>Đang gọi API...</span>
          </div>
        )}
        
        {results.length === 0 && !loading && (
          <div className="no-results">
            Chưa có kết quả test. Hãy nhấn các nút bên trên để test API.
          </div>
        )}

        <div className="results-list">
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`result-item ${result.status === 200 ? 'success' : 'error'}`}
            >
              <div className="result-header">
                <span className="endpoint">{result.endpoint}</span>
                <span className={`status status-${result.status}`}>
                  {result.status === 200 ? '✅' : '❌'} {result.status || 'ERROR'}
                </span>
                <span className="timestamp">{result.timestamp}</span>
              </div>
              <div className="result-body">
                <pre>{JSON.stringify(result.data || result.error, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleTestPage;

