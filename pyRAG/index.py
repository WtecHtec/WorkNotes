
import os
from dotenv import load_dotenv, find_dotenv

from langchain.schema.runnable import RunnableMap
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

 
from PDFFileLoader import PDFFileLoader
from Embeddings import get_embeddings
from MyVectorDBConnector import MyVectorDBConnector

_ = load_dotenv(find_dotenv()) #加载 .env文件

pdf_loader = PDFFileLoader("./a-practical-guide-to-building-agents.pdf")
# 创建一个向量数据库对象
vector_db = MyVectorDBConnector("demo", get_embeddings)
vector_db.add_documents(pdf_loader.getParagraphs())


user_query = "what is AI agent?"
results = vector_db.search(user_query, 3) # 3是指查询出最相近的3块文本
# for para in results['documents'][0]:
#     print(para+"\n\n")

#创建model
model = ChatGoogleGenerativeAI(model="gemini-1.5-flash")

#创建prompt模板
template = """
你是一个问答机器人。
你的任务是根据下述给定的已知信息回答用户问题。
确保你的回复完全依据下述已知信息。不要编造答案。
如果下述已知信息不足以回答用户的问题，可以结合你的语言大模型的能力回答。

已知信息:
{context}

用户问：
 {question}
"""
 
#由模板生成prompt
prompt = ChatPromptTemplate.from_template(template)

chain = RunnableMap({
    "context": lambda x: "\n".join(vector_db.search(x["question"], 3)['documents'][0]),
    "question": lambda x: x["question"]
}) | prompt | model | StrOutputParser()

# 添加这行代码来打印prompt的内容
print("最终的prompt内容:", prompt.invoke({"context":  "\n".join(vector_db.search(user_query, 3)['documents'][0]), "question": user_query}))

response =  chain.invoke({"question": user_query})

print("返回结果:", response)