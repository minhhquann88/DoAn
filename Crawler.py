import requests
import json
import time
import logging
from typing import List, Dict, Any

# --- CẤU HÌNH LOGGING ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [F8-CRAWLER] - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

class F8FinalCrawler:
    def __init__(self):
        self.api_url = "https://api-gateway.f8.edu.vn/api/combined-courses"
        
        # User-Agent bạn đã cung cấp
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            'Referer': 'https://f8.edu.vn/',
            'Origin': 'https://f8.edu.vn',
            'Accept': 'application/json, text/plain, */*',
        }

    def fetch_data(self) -> List[Dict]:
        logger.info(f"🚀 Đang kết nối tới API: {self.api_url}")
        try:
            time.sleep(1)
            response = requests.get(self.api_url, headers=self.headers, timeout=15)
            
            if response.status_code != 200:
                logger.error(f"❌ Lỗi HTTP: {response.status_code}")
                return []
            
            data = response.json()
            return self.process_data(data)
            
        except Exception as e:
            logger.error(f"❌ Lỗi: {e}")
            return []

    def process_data(self, api_response: Dict) -> List[Dict]:
        """
        Xử lý cấu trúc:
        {
            "free_courses": { "data": [...] },
            "pro_courses": { "data": [...] }
        }
        """
        all_courses = []
        
        # Duyệt qua các key chính (free_courses, pro_courses)
        for category_key, category_value in api_response.items():
            # Kiểm tra xem value có phải dict và có chứa 'data' không
            if isinstance(category_value, dict) and 'data' in category_value:
                courses_list = category_value['data']
                
                # Xác định tên nhóm dựa trên key
                group_name = "Miễn phí" if "free" in category_key else "Pro/Trả phí"
                
                logger.info(f"📂 Đang xử lý nhóm '{category_key}': Tìm thấy {len(courses_list)} khóa.")
                
                for course in courses_list:
                    # Trích xuất dữ liệu sạch để import Database
                    clean_course = {
                        'f8_id': course.get('id'),
                        'title': course.get('title'),
                        'slug': course.get('slug'),
                        'description': course.get('description'),
                        'price': course.get('price', 0),
                        'old_price': course.get('old_price', 0),
                        'is_pro': course.get('is_pro', False),
                        'students_count': course.get('students_count', 0),
                        'duration_text': course.get('duration_text', ''),
                        'image_url': course.get('image_url'),
                        'group': group_name
                    }
                    all_courses.append(clean_course)
        
        return all_courses

    def save_to_json(self, data: List[Dict], filename='f8_courses_final.json'):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        logger.info(f"💾 Đã lưu {len(data)} khóa học vào file: {filename}")

    def generate_sql(self, data: List[Dict], filename='import_f8.sql'):
        """Tạo file SQL để import vào database luôn cho tiện"""
        sql_lines = []
        sql_lines.append("INSERT INTO courses (title, slug, price, description, image_url, category) VALUES")
        
        values = []
        for c in data:
            # Escape dấu nháy đơn để tránh lỗi SQL
            title = c['title'].replace("'", "''")
            desc = c['description'].replace("'", "''") if c['description'] else ""
            slug = c['slug']
            price = c['price']
            img = c['image_url']
            cat = c['group']
            
            val = f"('{title}', '{slug}', {price}, '{desc}', '{img}', '{cat}')"
            values.append(val)
        
        sql_lines.append(",\n".join(values) + ";")
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("\n".join(sql_lines))
        logger.info(f"💾 Đã tạo file SQL import: {filename}")

if __name__ == "__main__":
    crawler = F8FinalCrawler()
    
    # 1. Crawl
    results = crawler.fetch_data()
    
    if results:
        # 2. In thử kết quả ra màn hình
        print("\n" + "="*60)
        print(f"🎉 TỔNG HỢP: {len(results)} KHÓA HỌC")
        print("="*60)
        print(f"{'TÊN KHÓA HỌC':<40} | {'GIÁ':<10} | {'LOẠI'}")
        print("-" * 65)
        
        for c in results:
            price_str = f"{c['price']:,}" if c['price'] > 0 else "Free"
            print(f"{c['title'][:37]+'...':<40} | {price_str:<10} | {c['group']}")
            
        # 3. Lưu JSON
        crawler.save_to_json(results)
        
        # 4. Tạo luôn SQL (Bonus)
        crawler.generate_sql(results)