import os
from flask import Flask, request, jsonify, send_file
import base64
import subprocess
from pypdf import PdfWriter, PdfReader
from pypdf.generic import RectangleObject
import sys

services = [
    'bing', 'google',
    'deepl', 'deeplx',
    'ollama', 'xinference',
    'openai', 'azure-openai',
    'zhipu', 'ModelScope',
    'silicon', 'gemini', 'azure',
    'tencent', 'dify', 'anythingllm',
    'argos', 'grok', 'groq',
    'deepseek', 'openailiked', 'qwen-mt'
]
class PDFTranslator:
    DEFAULT_CONFIG = {
        'port': 8888,
        'engine': 'pdf2zh',
        'service': 'bing',
        'threadNum': 4,
        'outputPath': './translated/',
        'configPath': './config.json',
        'sourceLang': 'en',
        'targetLang': 'zh'
    }

    def __init__(self):
        self.app = Flask(__name__)
        self.setup_routes()

    def setup_routes(self):
        self.app.add_url_rule('/translate', 'translate', self.translate, methods=['POST'])
        self.app.add_url_rule('/cut', 'cut', self.cut_pdf, methods=['POST'])
        self.app.add_url_rule('/compare', 'compare', self.compare, methods=['POST'])
        self.app.add_url_rule('/translatedFile/<filename>', 'download', self.download_file)

    class Config:
        def __init__(self, data):
            self.threads = data.get('threadNum') if data.get('threadNum') not in [None, ''] else PDFTranslator.DEFAULT_CONFIG['threadNum']
            self.service = data.get('service') if data.get('service') not in [None, ''] else PDFTranslator.DEFAULT_CONFIG['service']
            self.engine = data.get('engine') if data.get('engine') not in [None, ''] else PDFTranslator.DEFAULT_CONFIG['engine']
            self.outputPath = data.get('outputPath') if data.get('outputPath') not in [None, ''] else PDFTranslator.DEFAULT_CONFIG['outputPath']
            self.configPath = data.get('configPath') if data.get('configPath') not in [None, ''] else PDFTranslator.DEFAULT_CONFIG['configPath']
            self.sourceLang = data.get('sourceLang') if data.get('sourceLang') not in [None, ''] else PDFTranslator.DEFAULT_CONFIG['sourceLang']
            self.targetLang = data.get('targetLang') if data.get('targetLang') not in [None, ''] else PDFTranslator.DEFAULT_CONFIG['targetLang']

            self.babeldoc = data.get('babeldoc', False)
            self.mono_cut = data.get('mono_cut', False)
            self.dual_cut = data.get('dual_cut', False)
            self.compare = data.get('compare', False)

            self.outputPath = self.get_abs_path(self.outputPath)
            self.configPath = self.get_abs_path(self.configPath)

            os.makedirs(self.outputPath, exist_ok=True)
            if (self.engine != 'pdf2zh' or self.engine != 'EbookTranslator') and self.engine in services:
                self.engine = 'pdf2zh'
                print("[Warning - Zotero设置]: 请在Zotero设置面板中重新设置翻译engine参数为pdf2zh")
            print("[config]: ", self.__dict__)
            
        @staticmethod
        def get_abs_path(path):
            return path if os.path.isabs(path) else os.path.abspath(path)

    def process_request(self):
        data = request.get_json()
        config = self.Config(data)
        self.translated_dir = config.outputPath
        
        file_content = data.get('fileContent', '')
        if file_content.startswith('data:application/pdf;base64,'):
            file_content = file_content[len('data:application/pdf;base64,'):]
        
        input_path = os.path.join(config.outputPath, data['fileName'])
        with open(input_path, 'wb') as f:
            f.write(base64.b64decode(file_content))
        
        return input_path, config

    def translate_pdf(self, input_path, config):
        base_name = os.path.basename(input_path).replace('.pdf', '')
        output_files = {
            'mono': os.path.join(config.outputPath, f"{base_name}-mono.pdf"),
            'dual': os.path.join(config.outputPath, f"{base_name}-dual.pdf")
        }
        cmd = [
            config.engine,
            input_path,
            '--t', str(config.threads),
            '--output', config.outputPath,
            '--service', config.service,
            '--lang-in', config.sourceLang,
            '--lang-out', config.targetLang,
            '--config', config.configPath, 
            # '--skip-subset-fonts', # 如果生成pdf错误，可以尝试打开这个选项
        ]
        if config.babeldoc == True or config.babeldoc == 'true':
            cmd.append('--babeldoc')
        subprocess.run(cmd, check=True)
        if config.babeldoc == True or config.babeldoc == 'true':
            os.rename(os.path.join(config.outputPath, f"{base_name}.{config.targetLang}.mono.pdf"), output_files['mono'])
            os.rename(os.path.join(config.outputPath, f"{base_name}.{config.targetLang}.dual.pdf"), output_files['dual'])
        return output_files['mono'], output_files['dual']

    # 工具函数, 用于切割双栏pdf文件
    def split_pdf(self, input_pdf, output_pdf, compare=False, babeldoc=False):
        writer = PdfWriter()
        if ('dual' in input_pdf or compare == True) and babeldoc == False:
            readers = [PdfReader(input_pdf) for _ in range(4)]
            for i in range(0, len(readers[0].pages), 2):
                original_media_box = readers[0].pages[i].mediabox
                width = original_media_box.width
                height = original_media_box.height
                left_page_1 = readers[0].pages[i]

                offset = width/20
                ratio = 4.7
                for box in ['mediabox', 'cropbox', 'bleedbox', 'trimbox', 'artbox']:
                    setattr(left_page_1, box, RectangleObject((offset, 0, width/2+offset/ratio, height)))
                left_page_2 = readers[1].pages[i+1]
                for box in ['mediabox', 'cropbox', 'bleedbox', 'trimbox', 'artbox']:
                    setattr(left_page_2, box, RectangleObject((offset, 0, width/2+offset/ratio, height)))
                right_page_1 = readers[2].pages[i]
                for box in ['mediabox', 'cropbox', 'bleedbox', 'trimbox', 'artbox']:
                    setattr(right_page_1, box, RectangleObject((width/2-offset/ratio, 0, width-offset, height)))
                right_page_2 = readers[3].pages[i+1]
                for box in ['mediabox', 'cropbox', 'bleedbox', 'trimbox', 'artbox']:
                    setattr(right_page_2, box, RectangleObject((width/2-offset/ratio, 0, width-offset, height)))
                if compare == True:
                    blank_page_1 = writer.add_blank_page(width, height)
                    blank_page_1.merge_transformed_page(left_page_1, (1, 0, 0, 1, 0, 0))
                    blank_page_1.merge_transformed_page(left_page_2, (1, 0, 0, 1, width / 2, 0))
                    blank_page_2 = writer.add_blank_page(width, height)
                    blank_page_2.merge_transformed_page(right_page_1, (1, 0, 0, 1, -width / 2, 0))
                    blank_page_2.merge_transformed_page(right_page_2, (1, 0, 0, 1, 0, 0))
                else:
                    writer.add_page(left_page_1)
                    writer.add_page(left_page_2)
                    writer.add_page(right_page_1)
                    writer.add_page(right_page_2)
        else: 
            readers = [PdfReader(input_pdf) for _ in range(2)]
            for i in range(len(readers[0].pages)):
                page = readers[0].pages[i]

                original_media_box = page.mediabox
                width = original_media_box.width
                height = original_media_box.height

                # 8, 20 
                w_offset = width/20
                w_ratio = 4.7
                h_offset = height/20
                h_ratio = 2.5
                left_page = readers[0].pages[i]
                left_page.mediabox = RectangleObject((w_offset, h_offset, width/2+w_offset/w_ratio, height-h_offset))
                right_page = readers[1].pages[i]
                right_page.mediabox = RectangleObject((width/2-w_offset/w_ratio, h_offset, width-w_offset, height-h_offset))
                writer.add_page(left_page)
                writer.add_page(right_page)

        with open(output_pdf, "wb") as output_file:
            writer.write(output_file)

    def translate(self):
        print("\n########## translating ##########")
        try:
            input_path, config = self.process_request()
            mono, dual = self.translate_pdf(input_path, config)
            processed_files = []
            if config.mono_cut == True or config.mono_cut == "true":
                output = mono.replace('-mono.pdf', '-mono-cut.pdf')
                self.split_pdf(mono, output)
                processed_files.append(output)
            if config.dual_cut == True or config.dual_cut == "true":
                output = dual.replace('-dual.pdf', '-dual-cut.pdf')
                self.split_pdf(dual, output, False, config.babeldoc == True or config.babeldoc == "true")
                processed_files.append(output)
            if config.babeldoc == False or config.babeldoc == "false":
                if config.compare == True or config.compare == "true":
                    output = dual.replace('-dual.pdf', '-compare.pdf')
                    self.split_pdf(dual, output, compare=True, babeldoc=False)
                    processed_files.append(output)
            return jsonify({'status': 'success', 'processed': processed_files}), 200
        
        except Exception as e:
            print("[translate error]: ", e)
            return jsonify({'status': 'error', 'message': str(e)}), 500

    def cut_pdf(self):
        print("\n########## cutting ##########")
        try:
            input_path, config = self.process_request()
            output_path = input_path.replace('.pdf', '-cut.pdf')
            self.split_pdf(input_path, output_path) # 保留原逻辑
            return jsonify({'status': 'success', 'path': output_path}), 200
        except Exception as e:
            print("[cut error]: ", e)
            return jsonify({'status': 'error', 'message': str(e)}), 500

    def compare(self):
        print("\n########## compare ##########")
        try:
            input_path, config = self.process_request()
            if 'mono' in input_path:
                raise Exception('Please provide dual PDF or origial PDF for dual-comparison')
            if not 'dual' in input_path:
                _, dual = self.translate_pdf(input_path, config)
                input_path = dual
            output_path = input_path.replace('-dual.pdf', '-compare.pdf')
            self.split_pdf(input_path, output_path, compare=True)
            return jsonify({'status': 'success', 'path': output_path}), 200
        except Exception as e:
            print("[compare error]: ", e)
            return jsonify({'status': 'error', 'message': str(e)}), 500

    def download_file(self, filename):
        file_path = os.path.join(self.translated_dir, filename)
        return send_file(file_path, as_attachment=True) if os.path.exists(file_path) else ('File not found', 404)

    def run(self):
        port = int(sys.argv[1]) if len(sys.argv) > 1 else self.DEFAULT_CONFIG['port']
        self.app.run(host='0.0.0.0', port=port)

if __name__ == '__main__':
    translator = PDFTranslator()
    translator.run()