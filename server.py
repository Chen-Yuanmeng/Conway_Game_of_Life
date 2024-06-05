import http.server
import socketserver

# 指定端口号
PORT = 8000

# 自定义请求处理类
class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # 检查请求路径是否是要阻断的文件
        if self.path == "/initStatus.json":
            self.send_error(403, "Access to this file is forbidden")
        else:
            super().do_GET()  # 调用父类方法处理其他请求

# 使用自定义的处理器类
# Handler = CustomHTTPRequestHandler
Handler = http.server.SimpleHTTPRequestHandler

# 创建一个TCP服务器实例
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")

    # 启动服务器
    httpd.serve_forever()