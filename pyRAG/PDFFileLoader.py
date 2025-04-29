from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer

class PDFFileLoader():
    def __init__(self, file) -> None:
        self.paragraphs = self.extract_text_from_pdf(file)
        # i = 1
        # for para in self.paragraphs[:10]:
        #     print(f"========= 第{i}段 ==========")
        #     print(para+"\n")
        #     i += 1
    
    def getParagraphs(self):
        return self.paragraphs

    ################################# 文档的加载与切割 ############################
    def extract_text_from_pdf(self, filename, page_numbers=None):
        '''从 PDF 文件中（按指定页码）提取文字'''
        paragraphs = []
        buffer = ''
        full_text = ''
        # 提取全部文本
        for i, page_layout in enumerate(extract_pages(filename)):
            # 如果指定了页码范围，跳过范围外的页
            if page_numbers is not None and i not in page_numbers:
                continue
            for element in page_layout:
                if isinstance(element, LTTextContainer):
                    full_text += element.get_text() + '\n'
        
        # 段落分割
        lines = full_text.split('。\n')
        for text in lines:
            buffer = text.replace('\n', ' ')
            
            if buffer:
                paragraphs.append(buffer)
                buffer = ''
                row_count = 0
                
        if buffer:
            paragraphs.append(buffer)
        return paragraphs

