import json

# Đường dẫn file đầu vào
input_file_path = 'timestamp.json'

# Đường dẫn file đầu ra
output_file_path = 'output/timestamp.txt'

# Đọc dữ liệu JSON từ file với mã hóa UTF-8
with open(input_file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Lấy mảng timestamp
timestamps = data.get('timestamp', [])

# Mở file đầu ra để ghi kết quả
with open(output_file_path, 'w', encoding='utf-8') as f:
    for entry in timestamps:
        # Định dạng mỗi dòng thành 4 số cách nhau bởi dấu phẩy
        formatted_entry = ','.join(map(str, entry))
        # Ghi vào file
        f.write(formatted_entry + '\n')

print(f"Dữ liệu timestamp đã được ghi thành công vào {output_file_path}")
