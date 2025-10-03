import asyncio

import wave
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack

from aiortc import MediaStreamTrack


import asyncio
import os
import sherpa_onnx
import numpy as np
from pydub import AudioSegment
import webrtcvad  # 需要先安装：pip install webrtcvad
import base64  # 添加 base64 模块导入
import soundfile as sf

import aiohttp  # 用于发送HTTP请求
import json
import os
from datetime import datetime
from dotenv import load_dotenv


load_dotenv()  # 加载环境变量







# 智谱
ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY", "")  # 从环境变量获取API密钥
print(f"ZHIPU_API_KEY: {ZHIPU_API_KEY}")

# ASR 模型配置 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20.tar.bz2
ASR_MODEL_DIR = "./models/asr/sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20/"
ASR_ENCODER_MODEL = os.path.join(ASR_MODEL_DIR, "encoder-epoch-99-avg-1.int8.onnx")
ASR_DECODER_MODEL = os.path.join(ASR_MODEL_DIR, "decoder-epoch-99-avg-1.onnx")
ASR_JOINER_MODEL = os.path.join(ASR_MODEL_DIR, "joiner-epoch-99-avg-1.int8.onnx")
ASR_TOKENS_FILE = os.path.join(ASR_MODEL_DIR, "tokens.txt")
ASR_SAMPLE_RATE = 16000
ASR_RULE_FSTS =  os.path.join(ASR_MODEL_DIR, "itn_zh_number.fst")



#  TTS 模型配置 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-icefall-zh-aishell3.tar.bz2
TTS_MODEL_DIR = "./models/tts/vits-icefall-zh-aishell3/"
TTS_MODEL_FILE = os.path.join(TTS_MODEL_DIR, "model.onnx")
TTS_LEXICON_FILE = os.path.join(TTS_MODEL_DIR, "lexicon.txt")
TTS_TOKENS_FILE = os.path.join(TTS_MODEL_DIR, "tokens.txt")





# 初始化 WAV 文件
wave_file = wave.open("output.wav", "wb")
wave_file.setnchannels(1)        # 单声道
wave_file.setsampwidth(2)        # 16-bit PCM -> 2 字节
wave_file.setframerate(48000)    # WebRTC 默认采样率



asr_id = 0

stt_recognizer = None
tts_model = None
ACTUAL_TTS_SAMPLE_RATE = 22050 # Default, will be updated

# 1. 模型初始化与配置
"""
- ASR(语音识别)模型: sherpa-onnx-streaming-zipformer-bilingual-zh-en
- TTS(语音合成)模型: vits-icefall-zh-aishell3
- 大语言模型: 讯飞星火API
"""

try:
    if not all(os.path.exists(f) for f in [ASR_ENCODER_MODEL, ASR_DECODER_MODEL, ASR_JOINER_MODEL, ASR_TOKENS_FILE]):
        print(f"ASR 模型文件未找到，请检查路径: {ASR_MODEL_DIR}")
    else:
        stt_recognizer = sherpa_onnx.OnlineRecognizer.from_transducer(
            tokens=ASR_TOKENS_FILE,
            encoder=ASR_ENCODER_MODEL,
            decoder=ASR_DECODER_MODEL,
            joiner=ASR_JOINER_MODEL,
            debug=True,
            # rule_fsts=ASR_RULE_FSTS,
        )
        # stt_recognizer = sherpa_onnx.OnlineRecognizer.from_transducer(
        #     tokens=ASR_TOKENS_FILE,
        #     encoder=ASR_ENCODER_MODEL,
        #     decoder=ASR_DECODER_MODEL,
        #     joiner=ASR_JOINER_MODEL,
        #     num_threads=2, debug=False, decoding_method="greedy_search", max_active_paths=4
        # )
        # stt_recognizer = sherpa_onnx.OnlineRecognizer(stt_config)
        print("Sherpa-ONNX ASR 模型加载成功。")
except Exception as e:
    print(f"加载 Sherpa-ONNX ASR 模型失败: {e}")


try:
    if not all(os.path.exists(f) for f in [TTS_MODEL_FILE, TTS_LEXICON_FILE, TTS_TOKENS_FILE]):
        print(f"TTS 模型文件未找到，请检查路径: {TTS_MODEL_DIR}")
    else:
        tts_config = sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                    model=TTS_MODEL_FILE, lexicon=TTS_LEXICON_FILE, tokens=TTS_TOKENS_FILE,
                ), num_threads=1, debug=False,
            ), rule_fsts="", max_num_sentences=1,
        )
        tts_model = sherpa_onnx.OfflineTts(tts_config)
        ACTUAL_TTS_SAMPLE_RATE = tts_model.sample_rate # 获取模型实际采样率
        print(f"Sherpa-ONNX TTS 模型加载成功 (采样率: {ACTUAL_TTS_SAMPLE_RATE} Hz)。")
