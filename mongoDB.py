from pymongo import MongoClient

class MongoDBClient:
    def __init__(self, uri, db_name):
        """
        初始化 MongoDB 客戶端。
        
        :param uri: MongoDB 連接字串
        :param db_name: 資料庫名稱
        """
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        self.user_collection = self.db['User']
    
    def insert_users(self, users):
        """
        插入多筆使用者資料到 User 表格。
        
        :param users: 使用者資料的列表
        """
        try:
            result = self.user_collection.insert_many(users)
            print(f"成功插入 {len(result.inserted_ids)} 筆資料。")
        except Exception as e:
            print(f"插入資料時出現錯誤: {e}")
    
    def find_user_by_name(self, name):
        """
        根據使用者姓名查詢使用者資料。
        
        :param name: 使用者姓名
        :return: 查詢結果
        """
        try:
            user = self.user_collection.find_one({"name": name})
            return user
        except Exception as e:
            print(f"查詢資料時出現錯誤: {e}")
    
    def list_all_users(self):
        """
        列出所有使用者資料。
        
        :return: 使用者資料的列表
        """
        try:
            users = list(self.user_collection.find())
            return users
        except Exception as e:
            print(f"查詢資料時出現錯誤: {e}")

if __name__ == "__main__":
    # 替換為您的 MongoDB 連接字串
    user_name = "test"
    password = "test"
    uri = f"mongodb+srv://{user_name}:{password}@cluster0.zp7plle.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    db_name = "DevOps_Final_Project"
    
    # 初始化客戶端
    mongo_client = MongoDBClient(uri, db_name)
    
    # 範例使用者資料
    users = [
        {"name": "張三", "email": "zhangsan@example.com", "age": 25},
        {"name": "李四", "email": "lisi@example.com", "age": 30},
        {"name": "王五", "email": "wangwu@example.com", "age": 28}
    ]
    
    # 插入使用者資料
    mongo_client.insert_users(users)
    
    # 查詢特定使用者
    user = mongo_client.find_user_by_name("李四")
    if user:
        print("查詢結果：", user)
    else:
        print("找不到該使用者。")
    
    # 列出所有使用者
    all_users = mongo_client.list_all_users()
    print("所有使用者資料：")
    for user in all_users:
        print(user)

