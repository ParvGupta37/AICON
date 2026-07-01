"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Lightbulb, Cloud, Github, Settings, CheckCircle } from "lucide-react"

export function AIAssistantPage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      type: "assistant",
      content: "Hello! I'm your AI Compliance Assistant. How can I help you today?",
      timestamp: "10:30 AM",
    },
  ])

  const promptExamples = [
    "How do I become SOC 2 compliant?",
    "Scan my cloud infra for PCI DSS readiness",
    "What documents do I need for GDPR?",
    "Help me create an incident response plan",
  ]

  const integrations = [
    { name: "AWS", icon: Cloud, status: "connected" },
    { name: "GCP", icon: Cloud, status: "not-connected" },
    { name: "GitHub", icon: Github, status: "connected" },
  ]

  const handleSendMessage = () => {
    if (!message.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content:
            "I understand you're asking about compliance. Let me analyze your current setup and provide recommendations...",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    }, 1000)

    setMessage("")
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Compliance Assistant
        </h1>
        <p className="text-muted-foreground">Get instant compliance guidance and infrastructure analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="glass border-purple-200/20 h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                Chat with AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.type === "user" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about compliance..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="glass border-purple-200/20"
                />
                <Button onClick={handleSendMessage} className="gradient-lavender text-white" size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Prompt Examples */}
          <Card className="glass border-purple-200/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Quick Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {promptExamples.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3 glass"
                  onClick={() => setMessage(prompt)}
                >
                  <span className="text-sm">{prompt}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card className="glass border-purple-200/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Integrations
              </CardTitle>
              <CardDescription>Connect your infrastructure for deeper analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {integrations.map((integration, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <integration.icon className="w-5 h-5" />
                    <span className="font-medium">{integration.name}</span>
                  </div>
                  {integration.status === "connected" ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline">
                      Connect
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Analysis */}
          <Card className="glass border-purple-200/20">
            <CardHeader>
              <CardTitle>Recent Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "AWS S3 Security Scan", result: "3 issues found", time: "2 hours ago" },
                { title: "SOC 2 Readiness Check", result: "78% compliant", time: "1 day ago" },
                { title: "GDPR Data Mapping", result: "Complete", time: "3 days ago" },
              ].map((analysis, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">{analysis.title}</h4>
                  <p className="text-xs text-muted-foreground">{analysis.result}</p>
                  <p className="text-xs text-muted-foreground">{analysis.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
