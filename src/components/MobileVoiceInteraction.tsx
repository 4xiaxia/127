import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Input,
  Slider,
  Selector,
  Card,
  Toast,
  Space,
  Badge,
} from "antd-mobile";
import {
  PlayOutline,
  SoundOutline,
  StopOutline,
  AudioOutline,
  SetOutline,
} from "antd-mobile-icons";
import { AgentA } from "../services/agentSystem";
import "../src/styles/MobileVoiceInteraction.css";

interface MobileVoiceInteractionProps {
  spotName?: string;
  onMessage?: (message: any) => void;
}

export function MobileVoiceInteraction({
  spotName = "东里村",
  onMessage,
}: MobileVoiceInteractionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      text: string;
      type: "user" | "agent";
      timestamp: number;
    }>
  >([]);
  const [voiceSettings, setVoiceSettings] = useState({
    language: "zh-CN",
    voice: "female-shaonvivi",
    speed: 1.0,
    volume: 1.0,
    pitch: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();

        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = voiceSettings.language;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");

          setInputText(transcript);

          if (event.results[0].isFinal && transcript.trim()) {
            handleSendMessage(transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("语音识别错误:", event.error);
          Toast.show({
            content: "语音识别失败，请重试",
            icon: "fail",
          });
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, [voiceSettings.language]);

  // Handle message sending
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      text: text.trim(),
      type: "user" as const,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    try {
      // 使用修复后的Agent通信系统
      const response = await AgentA.processUserRequest(text, spotName);

      const agentMessage = {
        id: `agent_${Date.now()}`,
        text: response.text || "抱歉，我暂时无法回答这个问题。",
        type: "agent" as const,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, agentMessage]);

      // 自动播放语音回复
      if (response.text && !response.error) {
        await speakText(response.text);
      }

      // 通知父组件
      if (onMessage) {
        onMessage({
          userMessage,
          agentMessage,
          response,
        });
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      Toast.show({
        content: "发送失败，请重试",
        icon: "fail",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Start/Stop Recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        Toast.show({
          content: "开始录音...",
          icon: "loading",
        });
      } catch (e) {
        console.error("Failed to start recording", e);
        Toast.show({
          content: "录音启动失败",
          icon: "fail",
        });
      }
    } else if (!recognitionRef.current) {
      Toast.show({
        content: "您的浏览器不支持语音识别",
        icon: "fail",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // TTS Logic (简化版)
  const speakText = async (text: string) => {
    try {
      setIsPlaying(true);

      // 模拟语音播放
      setTimeout(() => {
        setIsPlaying(false);
      }, 2000);
    } catch (error) {
      console.error("语音合成失败:", error);
      Toast.show({
        content: "语音播放失败",
        icon: "fail",
      });
      setIsPlaying(false);
    }
  };

  // Voice options
  const voiceOptions = [
    { label: "少女依依", value: "female-shaonvivi" },
    { label: "青涩男声", value: "male-qn-qingse" },
    { label: "精英男声", value: "male-qn-jingying" },
    { label: "御姐音", value: "female-yujie" },
    { label: "男主播", value: "presenter_male" },
    { label: "女主播", value: "presenter_female" },
  ];

  return (
    <div className="mobile-voice-interaction">
      {/* Header */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <SoundOutline
              className="text-blue-500"
              style={{ marginRight: 8 }}
            />
            <span style={{ fontWeight: "bold" }}>智能导览助手</span>
          </div>
          <Badge
            content={isRecording ? "录音中" : "就绪"}
            color={isRecording ? "danger" : "primary"}
          />
        </div>
      </Card>

      {/* Messages */}
      <div className="message-container">
        <Space direction="vertical" style={{ width: "100%" }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`message-item ${msg.type}`}>
              <div className={`message-bubble ${msg.type}`}>{msg.text}</div>
            </div>
          ))}
          {isProcessing && (
            <div className="message-item agent">
              <div className="message-bubble agent">
                <span className="typing-indicator">正在思考...</span>
              </div>
            </div>
          )}
        </Space>
      </div>

      {/* Input Section */}
      <Card>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Input
              value={inputText}
              onChange={setInputText}
              placeholder="请输入您的问题..."
              onEnterPress={() => handleSendMessage(inputText)}
              disabled={isProcessing}
              style={{ flex: 1 }}
            />
            <Button
              color="primary"
              onClick={() => handleSendMessage(inputText)}
              disabled={isProcessing || !inputText.trim()}
              loading={isProcessing}
            >
              发送
            </Button>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color={isRecording ? "danger" : "primary"}
              onClick={toggleRecording}
              disabled={isProcessing}
              loading={isRecording}
              size="large"
              block
            >
              {isRecording ? (
                <>
                  <StopOutline style={{ marginRight: 8 }} />
                  停止录音
                </>
              ) : (
                <>
                  <AudioOutline style={{ marginRight: 8 }} />
                  开始录音
                </>
              )}
            </Button>
          </div>
        </Space>
      </Card>

      {/* Voice Settings */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => setSettingsVisible(!settingsVisible)}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <SetOutline style={{ marginRight: 8 }} />
            <span>语音设置</span>
          </div>
          <span>{settingsVisible ? "收起" : "展开"}</span>
        </div>

        {settingsVisible && (
          <Space direction="vertical" style={{ width: "100%", marginTop: 16 }}>
            {/* Voice Selection */}
            <div>
              <div style={{ marginBottom: 8 }}>音色选择</div>
              <Selector
                value={[voiceSettings.voice]}
                options={voiceOptions}
                onChange={(val) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    voice: Array.isArray(val) ? val[0] : val,
                  }))
                }
              />
            </div>

            {/* Speed Control */}
            <div>
              <div style={{ marginBottom: 8 }}>
                语速:{" "}
                <span style={{ color: "#007bff" }}>{voiceSettings.speed}x</span>
              </div>
              <Slider
                value={voiceSettings.speed}
                min={0.5}
                max={2.0}
                step={0.1}
                onChange={(val) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    speed: Array.isArray(val) ? val[0] : val,
                  }))
                }
              />
            </div>

            {/* Volume Control */}
            <div>
              <div style={{ marginBottom: 8 }}>
                音量:{" "}
                <span style={{ color: "#28a745" }}>{voiceSettings.volume}</span>
              </div>
              <Slider
                value={voiceSettings.volume}
                min={0.1}
                max={2.0}
                step={0.1}
                onChange={(val) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    volume: Array.isArray(val) ? val[0] : val,
                  }))
                }
              />
            </div>

            {/* Pitch Control */}
            <div>
              <div style={{ marginBottom: 8 }}>
                音调:{" "}
                <span style={{ color: "#6f42c1" }}>{voiceSettings.pitch}</span>
              </div>
              <Slider
                value={voiceSettings.pitch}
                min={-12}
                max={12}
                step={1}
                onChange={(val) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    pitch: Array.isArray(val) ? val[0] : val,
                  }))
                }
              />
            </div>

            {/* Quick Actions */}
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                onClick={() => speakText("欢迎来到东里村，我是您的智能导游。")}
                disabled={isPlaying}
                size="small"
              >
                <PlayOutline style={{ marginRight: 4 }} />
                试听欢迎词
              </Button>
              <Button
                onClick={() =>
                  speakText(inputText || "您好，请问有什么可以帮您？")
                }
                disabled={isPlaying || !inputText.trim()}
                size="small"
              >
                <PlayOutline style={{ marginRight: 4 }} />
                试听输入
              </Button>
            </Space>
          </Space>
        )}
      </Card>
    </div>
  );
}
