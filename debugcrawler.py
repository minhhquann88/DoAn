import requests
import json
import logging

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def debug_f8_api():
    url = "https://api-gateway.f8.edu.vn/api/combined-courses"
    
    # Header giữ nguyên như cũ (vì đã connect thành công)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'Referer': 'https://f8.edu.vn/',
        'Origin': 'https://f8.edu.vn',
        'Accept': 'application/json, text/plain, */*',
    }

    print(f"🚀 Đang gọi API: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            # 1. Lưu file RAW để kiểm tra
            with open('f8_raw_debug.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            print(f"\n✅ Đã lưu dữ liệu thô vào file: f8_raw_debug.json")
            
            # 2. Phân tích nhanh cấu trúc
            print("\n🔍 PHÂN TÍCH CẤU TRÚC JSON:")
            if isinstance(data, dict):
                print(f"👉 Dữ liệu là DICT (Object). Các khóa cấp 1: {list(data.keys())}")
                if 'data' in data:
                    print(f"👉 Bên trong 'data' là kiểu: {type(data['data'])}")
            elif isinstance(data, list):
                print(f"👉 Dữ liệu là LIST (Mảng). Số lượng phần tử: {len(data)}")
                if len(data) > 0:
                    print(f"👉 Phần tử đầu tiên có các khóa: {list(data[0].keys())}")
            else:
                print("👉 Dữ liệu là kiểu lạ:", type(data))
                
        else:
            print(f"❌ Lỗi HTTP: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    debug_f8_api()