except Exception as e:
    print(f"加载 Sherpa-ONNX TTS 模型失败: {e}")



# 2. 星火API调用模块
"""
功能: 处理用户语音输入的文本，调用讯飞星火API获取回复
输入: 语音识别转换后的文本
输出: AI助手的回复文本
"""
async def call_zhipu_llm_api(text):
    """调用讯飞星火大模型API"""
    headers = {
        "Authorization": f"Bearer {ZHIPU_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "glm-4.5-flash",
        "messages": [
            {
                "role": "user",
                "content": text
            }
        ],
        "stream": False
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(ZHIPU_API_URL, headers=headers, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"星火API调用失败: {result}")
                    if result.get("choices") and result["choices"][0].get("message"):
                        content = result["choices"][0]["message"]["content"]
                        return content
                    else:
                        print(f"星火API调用失败: {result.get('message')}")
                        return None
                else:
                    print(f"HTTP请求失败: {response.status}")
                    return None
    except Exception as e:
        print(f"调用星火API时发生错误: {e}")
        return None



# 3. 音频处理核心类
"""
AudioTrackReceiver类
功能:
- 实时音频流接收与处理
- 语音活动检测(VAD)
- 音频数据格式转换
- ASR实时识别
- TTS语音合成
"""
class AudioTrackReceiver(MediaStreamTrack):
    kind = "audio"

    def __init__(self, track):
        super().__init__()  # don't forget this!
        self.track = track
        self.asr_stream = stt_recognizer.create_stream() if stt_recognizer else None

        self.last_audio_time = None
        self.audio_buffer = []
        self.silence_threshold = 2.0
        self.vad = webrtcvad.Vad(3)  # 灵敏度设置为3（最高）
        self.frame_duration = 30  # 每帧持续时间（毫秒）

    async def recv(self):
        global asr_id
        frame = await self.track.recv()
       
        # 在这里你可以处理帧，比如保存 PCM 数据，做识别等
       
        # try:
        #     frame = await asyncio.wait_for(self.track.recv(), timeout=10) # PyAV AudioFrame
        # except asyncio.TimeoutError:
        #     print("🔴 音频帧接收超时")
        #     return
       
        asr_stream = self.asr_stream
        if not asr_stream:
            return frame
        
        current_time = asyncio.get_event_loop().time()
        pcm_array = frame.to_ndarray()
       # 确保音频数据是16-bit PCM格式，并且是一维数组
        if pcm_array.ndim > 1:
            # 如果是多维数组，将其展平为一维
            pcm_array = pcm_array.flatten()
            
        if pcm_array.dtype != np.int16:
            pcm_array = (pcm_array * 32768).astype(np.int16)
        
        # 计算每帧所需的样本数
        samples_per_frame = int(frame.sample_rate * self.frame_duration / 1000)
        
        # 确保音频数据长度符合要求
        if len(pcm_array) < samples_per_frame:
            # 如果帧太短，用静音填充，确保padding是一维数组
            padding = np.zeros(samples_per_frame - len(pcm_array), dtype=np.int16)
            pcm_array = np.concatenate([pcm_array, padding])
        elif len(pcm_array) > samples_per_frame:
            # 如果帧太长，截取需要的长度
            pcm_array = pcm_array[:samples_per_frame]
        
        pcm_bytes = pcm_array.tobytes()

        

        # 使用VAD检测是否有语音活动
        try:
            is_speech = self.vad.is_speech(pcm_bytes, frame.sample_rate)
        except Exception as e:
            print(f"VAD处理错误: {e}")
            print(f"音频参数: 采样率={frame.sample_rate}, 帧长={len(pcm_array)}, 数据类型={pcm_array.dtype}, 维度={pcm_array.ndim}")
            is_speech = True  # 如果VAD失败，默认认为是语音

        if is_speech:
            self.last_audio_time = current_time
            # 将当前帧的音频数据添加到缓冲区
            self.audio_buffer.append({
                'data': pcm_bytes,
                'format': frame.format,
                'sample_rate': frame.sample_rate,
                'channels': len(frame.layout.channels)
            })
            wave_file.writeframes(pcm_bytes)
  # 合并缓冲区的音频数据
            combined_audio = b''.join([frame_data['data'] for frame_data in self.audio_buffer])
    

        if (current_time - (self.last_audio_time or current_time)) >= self.silence_threshold and self.audio_buffer:
            print(f"🟢 接收到音频帧: {frame.samples} samples, time={frame.time}")
            self.asr_stream = stt_recognizer.create_stream() if stt_recognizer else None
            # pcm_array = frame.to_ndarray()
            # pcm_bytes = pcm_array.tobytes()
            # wave_file.writeframes(pcm_bytes)

            # full_transcript = ""
            # # 获取音频数据并转换格式
            # plane_data_bytes = pcm_bytes
            
            # _audio = AudioSegment(
            #     data=plane_data_bytes,
            #     sample_width=frame.format.bytes,
            #     frame_rate=frame.sample_rate,
            #     channels=len(frame.layout.channels)
            # )

             # 合并缓冲区的音频数据
            combined_audio = b''.join([frame_data['data'] for frame_data in self.audio_buffer])
             # 处理合并后的音频数据
            _audio = AudioSegment(
                data=combined_audio,
                sample_width=self.audio_buffer[0]['format'].bytes,
                frame_rate=self.audio_buffer[0]['sample_rate'],
                channels=self.audio_buffer[0]['channels']
            )
            
            # 转换到ASR所需的格式
            _audio = _audio.set_frame_rate(ASR_SAMPLE_RATE).set_channels(1)
            
            # 转换为float32格式并归一化
            samples = np.array(_audio.get_array_of_samples()).astype(np.float32) / 32768.0
            
            # 送入识别器
            self.asr_stream.accept_waveform(ASR_SAMPLE_RATE, samples)
            
            # 解码当前可用的音频
            while stt_recognizer.is_ready(self.asr_stream):
                stt_recognizer.decode_stream(self.asr_stream)
            
            # 获取当前的识别结果
            result = stt_recognizer.get_result(self.asr_stream)
             # 清空缓冲区并重置识别流
            self.audio_buffer = []
            self.asr_stream = stt_recognizer.create_stream() if stt_recognizer else None
            if result:
                print(f"🔴 识别结果: {result}")
                for ws in ws_clients:
                    try:
                        # await ws.send_json({
                        #     'type': 'asr_result',
                        #     'text': result,
                        #     'id': asr_id
                        # })
                        asr_id = asr_id + 1
                        # 使用TTS生成语音
                        if tts_model:
                            response = await call_zhipu_llm_api(result)
                            if response == None :
                                print("星火API调用失败")
                                return;
                            await ws.send_json({
                                'type': 'asr_result',
                                'text': response,
                                'id': asr_id,
                            })
                            asr_id = asr_id + 1
                            audio_data = tts_model.generate(response, sid=0, speed=1.0)
                             # 将GeneratedAudio对象转换为字节
                            # audio_bytes = bytes(audio_data)
                            
                            # 保存TTS音频到WAV文件
                            tts_filename = f"tts_output.wav"
                            sf.write(
                                tts_filename,
                                audio_data.samples,
                                samplerate=audio_data.sample_rate,
                                subtype="PCM_16",
                            )
                            print(f"🎵 TTS音频已保存到: {tts_filename}")
                           # 将音频数据转换为numpy数组并进行处理
                            audio_samples = np.array(audio_data.samples, dtype=np.float32)
                            
                            # 音量增强
                            audio_samples = audio_samples * 1.5  # 增加音量
                            # 防止音频过载
                            audio_samples = np.clip(audio_samples, -1.0, 1.0)
                            
                            # 转换为16位整数格式
                            audio_samples_int16 = (audio_samples * 32767).astype(np.int16)
                            # 将处理后的音频发送到前端
                            audio_bytes = audio_samples_int16.tobytes()
                            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                            # 发送音频数据到前端
                            await ws.send_json({
                                'type': 'tts_audio',
                                'audio': audio_base64,
                                'sample_rate': audio_data.sample_rate,
                                'format': 'int16'  # 告诉前端音频格式
                            })
                        else:
                            print("TTS模型未加载")
                            # 仅发送文本结果
                            for ws in ws_clients:
                                # await ws.send_json({
                                #     'type': 'asr_result',
                                #     'text': result
                                # })

                                audio_stream = client.text_to_speech.stream(
                                    text="This is a test",
                                    voice_id="JBFqnCBsd6RMkjVDRZzb",
                                    model_id="eleven_multilingual_v2",
                                    output_format="pcm_16000",  
                                )

                                audio_chunks = []  # 存储bytes数据
                                # option 2: process the audio bytes manually
                                for chunk in audio_stream:
                                    # print(f"🔴 text_to_speech: {chunk}")
                                    if isinstance(chunk, bytes):
                                        audio_chunks.append(chunk)
                                        audio_base64 = base64.b64encode(chunk).decode('utf-8')
                                       
                                        
                                if audio_chunks:
                                    total_audio_bytes = b''.join(audio_chunks)  # 合并bytes
                                    audio_base64 = base64.b64encode(total_audio_bytes).decode('utf-8')  # 一次性编码
                                    
                                    await ws.send_json({
                                        'type': 'tts_audio',
                                        'audio': audio_base64,
                                        'format': 'mp3',  # ✅ ElevenLabs默认返回MP3
                                        'sample_rate': 16000,  # ✅ ElevenLabs默认采样率
                                        'size': len(total_audio_bytes)
                                    })
                                    print(f"🎵 发送ElevenLabs音频: {len(total_audio_bytes)} bytes")
                    except Exception as e:
                        print(f"发送WebSocket消息失败: {e}")
            # 清空缓冲区并重置识别流
            self.audio_buffer = []
            self.asr_stream = stt_recognizer.create_stream() if stt_recognizer else None
        else:
             # 处理实时音频数据
            _audio = AudioSegment(
                data=pcm_bytes,
                sample_width=frame.format.bytes,
                frame_rate=frame.sample_rate,
                channels=len(frame.layout.channels)
            )
            
            # 转换到ASR所需的格式
            _audio = _audio.set_frame_rate(ASR_SAMPLE_RATE).set_channels(1)
            
            # 转换为float32格式并归一化
            samples = np.array(_audio.get_array_of_samples()).astype(np.float32) / 32768.0
            
            # 送入识别器
            self.asr_stream.accept_waveform(ASR_SAMPLE_RATE, samples)
            
            # 解码当前可用的音频
            while stt_recognizer.is_ready(self.asr_stream):
                stt_recognizer.decode_stream(self.asr_stream)
            
            # 获取当前的识别结果
            result = stt_recognizer.get_result(self.asr_stream)
            if result:
                print(f"🔴 识别结果: {result}")
                for ws in ws_clients:
                    try:
                        await ws.send_json({
                            'type': 'asr_result_ing',
                            'text': result,
                             'id': asr_id
                        })
                    except Exception as e:
                        print(f"发送WebSocket消息失败: {e}")
        return frame

routes = web.RouteTableDef()

# 5. WebRTC信令处理
"""
功能:
- 处理WebRTC连接建立
- 音频流协商
- 会话描述协议(SDP)交换
"""
@routes.post('/offer')
async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params['sdp'], type=params['type'])

    pc = RTCPeerConnection()

    @pc.on('track')
    def on_track(track):
        print(f"🎤 收到 track: {track.kind}")
        if track.kind == 'audio':
            audio_receiver = AudioTrackReceiver(track)

            async def process_audio():
                while True:
                    try:
                        frame = await audio_receiver.recv()
                        # 可在此处理 frame，如写入文件 / 播放 / 分析
                        
                    except Exception as e:
                        print("音频流结束:", e)
                        break

            asyncio.create_task(process_audio())
        @track.on('ended')
        async def on_ended():
            print('Track ended')

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        'sdp': pc.localDescription.sdp,
        'type': pc.localDescription.type
    })

# 存储所有WebSocket连接
ws_clients = set()
# 添加WebSocket路由处理器

# 4. WebSocket通信模块
"""
功能:
- 维护WebSocket连接
- 处理实时消息传输
- 发送ASR识别结果
- 发送TTS合成音频
"""
@routes.get('/ws')
async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    
    # 添加新的WebSocket连接到集合中
    ws_clients.add(ws)
    
    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                if msg.data == 'close':
                    await ws.close()
            elif msg.type == web.WSMsgType.ERROR:
                print('ws connection closed with exception %s' % ws.exception())
    finally:
        ws_clients.remove(ws)
    
    return ws

@routes.get('/')
async def index(request):
    return web.FileResponse('./static/index.html')

app = web.Application()
app.add_routes(routes)

web.run_app(app, port=8000)