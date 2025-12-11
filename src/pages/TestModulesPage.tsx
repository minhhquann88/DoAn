import React, { useState, useEffect } from 'react';
import './TestModulesPage.css';

const API_BASE = 'http://localhost:8080/api/v1';

interface ApiResult {
  data?: any;
  error?: string;
  loading: boolean;
}

const TestModulesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('module6');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    checkBackend();
    // Chỉ kiểm tra mỗi 30 giây thay vì 10 giây để tránh spam requests
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch(`${API_BASE}/statistics/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Chấp nhận cả 200 và 401 (401 có nghĩa là backend đang chạy nhưng cần auth)
      if (response.status === 200 || response.status === 401) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  const [results, setResults] = useState<Record<string, ApiResult>>({});

  const callApi = async (key: string, url: string) => {
    setResults(prev => ({ ...prev, [key]: { loading: true } }));
    try {
      const response = await fetch(url);
      const data = await response.json();
      setResults(prev => ({ ...prev, [key]: { data, loading: false } }));
    } catch (error: any) {
      setResults(prev => ({ ...prev, [key]: { error: error.message, loading: false } }));
    }
  };

  return (
    <div className="test-modules-page">
      <div className="test-container">
        <div className="test-header">
          <h1>🧪 Test Backend - Modules 6, 7, 8, 9</h1>
          <p>
            Backend URL: <span>{API_BASE}</span>
            <span className={`status ${backendStatus}`}>
              {backendStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </p>
        </div>

        <div className="tabs">
          <button 
            className={activeTab === 'module6' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('module6')}
          >
            Module 6: Học viên
          </button>
          <button 
            className={activeTab === 'module7' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('module7')}
          >
            Module 7: Giảng viên
          </button>
          <button 
            className={activeTab === 'module8' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('module8')}
          >
            Module 8: Thống kê
          </button>
          <button 
            className={activeTab === 'module9' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('module9')}
          >
            Module 9: Thanh toán
          </button>
        </div>

        {/* Module 6 */}
        {activeTab === 'module6' && (
          <div className="tab-content">
            <div className="info-box">
              <p><strong>Module 6:</strong> Quản lý học viên - Enrollment Management</p>
              <p><strong>API Base:</strong> /api/v1/enrollments</p>
            </div>

            <div className="section">
              <h3>📋 Danh sách Enrollments</h3>
              <button className="btn" onClick={() => callApi('enrollments', `${API_BASE}/enrollments?page=0&size=20`)}>
                Lấy tất cả Enrollments
              </button>
              {results.enrollments && <ResultDisplay result={results.enrollments} />}
            </div>

            <div className="section">
              <h3>🔍 Tìm Enrollment theo ID</h3>
              <input 
                type="number" 
                id="enrollmentId" 
                defaultValue="1" 
                className="input-field"
                placeholder="Nhập ID"
              />
              <button className="btn" onClick={() => {
                const id = (document.getElementById('enrollmentId') as HTMLInputElement).value;
                callApi('enrollment', `${API_BASE}/enrollments/${id}`);
              }}>
                Lấy Enrollment
              </button>
              {results.enrollment && <ResultDisplay result={results.enrollment} />}
            </div>

            <div className="section">
              <h3>👤 Lịch sử học tập của học viên</h3>
              <input 
                type="number" 
                id="studentId" 
                defaultValue="4" 
                className="input-field"
                placeholder="Nhập Student ID"
              />
              <button className="btn" onClick={() => {
                const id = (document.getElementById('studentId') as HTMLInputElement).value;
                callApi('history', `${API_BASE}/enrollments/student/${id}/history`);
              }}>
                Lấy lịch sử
              </button>
              {results.history && <ResultDisplay result={results.history} />}
            </div>
          </div>
        )}

        {/* Module 7 */}
        {activeTab === 'module7' && (
          <div className="tab-content">
            <div className="info-box">
              <p><strong>Module 7:</strong> Quản lý giảng viên - Instructor Management</p>
              <p><strong>API Base:</strong> /api/v1/instructors</p>
            </div>

            <div className="section">
              <h3>👨‍🏫 Danh sách Giảng viên</h3>
              <button className="btn" onClick={() => callApi('instructors', `${API_BASE}/instructors?page=0&size=20`)}>
                Lấy tất cả Instructors
              </button>
              {results.instructors && <ResultDisplay result={results.instructors} />}
            </div>

            <div className="section">
              <h3>🔍 Tìm Instructor theo ID</h3>
              <input 
                type="number" 
                id="instructorId" 
                defaultValue="2" 
                className="input-field"
                placeholder="Nhập ID"
              />
              <button className="btn" onClick={() => {
                const id = (document.getElementById('instructorId') as HTMLInputElement).value;
                callApi('instructor', `${API_BASE}/instructors/${id}`);
              }}>
                Lấy Instructor
              </button>
              {results.instructor && <ResultDisplay result={results.instructor} />}
            </div>

            <div className="section">
              <h3>📊 Thống kê giảng viên</h3>
              <input 
                type="number" 
                id="instructorStatsId" 
                defaultValue="2" 
                className="input-field"
                placeholder="Nhập ID"
              />
              <button className="btn" onClick={() => {
                const id = (document.getElementById('instructorStatsId') as HTMLInputElement).value;
                callApi('instructorStats', `${API_BASE}/instructors/${id}/stats`);
              }}>
                Lấy thống kê
              </button>
              {results.instructorStats && <ResultDisplay result={results.instructorStats} />}
            </div>
          </div>
        )}

        {/* Module 8 */}
        {activeTab === 'module8' && (
          <div className="tab-content">
            <div className="info-box">
              <p><strong>Module 8:</strong> Thống kê - Báo cáo - Statistics & Reports</p>
              <p><strong>API Base:</strong> /api/v1/statistics</p>
            </div>

            <div className="section">
              <h3>📊 Dashboard Statistics</h3>
              <button className="btn" onClick={() => callApi('dashboard', `${API_BASE}/statistics/dashboard`)}>
                Lấy Dashboard Stats
              </button>
              {results.dashboard && <ResultDisplay result={results.dashboard} />}
            </div>

            <div className="section">
              <h3>📚 Thống kê Khóa học</h3>
              <button className="btn" onClick={() => callApi('courseStats', `${API_BASE}/statistics/courses`)}>
                Lấy Course Stats
              </button>
              {results.courseStats && <ResultDisplay result={results.courseStats} />}
            </div>

            <div className="section">
              <h3>💰 Thống kê Doanh thu</h3>
              <input 
                type="date" 
                id="fromDate" 
                defaultValue="2024-01-01"
                className="input-field"
              />
              <input 
                type="date" 
                id="toDate" 
                defaultValue="2024-12-31"
                className="input-field"
              />
              <button className="btn" onClick={() => {
                const from = (document.getElementById('fromDate') as HTMLInputElement).value;
                const to = (document.getElementById('toDate') as HTMLInputElement).value;
                callApi('revenue', `${API_BASE}/statistics/revenue?fromDate=${from}T00:00:00&toDate=${to}T23:59:59`);
              }}>
                Lấy Revenue Stats
              </button>
              {results.revenue && <ResultDisplay result={results.revenue} />}
            </div>

            <div className="section">
              <h3>👥 Thống kê Học viên</h3>
              <button className="btn" onClick={() => callApi('studentStats', `${API_BASE}/statistics/students`)}>
                Lấy Student Stats
              </button>
              {results.studentStats && <ResultDisplay result={results.studentStats} />}
            </div>
          </div>
        )}

        {/* Module 9 */}
        {activeTab === 'module9' && (
          <div className="tab-content">
            <div className="info-box">
              <p><strong>Module 9:</strong> Thanh toán - Chứng chỉ - Payment & Certificate</p>
              <p><strong>API Base:</strong> /api/v1/transactions, /api/v1/certificates</p>
            </div>

            <div className="section">
              <h3>💳 Danh sách Transactions</h3>
              <button className="btn" onClick={() => callApi('transactions', `${API_BASE}/transactions?page=0&size=20`)}>
                Lấy tất cả Transactions
              </button>
              {results.transactions && <ResultDisplay result={results.transactions} />}
            </div>

            <div className="section">
              <h3>🔍 Tìm Transaction theo ID</h3>
              <input 
                type="number" 
                id="transactionId" 
                defaultValue="1" 
                className="input-field"
                placeholder="Nhập ID"
              />
              <button className="btn" onClick={() => {
                const id = (document.getElementById('transactionId') as HTMLInputElement).value;
                callApi('transaction', `${API_BASE}/transactions/${id}`);
              }}>
                Lấy Transaction
              </button>
              {results.transaction && <ResultDisplay result={results.transaction} />}
            </div>

            <div className="section">
              <h3>🎓 Danh sách Certificates</h3>
              <button className="btn" onClick={() => callApi('certificates', `${API_BASE}/certificates?page=0&size=20`)}>
                Lấy tất cả Certificates
              </button>
              {results.certificates && <ResultDisplay result={results.certificates} />}
            </div>

            <div className="section">
              <h3>🔍 Tìm Certificate theo ID</h3>
              <input 
                type="number" 
                id="certificateId" 
                defaultValue="1" 
                className="input-field"
                placeholder="Nhập ID"
              />
              <button className="btn" onClick={() => {
                const id = (document.getElementById('certificateId') as HTMLInputElement).value;
                callApi('certificate', `${API_BASE}/certificates/${id}`);
              }}>
                Lấy Certificate
              </button>
              {results.certificate && <ResultDisplay result={results.certificate} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultDisplay: React.FC<{ result: ApiResult }> = ({ result }) => {
  if (result.loading) {
    return (
      <div className="result loading">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="result error">
        <pre>{JSON.stringify({ error: result.error }, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="result success">
      <pre>{JSON.stringify(result.data, null, 2)}</pre>
    </div>
  );
};

export default TestModulesPage;

