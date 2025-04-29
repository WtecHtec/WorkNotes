# from openai import OpenAI
from langchain.embeddings import HuggingFaceBgeEmbeddings
import os
# 加载环境变量
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())  # 读取本地 .env 文件，里面定义了 OPENAI_API_KEY

# client = OpenAI()


# 加载中文embedding模型 开源模型
bge_embeddings = HuggingFaceBgeEmbeddings(model_name="BAAI/bge-large-zh-v1.5")


def get_embeddings(texts, model="text-embedding-3-small"):
    '''封装 OpenAI 的 Embedding 模型接口'''
    # print(texts)
    # print(model)
    '''open ai 提供的embedding 接口'''
    # data = client.embeddings.create(input=texts, model=model).data
    # return [x.embedding for x in data]
    '''huggingface 提供的embedding 接口'''
    data = bge_embeddings.embed_documents(texts)
    # print(data)
    return data
